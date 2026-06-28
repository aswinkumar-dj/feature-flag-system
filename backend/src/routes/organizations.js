const express = require('express');
const pool = require('../db/database');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Create organization (super admin only)
router.post('/', authenticate, authorizeRoles('super_admin'), async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Organization name is required' });
  }

  try {
    const existing = await pool.query('SELECT * FROM organizations WHERE name = $1', [name]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Organization already exists' });
    }

    const result = await pool.query(
      'INSERT INTO organizations (name) VALUES ($1) RETURNING *',
      [name]
    );

    res.status(201).json({
      message: 'Organization created successfully',
      org: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all organizations (super admin only)
router.get('/', authenticate, authorizeRoles('super_admin'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM organizations ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all organizations (public - for signup dropdown)
router.get('/public', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM organizations ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;