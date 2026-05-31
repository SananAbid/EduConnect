const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

// @route   GET /api/announcements
router.get('/', async (req, res) => {
  try {
    const { courseId } = req.query;
    const query = { isActive: true };
    if (courseId) {
      query.$or = [{ course: courseId }, { course: null }];
    }
    if (req.user.role !== 'admin') {
      query.$or = query.$or || [{}];
      query.targetRole = { $in: ['all', req.user.role] };
    }
    const announcements = await Announcement.find(query)
      .populate('author', 'name role profilePicture')
      .populate('course', 'title')
      .sort({ createdAt: -1 });
    res.json({ announcements });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/announcements
// @access  Teacher, Admin
router.post('/', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const announcement = await Announcement.create({ ...req.body, author: req.user._id });
    await announcement.populate('author', 'name role');
    res.status(201).json({ announcement });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/announcements/:id
router.put('/:id', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ error: 'Announcement not found' });
    if (req.user.role === 'teacher' && announcement.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const updated = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ announcement: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/announcements/:id
router.delete('/:id', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ error: 'Not found' });
    if (req.user.role === 'teacher' && announcement.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await Announcement.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Announcement removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
