const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Admin
router.get('/', authorize('admin'), async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    const total = await User.countDocuments(query);
    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/users/teachers
// @desc    Get all teachers (students can see, for enrollment)
// @access  Private
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher', isActive: true }).select('name email bio profilePicture');
    res.json({ teachers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Admin or self
router.get('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user (admin can change role/status)
// @access  Admin
router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const { name, email, role, isActive, bio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...(name && { name }), ...(email && { email }), ...(role && { role }), ...(isActive !== undefined && { isActive }), ...(bio !== undefined && { bio }) },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/users/:id
// @desc    Deactivate user (admin only)
// @access  Admin
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deactivated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
