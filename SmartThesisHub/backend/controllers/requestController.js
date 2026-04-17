const { Request, Notification } = require('../models/index');
const Student = require('../models/Student');
const Supervisor = require('../models/Supervisor');
const User = require('../models/User');

// POST /api/requests  — Student sends request
exports.createRequest = async (req, res) => {
  try {
    const { supervisorId, message, researchArea, projectTitle } = req.body;

    if (!message || message.trim().length < 15) {
      return res.status(400).json({ error: 'Message must be at least 15 characters.' });
    }

    // Get student profile
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ error: 'Student profile not found.' });

    // Check if student is already assigned
    if (student.status === 'assigned') {
      return res.status(400).json({ error: 'You already have an assigned supervisor.' });
    }

    // Find supervisor
    const supervisorUser = await User.findById(supervisorId);
    if (!supervisorUser || supervisorUser.role !== 'supervisor') {
      return res.status(404).json({ error: 'Supervisor not found.' });
    }

    const supervisorProfile = await Supervisor.findOne({ userId: supervisorId });
    if (!supervisorProfile) return res.status(404).json({ error: 'Supervisor profile not found.' });

    // Check slot availability
    if (!supervisorProfile.isAcceptingStudents || supervisorProfile.availableSlots <= 0) {
      return res.status(400).json({ error: 'This supervisor is not accepting new students right now.' });
    }

    // Check for duplicate request
    const existing = await Request.findOne({
      studentId: req.user._id,
      supervisorId,
      status: { $in: ['pending', 'accepted'] },
    });
    if (existing) {
      return res.status(409).json({ error: 'You already have an active request to this supervisor.' });
    }

    const request = await Request.create({
      studentId: req.user._id,
      supervisorId,
      studentProfileId: student._id,
      supervisorProfileId: supervisorProfile._id,
      message: message.trim(),
      researchArea,
      projectTitle,
    });

    // Notify supervisor
    await Notification.create({
      userId: supervisorId,
      type: 'request_sent',
      title: 'New Student Request',
      body: `${req.user.name} has sent you a supervision request.`,
      relatedId: request._id,
      relatedModel: 'Request',
    });

    // Update student status
    await Student.findByIdAndUpdate(student._id, { status: 'pending' });

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${supervisorId}`).emit('new_notification', {
        title: 'New Student Request',
        body: `${req.user.name} sent a supervision request.`,
      });
    }

    await request.populate([
      { path: 'studentId', select: 'name email' },
      { path: 'supervisorId', select: 'name email' },
    ]);

    res.status(201).json({ message: 'Request sent successfully!', request });
  } catch (err) {
    console.error('Create request error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/requests  — Role-based list
exports.getRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};

    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    } else if (req.user.role === 'supervisor') {
      query.supervisorId = req.user._id;
    }
    // admin sees all

    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const [requests, total] = await Promise.all([
      Request.find(query)
        .populate('studentId', 'name email')
        .populate('supervisorId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Request.countDocuments(query),
    ]);

    res.json({ requests, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/requests/:id/status  — Supervisor accepts/rejects
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, supervisorNote } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "accepted" or "rejected".' });
    }

    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found.' });

    // Only the target supervisor or admin can respond
    if (req.user.role === 'supervisor' && request.supervisorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only respond to requests sent to you.' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'This request has already been responded to.' });
    }

    request.status = status;
    request.supervisorNote = supervisorNote;
    request.respondedAt = new Date();
    await request.save();

    if (status === 'accepted') {
      // Assign supervisor to student
      const sv = await Supervisor.findOne({ userId: request.supervisorId });
      const student = await Student.findOne({ userId: request.studentId });

      if (sv && student) {
        sv.assignedStudents.push(student._id);
        await sv.save();
        student.supervisorId = sv._id;
        student.status = 'assigned';
        await student.save();

        // Cancel all other pending requests from this student
        await Request.updateMany(
          { studentId: request.studentId, status: 'pending', _id: { $ne: request._id } },
          { status: 'cancelled' }
        );
      }
    } else {
      // Check if student has any other pending requests
      const otherPending = await Request.countDocuments({ studentId: request.studentId, status: 'pending' });
      if (otherPending === 0) {
        await Student.findOneAndUpdate({ userId: request.studentId }, { status: 'searching' });
      }
    }

    // Notify student
    await Notification.create({
      userId: request.studentId,
      type: status === 'accepted' ? 'request_accepted' : 'request_rejected',
      title: status === 'accepted' ? '🎉 Request Accepted!' : 'Request Rejected',
      body: status === 'accepted'
        ? `Your supervision request has been accepted! Welcome to the team.`
        : `Your request was rejected. ${supervisorNote ? 'Note: ' + supervisorNote : 'Please try another supervisor.'}`,
      relatedId: request._id,
      relatedModel: 'Request',
    });

    // Emit real-time
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${request.studentId}`).emit('request_updated', { status, requestId: request._id });
    }

    res.json({ message: `Request ${status} successfully.`, request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/requests/:id  — Student withdraws
exports.deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found.' });

    if (request.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only withdraw your own requests.' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending requests can be withdrawn.' });
    }

    request.status = 'withdrawn';
    await request.save();

    const otherPending = await Request.countDocuments({ studentId: req.user._id, status: 'pending' });
    if (otherPending === 0) {
      await Student.findOneAndUpdate({ userId: req.user._id }, { status: 'searching' });
    }

    res.json({ message: 'Request withdrawn successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
