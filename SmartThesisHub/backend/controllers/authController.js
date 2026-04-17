const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Student = require('../models/Student');
const Supervisor = require('../models/Supervisor');
const { Notification } = require('../models/index');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
  return { accessToken, refreshToken };
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, rollNo, department, year, accessCode } = req.body;

    // Verify access codes for protected roles
    if (role === 'supervisor' && accessCode !== process.env.SUPERVISOR_ACCESS_CODE) {
      return res.status(403).json({ error: 'Invalid supervisor access code. Contact your admin.' });
    }
    if (role === 'admin' && accessCode !== process.env.ADMIN_ACCESS_CODE) {
      return res.status(403).json({ error: 'Invalid admin access code.' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Create base user
    const user = await User.create({ name, email, password, role });

    // Create role-specific profile
    if (role === 'student') {
      // Check roll number uniqueness
      const existingRoll = await Student.findOne({ rollNo });
      if (existingRoll) return res.status(409).json({ error: 'Roll number already registered.' });

      await Student.create({
        userId: user._id,
        rollNo,
        department: department || 'CSE',
        year: year || 1,
        interests: req.body.interests || [],
      });
    } else if (role === 'supervisor') {
      await Supervisor.create({
        userId: user._id,
        title: req.body.title || 'Lecturer',
        department: department || 'CSE',
        researchAreas: req.body.researchAreas || [],
        university: 'Daffodil International University',
      });
    }

    // Welcome notification
    await Notification.create({
      userId: user._id,
      type: 'system',
      title: 'Welcome to Smart Thesis Hub!',
      body: `Welcome ${name}! Start exploring supervisors and project ideas at DIU.`,
    });

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.status(201).json({
      message: 'Registration successful!',
      token: accessToken,
      refreshToken,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message || 'Server error during registration' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password, role, accessCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password.' });

    // Verify role matches
    if (role && user.role !== role) {
      return res.status(403).json({ error: `This account is registered as "${user.role}", not "${role}".` });
    }

    // Verify access codes
    if (user.role === 'supervisor' && accessCode !== process.env.SUPERVISOR_ACCESS_CODE) {
      return res.status(403).json({ error: 'Invalid supervisor access code.' });
    }
    if (user.role === 'admin' && accessCode !== process.env.ADMIN_ACCESS_CODE) {
      return res.status(403).json({ error: 'Invalid admin access code.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Your account has been deactivated. Contact admin.' });
    }

    // Update last login
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    // Get profile data
    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({ userId: user._id });
    } else if (user.role === 'supervisor') {
      profile = await Supervisor.findOne({ userId: user._id });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.json({
      message: 'Login successful!',
      token: accessToken,
      refreshToken,
      user: user.toJSON(),
      profile,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// POST /api/auth/refresh
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required.' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid refresh token.' });

    const tokens = generateTokens(user._id);
    res.json({ token: tokens.accessToken, refreshToken: tokens.refreshToken });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired refresh token.' });
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  res.json({ message: 'Logged out successfully.' });
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    let profile = null;
    if (req.user.role === 'student') {
      profile = await Student.findOne({ userId: req.user._id }).populate('supervisorId');
    } else if (req.user.role === 'supervisor') {
      profile = await Supervisor.findOne({ userId: req.user._id }).populate('assignedStudents');
    }
    res.json({ user: req.user, profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
