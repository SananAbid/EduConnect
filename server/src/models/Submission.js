const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
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
  content: {
    type: String,
    required: [true, 'Submission content is required']
  },
  attachmentUrl: {
    type: String,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  grade: {
    type: Number,
    default: null,
    min: 0
  },
  feedback: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'late'],
    default: 'submitted'
  }
}, { timestamps: true });

// Compound index: one submission per student per assignment
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
