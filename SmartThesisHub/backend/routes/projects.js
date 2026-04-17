// routes/projects.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, ctrl.getProjects);
router.get('/:id', protect, ctrl.getProjectById);
router.post('/', protect, authorize('admin', 'supervisor'), ctrl.createProject);
router.patch('/:id', protect, authorize('admin', 'supervisor'), ctrl.updateProject);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteProject);

module.exports = router;
