const mongoose = require('mongoose');

// ─── REQUEST ───────────────────────────────────────
const requestSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  supervisorProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supervisor' },
  message: { type: String, required: true, minlength: 15, maxlength: 1000 },
  researchArea: { type: String, required: true },
  projectTitle: { type: String },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled', 'withdrawn'],
    default: 'pending',
  },
  supervisorNote: { type: String, maxlength: 500 },
  respondedAt: { type: Date },
}, { timestamps: true });

requestSchema.index({ studentId: 1, supervisorId: 1 });
requestSchema.index({ status: 1 });

// ─── PROJECT ────────────────────────────────────────
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, maxlength: 2000 },
  category: {
    type: String,
    required: true,
    enum: ['AI/ML', 'IoT', 'Blockchain', 'Web Dev', 'Mobile Dev', 'Cybersecurity',
           'Robotics', 'Networks', 'Big Data', 'AR/VR', 'Smart City', 'Healthcare',
           'EdTech', 'Signal Processing', 'Game Dev', 'Other'],
  },
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supervisor', required: true },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate',
  },
  availableSlots: { type: Number, default: 3, min: 0, max: 20 },
  tags: [{ type: String, trim: true }],
  views: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
}, { timestamps: true });

projectSchema.index({ category: 1 });
projectSchema.index({ supervisorId: 1 });

// ─── NOTIFICATION ───────────────────────────────────
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['request_sent', 'request_accepted', 'request_rejected', 'system', 'reminder', 'new_project'],
    required: true,
  },
  title: { type: String, required: true },
  body: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
  relatedModel: { type: String },
}, { timestamps: true });

notificationSchema.index({ userId: 1, isRead: 1 });

// ─── FEEDBACK ────────────────────────────────────────
const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String },
  email: { type: String },
  category: {
    type: String,
    enum: ['General', 'Bug Report', 'Feature Request', 'Supervisor Issue', 'Technical Problem', 'Other'],
    default: 'General',
  },
  subject: { type: String, required: true, maxlength: 200 },
  body: { type: String, required: true, maxlength: 2000 },
  rating: { type: Number, min: 1, max: 5 },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  adminResponse: { type: String },
}, { timestamps: true });

// ─── CATEGORY ────────────────────────────────────────
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  icon: { type: String, default: '📁' },
  description: { type: String },
  color: { type: String, default: 'lav' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

// ─── VIDEO RESOURCE ──────────────────────────────────
const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  youtubeUrl: { type: String, required: true },
  youtubeId: { type: String, required: true },
  thumbnail: { type: String },
  duration: { type: String },
  category: {
    type: String,
    enum: ['Research Methods', 'Tools', 'Planning', 'AI/ML', 'Programming', 'Presentation', 'Writing', 'Other'],
    default: 'Other',
  },
  views: { type: Number, default: 0 },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// ─── STUDENT RATING ──────────────────────────────────
const ratingSchema = new mongoose.Schema({
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supervisor', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 500 },
}, { timestamps: true });

ratingSchema.index({ supervisorId: 1, studentId: 1 }, { unique: true });

module.exports = {
  Request: mongoose.model('Request', requestSchema),
  Project: mongoose.model('Project', projectSchema),
  Notification: mongoose.model('Notification', notificationSchema),
  Feedback: mongoose.model('Feedback', feedbackSchema),
  Category: mongoose.model('Category', categorySchema),
  Video: mongoose.model('Video', videoSchema),
  Rating: mongoose.model('Rating', ratingSchema),
};
