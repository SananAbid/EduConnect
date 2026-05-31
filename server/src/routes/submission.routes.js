const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

// @route   GET /api/submissions
// @desc    Get submissions (teacher: all for their assignments; student: own)
router.get('/', async (req, res) => {
  try {
    const { assignmentId, studentId } = req.query;
    const query = {};
    if (assignmentId) query.assignment = assignmentId;
    if (req.user.role === 'student') query.student = req.user._id;
    if (studentId && req.user.role !== 'student') query.student = studentId;

    const submissions = await Submission.find(query)
      .populate('student', 'name email profilePicture')
      .populate('assignment', 'title totalMarks dueDate')
      .populate('course', 'title')
      .sort({ submittedAt: -1 });
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/submissions/:id
router.get('/:id', async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('student', 'name email')
      .populate('assignment', 'title totalMarks description dueDate')
      .populate('course', 'title');
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    if (req.user.role === 'student' && submission.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json({ submission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/submissions
// @access  Student only
router.post('/', authorize('student'), async (req, res) => {
  try {
    const { assignment: assignmentId, content, attachmentUrl } = req.body;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    const existing = await Submission.findOne({ assignment: assignmentId, student: req.user._id });
    if (existing) return res.status(400).json({ error: 'You have already submitted this assignment' });

    const isLate = new Date() > new Date(assignment.dueDate);
    const submission = await Submission.create({
      assignment: assignmentId,
      student: req.user._id,
      course: assignment.course,
      content,
      attachmentUrl,
      status: isLate ? 'late' : 'submitted'
    });
    res.status(201).json({ submission });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Already submitted' });
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/submissions/:id/grade
// @desc    Grade a submission
// @access  Teacher, Admin
router.put('/:id/grade', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    if (grade === undefined) return res.status(400).json({ error: 'Grade is required' });
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { grade, feedback, status: 'graded' },
      { new: true }
    ).populate('student', 'name email').populate('assignment', 'title totalMarks');
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    res.json({ submission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/submissions/:id
// @desc    Update own submission (student, before grading)
router.put('/:id', authorize('student'), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    if (submission.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (submission.status === 'graded') return res.status(400).json({ error: 'Cannot edit graded submission' });
    const updated = await Submission.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ submission: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
