const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const Student = require('../models/Student');
const User = require('../models/User');

router.get('/', protect, authorize('supervisor', 'admin'), async (req, res) => {
  try {
    const { dept, supervisorId, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (dept) query.department = dept;
    if (supervisorId) query.supervisorId = supervisorId;
    if (status) query.status = status;
    const skip = (page - 1) * limit;
    const [students, total] = await Promise.all([
      Student.find(query)
        .populate('userId', 'name email profilePic')
        .populate('supervisorId')
        .sort({ createdAt: -1 })
        .skip(skip).limit(parseInt(limit)),
      Student.countDocuments(query),
    ]);
    res.json({ students, total, page: parseInt(page) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/me', protect, authorize('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id })
      .populate('userId', 'name email')
      .populate({ path: 'supervisorId', populate: { path: 'userId', select: 'name email' } })
      .populate('savedProjects');
    if (!student) return res.status(404).json({ error: 'Student profile not found.' });
    res.json({ student });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/me', protect, authorize('student'), async (req, res) => {
  try {
    const allowed = ['bio', 'interests', 'phone', 'gpa', 'thesisTitle'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const student = await Student.findOneAndUpdate({ userId: req.user._id }, updates, { new: true });
    res.json({ message: 'Profile updated.', student });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/me/save-project/:projectId', protect, authorize('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    const pid = req.params.projectId;
    const saved = student.savedProjects.includes(pid);
    if (saved) {
      student.savedProjects.pull(pid);
    } else {
      student.savedProjects.push(pid);
    }
    await student.save();
    res.json({ message: saved ? 'Project removed from saved.' : 'Project saved.', saved: !saved });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'name email profilePic')
      .populate('supervisorId');
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    res.json({ student });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
