const Supervisor = require('../models/Supervisor');
const Student = require('../models/Student');
const User = require('../models/User');
const { Rating } = require('../models/index');

// GET /api/supervisors
exports.getSupervisors = async (req, res) => {
  try {
    const { dept, area, hasSlots, minExp, minRating, page = 1, limit = 20, search } = req.query;
    const query = {};

    if (dept) query.department = dept;
    if (minExp) query.experience = { $gte: parseInt(minExp) };
    if (minRating) query.rating = { $gte: parseFloat(minRating) };
    if (hasSlots === 'true') query.isAcceptingStudents = true;
    if (area) query.researchAreas = { $regex: area, $options: 'i' };

    let supervisors = Supervisor.find(query).populate('userId', 'name email profilePic');

    if (search) {
      const userIds = await User.find({
        name: { $regex: search, $options: 'i' },
        role: 'supervisor',
      }).select('_id');
      query.$or = [
        { userId: { $in: userIds.map(u => u._id) } },
        { researchAreas: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [results, total] = await Promise.all([
      Supervisor.find(query)
        .populate('userId', 'name email profilePic')
        .sort({ rating: -1, experience: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Supervisor.countDocuments(query),
    ]);

    res.json({ supervisors: results, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/supervisors/:id
exports.getSupervisorById = async (req, res) => {
  try {
    const sv = await Supervisor.findById(req.params.id)
      .populate('userId', 'name email profilePic createdAt')
      .populate({ path: 'assignedStudents', populate: { path: 'userId', select: 'name email' } });

    if (!sv) return res.status(404).json({ error: 'Supervisor not found.' });
    res.json({ supervisor: sv });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/supervisors/:id
exports.updateSupervisor = async (req, res) => {
  try {
    const allowed = ['bio', 'researchAreas', 'maxSlots', 'isAcceptingStudents',
                     'publications', 'experience', 'phone', 'officeRoom', 'title'];
    const updates = {};
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    const sv = await Supervisor.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!sv) return res.status(404).json({ error: 'Supervisor not found.' });
    res.json({ message: 'Profile updated.', supervisor: sv });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/supervisors/:id/rate — Rate a student
exports.rateStudent = async (req, res) => {
  try {
    const { studentId, rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1–5.' });

    const sv = await Supervisor.findOne({ userId: req.user._id });
    if (!sv) return res.status(404).json({ error: 'Supervisor profile not found.' });

    const ratingDoc = await Rating.findOneAndUpdate(
      { supervisorId: sv._id, studentId },
      { rating, comment },
      { upsert: true, new: true }
    );

    // Recalculate supervisor average rating
    const ratings = await Rating.find({ supervisorId: sv._id });
    const avg = ratings.reduce((a, r) => a + r.rating, 0) / ratings.length;
    await Supervisor.findByIdAndUpdate(sv._id, { rating: Math.round(avg * 10) / 10, ratingCount: ratings.length });

    res.json({ message: 'Rating saved.', rating: ratingDoc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/supervisors/:id/students
exports.getAssignedStudents = async (req, res) => {
  try {
    const sv = await Supervisor.findById(req.params.id).populate({
      path: 'assignedStudents',
      populate: { path: 'userId', select: 'name email' },
    });
    if (!sv) return res.status(404).json({ error: 'Supervisor not found.' });
    res.json({ students: sv.assignedStudents });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
