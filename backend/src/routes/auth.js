const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

const router = express.Router();

// Super Admin Login
router.post('/super-admin/login', (req, res) => {
  const { email, password } = req.body;

  if (
    email !== process.env.SUPER_ADMIN_EMAIL ||
    password !== process.env.SUPER_ADMIN_PASSWORD
  ) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { role: 'super_admin' },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({ token });
});

// Org Admin Signup
router.post('/admin/signup', (req, res) => {
  const { username, email, password, org_id } = req.body;

  if (!username || !email || !password || !org_id) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const org = db.prepare('SELECT * FROM organizations WHERE id = ?').get(org_id);
  if (!org) {
    return res.status(404).json({ error: 'Organization not found' });
  }

  const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (existingUser) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.prepare(`
    INSERT INTO users (username, email, password, role, org_id)
    VALUES (?, ?, ?, 'org_admin', ?)
  `).run(username, email, hashedPassword, org_id);

  res.status(201).json({ message: 'Admin registered successfully' });
});

// Org Admin Login
router.post('/admin/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ? AND role = ?').get(email, 'org_admin');
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, org_id: user.org_id },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({ token, org_id: user.org_id, username: user.username });
});

module.exports = router;