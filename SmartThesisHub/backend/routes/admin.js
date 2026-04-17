const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Student = require('../models/Student');
const Supervisor = require('../models/Supervisor');
const { Request, Project, Feedback } = require('../models/index');

// GET /api/admin/analytics
router.get('/analytics', protect, authorize('admin'), async (req, res) => {
  try {
    const [
      totalStudents, totalSupervisors, totalProjects,
      totalRequests, pendingRequests, acceptedRequests,
      openFeedback, activeUsers,
    ] = await Promise.all([
      Student.countDocuments(),
      Supervisor.countDocuments(),
      Project.countDocuments({ isActive: true }),
      Request.countDocuments(),
      Request.countDocuments({ status: 'pending' }),
      Request.countDocuments({ status: 'accepted' }),
      Feedback.countDocuments({ status: 'open' }),
      User.countDocuments({ isActive: true }),
    ]);

    // Weekly signups (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklySignups = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } },
    ]);

    const matchRate = totalRequests > 0 ? Math.round((acceptedRequests / totalRequests) * 100) : 0;

    res.json({
      stats: {
        totalStudents, totalSupervisors, totalProjects,
        totalRequests, pendingRequests, acceptedRequests,
        openFeedback, activeUsers, matchRate,
      },
      weeklySignups,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/activity-log
router.get('/activity-log', protect, authorize('admin'), async (req, res) => {
  try {
    const recentRequests = await Request.find()
      .populate('studentId', 'name')
      .populate('supervisorId', 'name')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ activities: recentRequests });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/create-user  — Admin creates user with credentials
router.post('/create-user', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, role, department, rollNo, title, accessCode } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'name, email, password and role are required.' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Email already in use.' });

    const user = await User.create({ name, email, password, role });

    if (role === 'student') {
      await Student.create({ userId: user._id, rollNo: rollNo || `DIU-${Date.now()}`, department: department || 'CSE', year: req.body.year || 1 });
    } else if (role === 'supervisor') {
      await Supervisor.create({ userId: user._id, title: title || 'Lecturer', department: department || 'CSE', university: 'Daffodil International University' });
    }

    res.status(201).json({ message: `${role} account created. Credentials: ${email} / ${password}`, user: user.toJSON() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
