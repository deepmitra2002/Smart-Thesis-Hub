const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Student = require('../models/Student');
const Supervisor = require('../models/Supervisor');

// GET /api/users — Admin only
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(query),
    ]);
    res.json({ users, total, page: parseInt(page) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/users/:id/toggle-active — Admin
router.patch('/:id/toggle-active', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/users/:id — Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.role === 'student') await Student.findOneAndDelete({ userId: user._id });
    if (user.role === 'supervisor') await Supervisor.findOneAndDelete({ userId: user._id });
    await User.findByIdAndDelete(user._id);
    res.json({ message: 'User deleted permanently.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
