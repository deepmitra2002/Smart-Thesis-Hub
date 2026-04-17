const mongoose = require('mongoose');

const supervisorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  title: {
    type: String,
    enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Senior Lecturer'],
    required: true,
  },
  department: {
    type: String,
    required: true,
    enum: ['CSE', 'SWE', 'ICT', 'ICE', 'ETE', 'MCT', 'EEE', 'ME', 'TE'],
  },
  university: {
    type: String,
    default: 'Daffodil International University',
  },
  researchAreas: [{
    type: String,
    trim: true,
  }],
  publications: { type: Number, default: 0, min: 0 },
  experience: { type: Number, default: 0, min: 0 },
  bio: { type: String, maxlength: 1000 },
  phone: { type: String },
  officeRoom: { type: String },
  maxSlots: { type: Number, default: 5, min: 1, max: 20 },
  isAcceptingStudents: { type: Boolean, default: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0 },
  assignedStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  }],
  publications_list: [{
    title: String,
    journal: String,
    year: Number,
    doi: String,
  }],
  profilePic: { type: String },
}, { timestamps: true });

// Virtual: available slots
supervisorSchema.virtual('availableSlots').get(function () {
  return this.maxSlots - this.assignedStudents.length;
});

supervisorSchema.set('toJSON', { virtuals: true });
supervisorSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Supervisor', supervisorSchema);
