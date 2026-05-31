const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth.middleware');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['student', 'teacher']).withMessage('Invalid role')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const user = await User.create({ name, email, password, role: role || 'student' });
    const token = generateToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user and return JWT
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    if (!user.isActive) return res.status(403).json({ error: 'Account is deactivated' });

    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged-in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/auth/update-profile
// @desc    Update own profile
// @access  Private
router.put('/update-profile', protect, [
  body('name').optional().trim().isLength({ min: 2 }),
  body('bio').optional().trim()
], async (req, res) => {
  try {
    const { name, bio, profilePicture } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { ...(name && { name }), ...(bio !== undefined && { bio }), ...(profilePicture && { profilePicture }) },
      { new: true, runValidators: true }
    );
    res.json({ user: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
