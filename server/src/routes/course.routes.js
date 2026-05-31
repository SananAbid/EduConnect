const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { protect, authorize } = require('../middleware/auth.middleware');
const { body, validationResult } = require('express-validator');

router.use(protect);

// @route   GET /api/courses
// @desc    Get all courses (with filters)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { subject, teacher, search, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };
    if (subject) query.subject = subject;
    if (teacher) query.teacher = teacher;
    if (search) query.title = { $regex: search, $options: 'i' };

    // Students see only enrolled courses if ?enrolled=true
    if (req.query.enrolled === 'true' && req.user.role === 'student') {
      const enrollments = await Enrollment.find({ student: req.user._id, status: 'active' }).select('course');
      query._id = { $in: enrollments.map(e => e.course) };
    }

    // Teachers see their own courses
    if (req.user.role === 'teacher' && req.query.mine === 'true') {
      query.teacher = req.user._id;
    }

    const courses = await Course.find(query)
      .populate('teacher', 'name email profilePicture')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    const total = await Course.countDocuments(query);
    res.json({ courses, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/courses/:id
// @desc    Get single course
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'name email profilePicture bio')
      .populate('enrolledStudents', 'name email profilePicture');
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json({ course });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/courses
// @desc    Create a new course
// @access  Teacher, Admin
router.post('/', authorize('teacher', 'admin'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('gradeLevel').notEmpty().withMessage('Grade level is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const course = await Course.create({
      ...req.body,
      teacher: req.user.role === 'teacher' ? req.user._id : (req.body.teacher || req.user._id)
    });
    await course.populate('teacher', 'name email');
    res.status(201).json({ course });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Teacher (own), Admin
router.put('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (req.user.role === 'teacher' && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this course' });
    }
    if (req.user.role === 'student') return res.status(403).json({ error: 'Access denied' });
    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('teacher', 'name email');
    res.json({ course: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Teacher (own), Admin
router.delete('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (req.user.role === 'teacher' && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (req.user.role === 'student') return res.status(403).json({ error: 'Access denied' });
    await Course.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
