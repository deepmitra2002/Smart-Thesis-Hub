const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { Category } = require('../models/index');

router.get('/', protect, async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
    res.json({ categories });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const cat = await Category.create(req.body);
    res.status(201).json({ message: 'Category created.', category: cat });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cat) return res.status(404).json({ error: 'Category not found.' });
    res.json({ message: 'Category updated.', category: cat });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Category.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Category removed.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
