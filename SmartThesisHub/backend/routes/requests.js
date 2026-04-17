const router = require('express').Router();
const ctrl = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('student'), ctrl.createRequest);
router.get('/', protect, ctrl.getRequests);
router.patch('/:id/status', protect, authorize('supervisor', 'admin'), ctrl.updateRequestStatus);
router.delete('/:id', protect, authorize('student'), ctrl.deleteRequest);

module.exports = router;
