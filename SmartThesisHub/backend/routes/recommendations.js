const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const Supervisor = require('../models/Supervisor');
const Student = require('../models/Student');

// GET /api/recommendations — Supervisor recommendations for logged-in student
router.get('/', protect, authorize('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ error: 'Student profile not found.' });

    const interests = student.interests || [];
    const dept = student.department;

    // Fetch all supervisors with available slots
    const allSupervisors = await Supervisor.find({ isAcceptingStudents: true })
      .populate('userId', 'name email profilePic');

    // Score each supervisor
    const scored = allSupervisors.map(sv => {
      let score = 0;

      // Same department gets high score
      if (sv.department === dept) score += 30;

      // Match research areas with student interests
      const svAreas = sv.researchAreas.map(a => a.toLowerCase());
      interests.forEach(interest => {
        svAreas.forEach(area => {
          if (area.includes(interest.toLowerCase()) || interest.toLowerCase().includes(area)) {
            score += 20;
          }
        });
      });

      // Slot availability bonus
      const available = sv.maxSlots - sv.assignedStudents.length;
      if (available >= 3) score += 15;
      else if (available >= 1) score += 8;

      // Rating bonus
      score += (sv.rating || 0) * 3;

      // Experience bonus
      score += Math.min(sv.experience, 20);

      return { supervisor: sv, score, availableSlots: available };
    });

    // Sort by score descending, take top 5
    const recommendations = scored
      .filter(s => s.availableSlots > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(s => ({ ...s.supervisor.toObject(), availableSlots: s.availableSlots, matchScore: Math.min(Math.round(s.score), 100) }));

    res.json({ recommendations, basedOn: { department: dept, interests } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
