const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

// @route   GET /api/enrollments
router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'student') query.student = req.user._id;
    const { courseId } = req.query;
    if (courseId) query.course = courseId;

    const enrollments = await Enrollment.find(query)
      .populate('course', 'title subject teacher gradeLevel thumbnail')
      .populate('student', 'name email profilePicture')
      .sort({ enrolledAt: -1 });
    res.json({ enrollments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/enrollments
// @desc    Enroll student in a course
// @access  Student
router.post('/', authorize('student'), async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (!course.isActive) return res.status(400).json({ error: 'Course is not active' });
    if (course.enrolledStudents.length >= course.maxStudents) {
      return res.status(400).json({ error: 'Course is full' });
    }

    const existing = await Enrollment.findOne({ student: req.user._id, course: courseId });
    if (existing) return res.status(400).json({ error: 'Already enrolled in this course' });

    const enrollment = await Enrollment.create({ student: req.user._id, course: courseId });
    await Course.findByIdAndUpdate(courseId, { $addToSet: { enrolledStudents: req.user._id } });
    res.status(201).json({ enrollment, message: 'Enrolled successfully' });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Already enrolled' });
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/enrollments/:courseId
// @desc    Drop/unenroll from course
// @access  Student
router.delete('/:courseId', authorize('student'), async (req, res) => {
  try {
    const enrollment = await Enrollment.findOneAndUpdate(
      { student: req.user._id, course: req.params.courseId },
      { status: 'dropped' },
      { new: true }
    );
    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
    await Course.findByIdAndUpdate(req.params.courseId, { $pull: { enrolledStudents: req.user._id } });
    res.json({ message: 'Successfully dropped course' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/enrollments/check/:courseId
// @desc    Check if current user is enrolled
router.get('/check/:courseId', authorize('student'), async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId,
      status: 'active'
    });
    res.json({ isEnrolled: !!enrollment, enrollment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
