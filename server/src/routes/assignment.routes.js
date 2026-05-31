const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth.middleware');
const { body, validationResult } = require('express-validator');

router.use(protect);

// @route   GET /api/assignments
// @desc    Get assignments (filtered by course)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { courseId } = req.query;
    const query = {};
    if (courseId) query.course = courseId;
    if (req.user.role === 'student') query.isPublished = true;
    if (req.user.role === 'teacher') query.teacher = req.user._id;

    const assignments = await Assignment.find(query)
      .populate('course', 'title subject')
      .populate('teacher', 'name')
      .sort({ dueDate: 1 });
    res.json({ assignments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/assignments/:id
router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title subject')
      .populate('teacher', 'name email');
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    res.json({ assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/assignments
// @access  Teacher, Admin
router.post('/', authorize('teacher', 'admin'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('course').notEmpty().withMessage('Course is required'),
  body('dueDate').isISO8601().withMessage('Valid due date required'),
  body('totalMarks').isNumeric().withMessage('Total marks must be a number'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const course = await Course.findById(req.body.course);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (req.user.role === 'teacher' && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized for this course' });
    }
    const assignment = await Assignment.create({ ...req.body, teacher: req.user._id });
    res.status(201).json({ assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/assignments/:id
router.put('/:id', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    if (req.user.role === 'teacher' && assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const updated = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ assignment: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/assignments/:id
router.delete('/:id', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    if (req.user.role === 'teacher' && assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
