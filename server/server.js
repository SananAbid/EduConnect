const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const courseRoutes = require('./src/routes/course.routes');
const assignmentRoutes = require('./src/routes/assignment.routes');
const submissionRoutes = require('./src/routes/submission.routes');
const announcementRoutes = require('./src/routes/announcement.routes');
const enrollmentRoutes = require('./src/routes/enrollment.routes');

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/enrollments', enrollmentRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'EduConnect API is running', timestamp: new Date() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 EduConnect server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
