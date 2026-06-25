const express = require('express');
const db = require('../db/database');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Create organization (super admin only)
router.post('/', authenticate, authorizeRoles('super_admin'), (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Organization name is required' });
  }

  const existing = db.prepare('SELECT * FROM organizations WHERE name = ?').get(name);
  if (existing) {
    return res.status(409).json({ error: 'Organization already exists' });
  }

  const result = db.prepare('INSERT INTO organizations (name) VALUES (?)').run(name);

  res.status(201).json({ 
    message: 'Organization created successfully',
    org: { id: result.lastInsertRowid, name }
  });
});

// Get all organizations (super admin only)
router.get('/', authenticate, authorizeRoles('super_admin'), (req, res) => {
  const orgs = db.prepare('SELECT * FROM organizations ORDER BY created_at DESC').all();
  res.json(orgs);
});

// Get all organizations (public - for signup dropdown)
router.get('/public', (req, res) => {
  const orgs = db.prepare('SELECT id, name FROM organizations ORDER BY name ASC').all();
  res.json(orgs);
});

module.exports = router;