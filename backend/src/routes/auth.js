const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/database');

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
router.post('/admin/signup', async (req, res) => {
  const { username, email, password, org_id } = req.body;

  if (!username || !email || !password || !org_id) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const org = await pool.query('SELECT * FROM organizations WHERE id = $1', [org_id]);
    if (org.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (username, email, password, role, org_id) VALUES ($1, $2, $3, 'org_admin', $4)`,
      [username, email, hashedPassword, org_id]
    );

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Org Admin Login
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND role = $2',
      [email, 'org_admin']
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, org_id: user.org_id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, org_id: user.org_id, username: user.username });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;