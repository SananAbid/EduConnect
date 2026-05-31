const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Course description is required']
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    enum: ['Mathematics', 'Science', 'English', 'History', 'Computer Science', 'Art', 'Music', 'Physical Education', 'Other']
  },
  gradeLevel: {
    type: String,
    required: true
  },
  schedule: {
    type: String,
    default: ''
  },
  maxStudents: {
    type: Number,
    default: 30
  },
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  thumbnail: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Virtual for enrolled count
courseSchema.virtual('enrollmentCount').get(function() {
  return this.enrolledStudents.length;
});

module.exports = mongoose.model('Course', courseSchema);
