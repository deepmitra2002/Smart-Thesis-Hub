const { Project, Category } = require('../models/index');
const Supervisor = require('../models/Supervisor');

// GET /api/projects
exports.getProjects = async (req, res) => {
  try {
    const { category, difficulty, supervisorId, search, page = 1, limit = 20, hasSlots } = req.query;
    const query = { isActive: true };

    if (category && category !== 'All') query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (supervisorId) query.supervisorId = supervisorId;
    if (hasSlots === 'true') query.availableSlots = { $gt: 0 };
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];

    const skip = (page - 1) * limit;
    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate({ path: 'supervisorId', populate: { path: 'userId', select: 'name' } })
        .sort({ views: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Project.countDocuments(query),
    ]);

    res.json({ projects, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/projects/:id
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate({ path: 'supervisorId', populate: { path: 'userId', select: 'name email' } });

    if (!project) return res.status(404).json({ error: 'Project not found.' });
    res.json({ project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/projects — Admin only
exports.createProject = async (req, res) => {
  try {
    const { title, description, category, supervisorId, difficulty, availableSlots, tags } = req.body;
    if (!title || !category || !supervisorId) {
      return res.status(400).json({ error: 'Title, category, and supervisorId are required.' });
    }

    const sv = await Supervisor.findById(supervisorId);
    if (!sv) return res.status(404).json({ error: 'Supervisor not found.' });

    const project = await Project.create({
      title, description, category, supervisorId, difficulty, availableSlots, tags,
    });

    await project.populate({ path: 'supervisorId', populate: { path: 'userId', select: 'name' } });
    res.status(201).json({ message: 'Project created.', project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/projects/:id
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    res.json({ message: 'Project updated.', project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/projects/:id
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    res.json({ message: 'Project removed.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
