/**
 * Smart Thesis Hub — Database Seeder
 * Daffodil International University
 *
 * Run: cd backend && npm run seed
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Student = require('../models/Student');
const Supervisor = require('../models/Supervisor');
const { Request, Project, Notification, Category, Video } = require('../models/index');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_thesis_hub';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}), Student.deleteMany({}), Supervisor.deleteMany({}),
      Request.deleteMany({}), Project.deleteMany({}), Notification.deleteMany({}),
      Category.deleteMany({}), Video.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // ── SUPERVISOR USERS ──────────────────────────────────────────
    const supervisorData = [
      { name: 'Dr. Md. Ariful Islam',      email: 'ariful@diu.edu.bd',   dept: 'CSE', title: 'Professor',            areas: ['Machine Learning','Deep Learning','NLP'],          exp: 18, pubs: 54, rating: 4.9, maxSlots: 5 },
      { name: 'Dr. Shawkat Ali',            email: 'shawkat@diu.edu.bd',  dept: 'CSE', title: 'Professor',            areas: ['Computer Vision','Image Processing','AI'],          exp: 16, pubs: 48, rating: 4.8, maxSlots: 5 },
      { name: 'Dr. Faisal Ahmed',           email: 'faisal@diu.edu.bd',   dept: 'SWE', title: 'Associate Professor',  areas: ['Software Engineering','Agile','Cloud Computing'],  exp: 12, pubs: 32, rating: 4.7, maxSlots: 5 },
      { name: 'Dr. Nazmun Nessa Moon',      email: 'moon@diu.edu.bd',     dept: 'CSE', title: 'Associate Professor',  areas: ['IoT','Embedded Systems','Robotics'],                exp: 11, pubs: 29, rating: 4.8, maxSlots: 4 },
      { name: 'Dr. Mohammad Shorif Uddin',  email: 'shorif@diu.edu.bd',   dept: 'ICT', title: 'Professor',            areas: ['Blockchain','Cybersecurity','Cryptography'],        exp: 20, pubs: 67, rating: 4.9, maxSlots: 5 },
      { name: 'Dr. Imran Mahmud',           email: 'imran@diu.edu.bd',    dept: 'CSE', title: 'Assistant Professor',  areas: ['Big Data','Data Mining','Cloud'],                   exp: 8,  pubs: 19, rating: 4.6, maxSlots: 4 },
      { name: 'Dr. Arafatur Rahman',        email: 'arafatur@diu.edu.bd', dept: 'ICE', title: 'Associate Professor',  areas: ['Wireless Networks','5G','Network Security'],        exp: 13, pubs: 35, rating: 4.7, maxSlots: 4 },
      { name: 'Dr. Fokhray Hossain',        email: 'fokhray@diu.edu.bd',  dept: 'MCT', title: 'Professor',            areas: ['Multimedia Systems','AR/VR','HCI'],                 exp: 15, pubs: 41, rating: 4.7, maxSlots: 5 },
      { name: 'Dr. Md. Mahbubur Rahman',    email: 'mahbubur@diu.edu.bd', dept: 'SWE', title: 'Assistant Professor',  areas: ['Mobile App Dev','React Native','Flutter'],          exp: 7,  pubs: 14, rating: 4.5, maxSlots: 4 },
      { name: 'Dr. Tanvir Ahmed',           email: 'tanvir@diu.edu.bd',   dept: 'ETE', title: 'Associate Professor',  areas: ['Signal Processing','Communication Systems','VLSI'], exp: 10, pubs: 26, rating: 4.6, maxSlots: 4 },
    ];

    const svProfiles = [];
    for (const sv of supervisorData) {
      const user = await User.create({ name: sv.name, email: sv.email, password: 'super123', role: 'supervisor' });
      const profile = await Supervisor.create({
        userId: user._id, title: sv.title, department: sv.dept,
        university: 'Daffodil International University',
        researchAreas: sv.areas, publications: sv.pubs,
        experience: sv.exp, rating: sv.rating, maxSlots: sv.maxSlots,
        phone: `+880 1711-00000${svProfiles.length + 1}`,
        bio: `${sv.title} in the Department of ${sv.dept} at Daffodil International University with ${sv.exp} years of teaching and research experience.`,
        isAcceptingStudents: true,
      });
      svProfiles.push({ user, profile, ...sv });
      console.log(`  ✓ Supervisor: ${sv.name}`);
    }

    // ── STUDENT USERS ─────────────────────────────────────────────
    const studentData = [
      { name: 'Rafiq Hasan',       email: 'rafiq@s.diu.edu.bd',    dept: 'CSE', year: 4, gpa: 3.8, roll: '191-35-1001', svIdx: 0 },
      { name: 'Sabrina Khanam',    email: 'sabrina@s.diu.edu.bd',  dept: 'CSE', year: 4, gpa: 3.7, roll: '191-35-1002', svIdx: 0 },
      { name: 'Tanvir Islam',      email: 'tanvir@s.diu.edu.bd',   dept: 'CSE', year: 4, gpa: 3.9, roll: '191-35-1003', svIdx: 0 },
      { name: 'Nadia Sultana',     email: 'nadia@s.diu.edu.bd',    dept: 'CSE', year: 3, gpa: 3.6, roll: '201-35-1004', svIdx: 1 },
      { name: 'Jubayer Ahmed',     email: 'jubayer@s.diu.edu.bd',  dept: 'CSE', year: 4, gpa: 3.5, roll: '191-35-1005', svIdx: 1 },
      { name: 'Mitu Akter',        email: 'mitu@s.diu.edu.bd',     dept: 'SWE', year: 4, gpa: 3.7, roll: '191-52-1006', svIdx: 2 },
      { name: 'Raju Mia',          email: 'raju@s.diu.edu.bd',     dept: 'SWE', year: 4, gpa: 3.4, roll: '191-52-1007', svIdx: 2 },
      { name: 'Fariha Binte Nur',  email: 'fariha@s.diu.edu.bd',   dept: 'SWE', year: 3, gpa: 3.8, roll: '201-52-1008', svIdx: 2 },
      { name: 'Shakil Mahmud',     email: 'shakil@s.diu.edu.bd',   dept: 'CSE', year: 4, gpa: 3.6, roll: '191-35-1009', svIdx: 3 },
      { name: 'Sumaiya Jannat',    email: 'sumaiya@s.diu.edu.bd',  dept: 'CSE', year: 4, gpa: 3.9, roll: '191-35-1010', svIdx: 3 },
      { name: 'Arif Billah',       email: 'arif@s.diu.edu.bd',     dept: 'ICT', year: 4, gpa: 3.7, roll: '191-40-1011', svIdx: 4 },
      { name: 'Mehrin Sultana',    email: 'mehrin@s.diu.edu.bd',   dept: 'ICT', year: 4, gpa: 3.8, roll: '191-40-1012', svIdx: 4 },
      { name: 'Zahid Hasan',       email: 'zahid2@s.diu.edu.bd',   dept: 'ICT', year: 3, gpa: 3.5, roll: '201-40-1013', svIdx: 4 },
      { name: 'Sanzida Rahman',    email: 'sanzida@s.diu.edu.bd',  dept: 'ICT', year: 4, gpa: 3.9, roll: '191-40-1014', svIdx: 4 },
      { name: 'Emon Hossain',      email: 'emon@s.diu.edu.bd',     dept: 'CSE', year: 3, gpa: 3.6, roll: '201-35-1015', svIdx: 5 },
      { name: 'Bristy Akter',      email: 'bristy@s.diu.edu.bd',   dept: 'ICE', year: 4, gpa: 3.7, roll: '191-25-1016', svIdx: 6 },
      { name: 'Shojib Rahman',     email: 'shojib@s.diu.edu.bd',   dept: 'ICE', year: 4, gpa: 3.5, roll: '191-25-1017', svIdx: 6 },
      { name: 'Keya Moni',         email: 'keya@s.diu.edu.bd',     dept: 'MCT', year: 4, gpa: 3.6, roll: '191-65-1018', svIdx: 7 },
      { name: 'Rajon Ali',         email: 'rajon@s.diu.edu.bd',    dept: 'MCT', year: 4, gpa: 3.4, roll: '191-65-1019', svIdx: 7 },
      { name: 'Priya Das',         email: 'priya@s.diu.edu.bd',    dept: 'MCT', year: 3, gpa: 3.8, roll: '201-65-1020', svIdx: 7 },
      { name: 'Sharif Hossain',    email: 'sharif@s.diu.edu.bd',   dept: 'ETE', year: 4, gpa: 3.5, roll: '191-20-1021', svIdx: 9 },
      { name: 'Nahar Mim',         email: 'nahar@s.diu.edu.bd',    dept: 'ETE', year: 4, gpa: 3.7, roll: '191-20-1022', svIdx: 9 },
    ];

    const stProfiles = [];
    for (const st of studentData) {
      const user = await User.create({ name: st.name, email: st.email, password: 'student123', role: 'student' });
      const svProfile = svProfiles[st.svIdx];
      const profile = await Student.create({
        userId: user._id, rollNo: st.roll, department: st.dept,
        year: st.year, gpa: st.gpa,
        supervisorId: svProfile.profile._id,
        status: 'assigned',
        interests: svProfile.areas.slice(0, 2),
      });
      // Update supervisor's assigned students
      await Supervisor.findByIdAndUpdate(svProfile.profile._id, { $push: { assignedStudents: profile._id } });
      stProfiles.push({ user, profile, ...st, svProfile });
      console.log(`  ✓ Student: ${st.name}`);
    }

    // ── UNASSIGNED STUDENT (demo login) ───────────────────────────
    const demoUser = await User.create({ name: 'Demo Student', email: 'demo@s.diu.edu.bd', password: 'student123', role: 'student' });
    await Student.create({ userId: demoUser._id, rollNo: '211-35-9999', department: 'CSE', year: 3, gpa: 3.5, interests: ['Machine Learning', 'Web Dev'], status: 'searching' });
    console.log('  ✓ Demo student created: demo@s.diu.edu.bd / student123');

    // ── ADMIN USER ────────────────────────────────────────────────
    await User.create({ name: 'System Administrator', email: 'admin@diu.edu.bd', password: 'admin123', role: 'admin' });
    console.log('  ✓ Admin: admin@diu.edu.bd / admin123');

    // ── CATEGORIES ────────────────────────────────────────────────
    const categories = [
      { name: 'AI/ML',             icon: '🤖', description: 'Artificial Intelligence & Machine Learning', order: 1 },
      { name: 'IoT',               icon: '📡', description: 'Internet of Things', order: 2 },
      { name: 'Blockchain',        icon: '⛓️', description: 'Blockchain & Distributed Systems', order: 3 },
      { name: 'Web Dev',           icon: '🌐', description: 'Web Application Development', order: 4 },
      { name: 'Mobile Dev',        icon: '📱', description: 'Mobile Application Development', order: 5 },
      { name: 'Cybersecurity',     icon: '🔐', description: 'Cybersecurity & Network Security', order: 6 },
      { name: 'Robotics',          icon: '🦾', description: 'Robotics & Automation', order: 7 },
      { name: 'Networks',          icon: '🕸️', description: 'Computer Networks & Communication', order: 8 },
      { name: 'Big Data',          icon: '☁️', description: 'Big Data Analytics & Cloud Computing', order: 9 },
      { name: 'AR/VR',             icon: '🥽', description: 'Augmented & Virtual Reality', order: 10 },
      { name: 'Smart City',        icon: '🏙️', description: 'Smart City & Transportation', order: 11 },
      { name: 'Healthcare',        icon: '🏥', description: 'Healthcare Technology', order: 12 },
      { name: 'EdTech',            icon: '📚', description: 'Educational Technology', order: 13 },
      { name: 'Signal Processing', icon: '📊', description: 'Signal & Image Processing', order: 14 },
      { name: 'Game Dev',          icon: '🎮', description: 'Game Development', order: 15 },
    ];
    await Category.insertMany(categories);
    console.log(`  ✓ ${categories.length} categories seeded`);

    // ── PROJECTS ──────────────────────────────────────────────────
    const sv = svProfiles;
    const projects = [
      { title: 'Bangla Sign Language Recognition using CNN',            category: 'AI/ML',            svId: sv[0].profile._id, difficulty: 'Advanced',      slots: 2, tags: ['Deep Learning','CNN','Python'],         views: 234 },
      { title: 'Fake News Detection using NLP & BERT',                  category: 'AI/ML',            svId: sv[0].profile._id, difficulty: 'Advanced',      slots: 2, tags: ['NLP','BERT','Python'],                  views: 189 },
      { title: 'Emotion Recognition from Facial Expressions',           category: 'AI/ML',            svId: sv[1].profile._id, difficulty: 'Advanced',      slots: 1, tags: ['OpenCV','CNN','TensorFlow'],             views: 210 },
      { title: 'Crop Disease Detection using Transfer Learning',        category: 'AI/ML',            svId: sv[1].profile._id, difficulty: 'Intermediate',  slots: 2, tags: ['ResNet','PyTorch','Agriculture'],        views: 167 },
      { title: 'Student Performance Prediction using ML',               category: 'AI/ML',            svId: sv[5].profile._id, difficulty: 'Intermediate',  slots: 3, tags: ['Scikit-learn','Pandas','Python'],        views: 198 },
      { title: 'Natural Language Chatbot for DIU FAQ',                  category: 'AI/ML',            svId: sv[0].profile._id, difficulty: 'Intermediate',  slots: 2, tags: ['Rasa','Python','NLP'],                   views: 254 },
      { title: 'Attendance System using Face Recognition',              category: 'AI/ML',            svId: sv[1].profile._id, difficulty: 'Intermediate',  slots: 3, tags: ['OpenCV','CNN','Python'],                 views: 267 },
      { title: 'Adaptive Learning System using RL',                     category: 'EdTech',           svId: sv[0].profile._id, difficulty: 'Advanced',      slots: 2, tags: ['Reinforcement Learning','Python'],       views: 165 },
      { title: 'Automated Essay Grading System',                        category: 'EdTech',           svId: sv[0].profile._id, difficulty: 'Advanced',      slots: 2, tags: ['NLP','BERT','Python'],                   views: 178 },
      { title: 'Speech to Bangla Text Converter',                       category: 'Signal Processing',svId: sv[0].profile._id, difficulty: 'Advanced',      slots: 2, tags: ['DSP','RNN','Python'],                    views: 212 },
      { title: 'Smart Campus Energy Management with IoT',               category: 'IoT',              svId: sv[3].profile._id, difficulty: 'Intermediate',  slots: 2, tags: ['Arduino','Raspberry Pi','MQTT'],         views: 156 },
      { title: 'Smart Home Automation using ESP32 & AI',                category: 'IoT',              svId: sv[3].profile._id, difficulty: 'Intermediate',  slots: 2, tags: ['ESP32','Node.js','MQTT'],                views: 143 },
      { title: 'IoT-based Patient Health Monitoring System',            category: 'IoT',              svId: sv[3].profile._id, difficulty: 'Advanced',      slots: 1, tags: ['Sensor','Firebase','Android'],           views: 178 },
      { title: 'Automated Irrigation System using Soil Sensors',        category: 'IoT',              svId: sv[3].profile._id, difficulty: 'Beginner',      slots: 3, tags: ['Arduino','Python','Sensors'],            views: 134 },
      { title: 'Smart Parking System with IoT & Mobile App',            category: 'Smart City',       svId: sv[3].profile._id, difficulty: 'Intermediate',  slots: 2, tags: ['IoT','Flutter','Firebase'],              views: 143 },
      { title: 'Blockchain-based Academic Certificate Verification',    category: 'Blockchain',       svId: sv[4].profile._id, difficulty: 'Advanced',      slots: 2, tags: ['Solidity','Ethereum','Web3.js'],         views: 201 },
      { title: 'Decentralized Voting System using Blockchain',          category: 'Blockchain',       svId: sv[4].profile._id, difficulty: 'Advanced',      slots: 2, tags: ['Smart Contract','React','IPFS'],         views: 175 },
      { title: 'Supply Chain Transparency with Hyperledger',            category: 'Blockchain',       svId: sv[4].profile._id, difficulty: 'Advanced',      slots: 1, tags: ['Hyperledger','Node.js','Docker'],        views: 148 },
      { title: 'University Thesis Hub Web Application (React)',         category: 'Web Dev',          svId: sv[2].profile._id, difficulty: 'Intermediate',  slots: 3, tags: ['React','Node.js','MongoDB'],             views: 298 },
      { title: 'E-Commerce Platform with AI Recommendations',          category: 'Web Dev',          svId: sv[2].profile._id, difficulty: 'Intermediate',  slots: 2, tags: ['Django','PostgreSQL','ML'],              views: 267 },
      { title: 'Online Learning Management System (LMS)',               category: 'Web Dev',          svId: sv[2].profile._id, difficulty: 'Intermediate',  slots: 2, tags: ['Laravel','Vue.js','MySQL'],             views: 231 },
      { title: 'Real-Time Collaborative Code Editor',                   category: 'Web Dev',          svId: sv[8].profile._id, difficulty: 'Advanced',      slots: 2, tags: ['WebSocket','React','Node.js'],          views: 187 },
      { title: 'Hospital Queue Management System',                      category: 'Web Dev',          svId: sv[0].profile._id, difficulty: 'Intermediate',  slots: 2, tags: ['Django','React','PostgreSQL'],          views: 213 },
      { title: 'Food Delivery App with Real-time Tracking',             category: 'Web Dev',          svId: sv[8].profile._id, difficulty: 'Beginner',      slots: 3, tags: ['Flutter','Firebase','Google Maps'],     views: 245 },
      { title: 'Telemedicine Platform for Rural Bangladesh',            category: 'Healthcare',       svId: sv[2].profile._id, difficulty: 'Intermediate',  slots: 2, tags: ['React','WebRTC','Node.js'],             views: 176 },
      { title: 'Mental Health App for University Students',             category: 'Mobile Dev',       svId: sv[8].profile._id, difficulty: 'Intermediate',  slots: 3, tags: ['Flutter','Firebase','Psychology'],      views: 198 },
      { title: 'Bangla OCR Mobile App using TensorFlow Lite',          category: 'Mobile Dev',       svId: sv[1].profile._id, difficulty: 'Advanced',      slots: 2, tags: ['Android','TensorFlow Lite','Bangla'],   views: 176 },
      { title: 'Campus Navigation App using AR',                        category: 'Mobile Dev',       svId: sv[7].profile._id, difficulty: 'Advanced',      slots: 1, tags: ['ARCore','Unity3D','Kotlin'],            views: 163 },
      { title: 'DIU Student Companion App',                             category: 'Mobile Dev',       svId: sv[8].profile._id, difficulty: 'Beginner',      slots: 4, tags: ['Flutter','REST API','Firebase'],        views: 289 },
      { title: 'Intrusion Detection System using ML',                   category: 'Cybersecurity',    svId: sv[4].profile._id, difficulty: 'Advanced',      slots: 2, tags: ['Python','Scikit-learn','Networking'],   views: 194 },
      { title: 'Phishing Website Detection using Random Forest',        category: 'Cybersecurity',    svId: sv[4].profile._id, difficulty: 'Intermediate',  slots: 2, tags: ['ML','URL Analysis','Python'],           views: 167 },
      { title: 'Secure Messaging App with End-to-End Encryption',       category: 'Cybersecurity',    svId: sv[4].profile._id, difficulty: 'Advanced',      slots: 1, tags: ['Cryptography','React Native','Node.js'], views: 143 },
      { title: 'SDN-based Network Monitoring Dashboard',                category: 'Networks',         svId: sv[6].profile._id, difficulty: 'Advanced',      slots: 2, tags: ['OpenFlow','Python','SDN'],              views: 145 },
      { title: '5G Network Performance Analysis Tool',                  category: 'Networks',         svId: sv[6].profile._id, difficulty: 'Advanced',      slots: 1, tags: ['5G','NS3','Simulation'],               views: 132 },
      { title: 'WiFi Congestion Predictor using ML',                    category: 'Networks',         svId: sv[6].profile._id, difficulty: 'Intermediate',  slots: 2, tags: ['Python','ML','Networking'],             views: 158 },
      { title: 'Autonomous Line Following Robot',                       category: 'Robotics',         svId: sv[3].profile._id, difficulty: 'Intermediate',  slots: 2, tags: ['Arduino','C++','Sensors'],             views: 178 },
      { title: 'Humanoid Robot Hand Control using EMG Signal',          category: 'Robotics',         svId: sv[9].profile._id, difficulty: 'Advanced',      slots: 1, tags: ['EMG','Arduino','Servo'],               views: 156 },
      { title: 'Drone-based Agricultural Monitoring System',            category: 'Robotics',         svId: sv[3].profile._id, difficulty: 'Advanced',      slots: 2, tags: ['Drone','OpenCV','GPS'],                views: 143 },
      { title: 'Real-time Twitter Sentiment Analysis with Spark',       category: 'Big Data',         svId: sv[5].profile._id, difficulty: 'Advanced',      slots: 2, tags: ['Spark','Kafka','Python'],               views: 187 },
      { title: 'Cloud-based Student Analytics Dashboard',               category: 'Big Data',         svId: sv[5].profile._id, difficulty: 'Intermediate',  slots: 2, tags: ['AWS','Hadoop','React'],                 views: 165 },
      { title: 'COVID-19 Data Visualization Platform',                  category: 'Big Data',         svId: sv[5].profile._id, difficulty: 'Beginner',      slots: 3, tags: ['D3.js','Python','Data Viz'],            views: 221 },
      { title: 'Virtual Campus Tour using Unity3D',                     category: 'AR/VR',            svId: sv[7].profile._id, difficulty: 'Advanced',      slots: 2, tags: ['Unity3D','VR','C#'],                    views: 198 },
      { title: 'Sign Language Interpreter using AR Glasses',            category: 'AR/VR',            svId: sv[7].profile._id, difficulty: 'Advanced',      slots: 1, tags: ['ARKit','ML','HCI'],                     views: 167 },
      { title: 'Interactive 3D Medical Visualization Tool',             category: 'AR/VR',            svId: sv[7].profile._id, difficulty: 'Advanced',      slots: 2, tags: ['Three.js','WebXR','Python'],            views: 145 },
      { title: 'EEG Signal Classification for Brain-Computer Interface',category: 'Signal Processing',svId: sv[9].profile._id, difficulty: 'Advanced',      slots: 1, tags: ['BCI','MATLAB','Deep Learning'],         views: 134 },
      { title: 'AI-based Skin Disease Diagnosis App',                   category: 'Healthcare',       svId: sv[1].profile._id, difficulty: 'Advanced',      slots: 1, tags: ['CNN','Mobile App','Healthcare'],        views: 234 },
      { title: 'Diabetes Prediction System using Ensemble ML',          category: 'Healthcare',       svId: sv[5].profile._id, difficulty: 'Intermediate',  slots: 2, tags: ['XGBoost','Python','Health'],            views: 198 },
      { title: 'Smart Traffic Light Control with Deep RL',              category: 'Smart City',       svId: sv[0].profile._id, difficulty: 'Advanced',      slots: 2, tags: ['RL','OpenCV','Simulation'],             views: 189 },
      { title: 'Public Bus Route Optimization using Genetic Algorithm', category: 'Smart City',       svId: sv[6].profile._id, difficulty: 'Intermediate',  slots: 2, tags: ['GA','Python','Maps API'],               views: 156 },
      { title: '2D Platformer Game using Unity with AI Enemies',        category: 'Game Dev',         svId: sv[7].profile._id, difficulty: 'Intermediate',  slots: 2, tags: ['Unity3D','C#','AI'],                    views: 187 },
    ];

    for (const p of projects) {
      await Project.create({ title: p.title, category: p.category, supervisorId: p.svId, difficulty: p.difficulty, availableSlots: p.slots, tags: p.tags, views: p.views });
    }
    console.log(`  ✓ ${projects.length} projects seeded`);

    // ── VIDEOS ────────────────────────────────────────────────────
    const videos = [
      { title: 'How to Write a Research Proposal — Step by Step',  youtubeUrl: 'https://www.youtube.com/watch?v=pv52sHb0bpo', youtubeId: 'pv52sHb0bpo', duration: '18:32', category: 'Research Methods', views: 12400 },
      { title: 'LaTeX for Thesis Writing — Beginners Guide',        youtubeUrl: 'https://www.youtube.com/watch?v=VhmkLrOjLsw', youtubeId: 'VhmkLrOjLsw', duration: '24:10', category: 'Tools',           views: 9830  },
      { title: 'Research Methodology — Complete Course',            youtubeUrl: 'https://www.youtube.com/watch?v=d7h6HlZo8Cc', youtubeId: 'd7h6HlZo8Cc', duration: '1:12:45',category: 'Research Methods', views: 15600 },
      { title: 'How to Choose Your Research Topic',                 youtubeUrl: 'https://www.youtube.com/watch?v=Lf2XS1ZHU04', youtubeId: 'Lf2XS1ZHU04', duration: '15:22', category: 'Planning',         views: 21040 },
      { title: 'Literature Review — How to Write Perfectly',        youtubeUrl: 'https://www.youtube.com/watch?v=hkHN7H0n52s', youtubeId: 'hkHN7H0n52s', duration: '22:08', category: 'Research Methods', views: 18760 },
      { title: 'Python for Machine Learning — Full Tutorial',       youtubeUrl: 'https://www.youtube.com/watch?v=7eh4d6sabA0', youtubeId: '7eh4d6sabA0', duration: '3:45:10',category: 'Programming',      views: 93400 },
      { title: 'Deep Learning with TensorFlow — Crash Course',      youtubeUrl: 'https://www.youtube.com/watch?v=tPYj3fFJGjk', youtubeId: 'tPYj3fFJGjk', duration: '2:30:00',category: 'AI/ML',           views: 67200 },
      { title: 'Thesis Defense Presentation Tips',                  youtubeUrl: 'https://www.youtube.com/watch?v=htb7aBqUJ3w', youtubeId: 'htb7aBqUJ3w', duration: '19:55', category: 'Presentation',     views: 18320 },
      { title: 'Git & GitHub for Research Projects',                youtubeUrl: 'https://www.youtube.com/watch?v=RGOj5yH7evk', youtubeId: 'RGOj5yH7evk', duration: '32:14', category: 'Tools',           views: 44300 },
      { title: 'How to Read Research Papers Effectively',           youtubeUrl: 'https://www.youtube.com/watch?v=SHTOI0KtZnU', youtubeId: 'SHTOI0KtZnU', duration: '11:52', category: 'Research Methods', views: 37600 },
      { title: 'Machine Learning Full Course — Stanford',           youtubeUrl: 'https://www.youtube.com/watch?v=jGwO_UgTS7I', youtubeId: 'jGwO_UgTS7I', duration: '6:12:00',category: 'AI/ML',           views: 128000},
      { title: 'Data Structures & Algorithms — Full Course',        youtubeUrl: 'https://www.youtube.com/watch?v=8hly31xKli0', youtubeId: '8hly31xKli0', duration: '5:22:00',category: 'Programming',      views: 89700 },
      { title: 'Academic Writing — How to Write Journal Papers',    youtubeUrl: 'https://www.youtube.com/watch?v=pMBQXMiLGkA', youtubeId: 'pMBQXMiLGkA', duration: '28:30', category: 'Writing',          views: 23400 },
      { title: 'React.js Full Course for Beginners',                youtubeUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8', youtubeId: 'bMknfKXIFA8', duration: '4:24:00',category: 'Programming',      views: 76500 },
      { title: 'Docker & Kubernetes — Crash Course',                youtubeUrl: 'https://www.youtube.com/watch?v=bhBSlnQcq2k', youtubeId: 'bhBSlnQcq2k', duration: '1:45:00',category: 'Tools',           views: 52300 },
    ];
    for (const v of videos) {
      await Video.create({ ...v, thumbnail: `https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg` });
    }
    console.log(`  ✓ ${videos.length} videos seeded`);

    // ── SAMPLE REQUESTS ───────────────────────────────────────────
    const demoStudent = await Student.findOne({ rollNo: '211-35-9999' });
    const demoUserDoc = await User.findOne({ email: 'demo@s.diu.edu.bd' });
    if (demoStudent && demoUserDoc) {
      await Request.create({
        studentId: demoUserDoc._id, supervisorId: svProfiles[0].user._id,
        studentProfileId: demoStudent._id, supervisorProfileId: svProfiles[0].profile._id,
        message: 'I am very interested in working on an NLP-based project for Bangla language processing. My background in Python and machine learning aligns well with your research areas.',
        researchArea: 'Machine Learning / NLP', status: 'pending',
      });
      await Notification.create({
        userId: svProfiles[0].user._id, type: 'request_sent',
        title: 'New Student Request', body: 'Demo Student has sent a supervision request.',
      });
    }

    console.log('\n✅ Database seeded successfully!\n');
    console.log('═══════════════════════════════════════════');
    console.log('  DEMO LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════════');
    console.log('  Student:    demo@s.diu.edu.bd     / student123');
    console.log('  Supervisor: ariful@diu.edu.bd     / super123  (Code: DIU@2024)');
    console.log('  Admin:      admin@diu.edu.bd      / admin123  (Code: ADMIN#DIU)');
    console.log('═══════════════════════════════════════════\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seedData();
