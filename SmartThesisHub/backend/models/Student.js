const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  rollNo: {
    type: String,
    required: [true, 'Roll number is required'],
    unique: true,
    trim: true,
  },
  department: {
    type: String,
    required: true,
    enum: ['CSE', 'SWE', 'ICT', 'ICE', 'ETE', 'MCT', 'BBA', 'EEE', 'ME', 'TE'],
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
  },
  semester: { type: Number, min: 1, max: 8 },
  gpa: {
    type: Number,
    min: 0,
    max: 4,
    default: 0,
  },
  interests: [{ type: String, trim: true }],
  bio: { type: String, maxlength: 500 },
  phone: { type: String },
  supervisorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supervisor',
    default: null,
  },
  status: {
    type: String,
    enum: ['searching', 'pending', 'assigned', 'completed'],
    default: 'searching',
  },
  savedProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  }],
  thesisTitle: { type: String },
  thesisProgress: { type: Number, min: 0, max: 100, default: 0 },
}, { timestamps: true });

studentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

module.exports = mongoose.model('Student', studentSchema);
