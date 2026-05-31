const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'dropped', 'completed'],
    default: 'active'
  },
  grade: {
    type: String,
    default: null
  }
}, { timestamps: true });

// Compound unique index
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
