// routes/supervisors.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/supervisorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, ctrl.getSupervisors);
router.get('/:id', protect, ctrl.getSupervisorById);
router.patch('/:id', protect, authorize('supervisor', 'admin'), ctrl.updateSupervisor);
router.get('/:id/students', protect, ctrl.getAssignedStudents);
router.post('/rate-student', protect, authorize('supervisor'), ctrl.rateStudent);

module.exports = router;
