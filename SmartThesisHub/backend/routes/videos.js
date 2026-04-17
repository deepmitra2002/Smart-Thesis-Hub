const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { Video } = require('../models/index');

router.get('/', protect, async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    if (category && category !== 'All') query.category = category;
    const videos = await Video.find(query).sort({ views: -1, createdAt: -1 });
    res.json({ videos });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { youtubeUrl } = req.body;
    const match = youtubeUrl.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
    const youtubeId = match ? match[1] : '';
    const thumbnail = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
    const video = await Video.create({ ...req.body, youtubeId, thumbnail, addedBy: req.user._id });
    res.status(201).json({ message: 'Video added.', video });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id/view', protect, async (req, res) => {
  try {
    await Video.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ message: 'View counted.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Video.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Video removed.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
