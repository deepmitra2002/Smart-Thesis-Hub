const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { Feedback } = require('../models/index');

// POST /api/feedback
router.post('/', protect, async (req, res) => {
  try {
    const { category, subject, body, rating } = req.body;
    if (!subject || !body) return res.status(400).json({ error: 'Subject and body are required.' });
    const fb = await Feedback.create({
      userId: req.user._id, name: req.user.name, email: req.user.email,
      category, subject, body, rating,
    });
    res.status(201).json({ message: 'Feedback submitted. Thank you!', feedback: fb });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/feedback — Admin only
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const skip = (page - 1) * limit;
    const [feedbacks, total] = await Promise.all([
      Feedback.find(query).populate('userId', 'name email role').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Feedback.countDocuments(query),
    ]);
    res.json({ feedbacks, total, page: parseInt(page) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/feedback/:id — Admin responds
router.patch('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    const fb = await Feedback.findByIdAndUpdate(req.params.id, { status, adminResponse }, { new: true });
    if (!fb) return res.status(404).json({ error: 'Feedback not found.' });
    res.json({ message: 'Feedback updated.', feedback: fb });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
