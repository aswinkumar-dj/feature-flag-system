const express = require('express');
const pool = require('../db/database');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Check flag (end user - no auth needed) - must be before /:id routes
router.get('/check', async (req, res) => {
  const { feature_key, org_id } = req.query;

  if (!feature_key || !org_id) {
    return res.status(400).json({ error: 'feature_key and org_id are required' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM feature_flags WHERE feature_key = $1 AND org_id = $2',
      [feature_key, org_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feature flag not found' });
    }

    const flag = result.rows[0];
    res.json({ feature_key, is_enabled: flag.is_enabled });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create feature flag (org admin only)
router.post('/', authenticate, authorizeRoles('org_admin'), async (req, res) => {
  const { feature_key } = req.body;
  const org_id = req.user.org_id;

  if (!feature_key) {
    return res.status(400).json({ error: 'Feature key is required' });
  }

  try {
    const existing = await pool.query(
      'SELECT * FROM feature_flags WHERE feature_key = $1 AND org_id = $2',
      [feature_key, org_id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Feature flag already exists' });
    }

    const result = await pool.query(
      'INSERT INTO feature_flags (org_id, feature_key, is_enabled) VALUES ($1, $2, TRUE) RETURNING *',
      [org_id, feature_key]
    );

    res.status(201).json({ message: 'Feature flag created', flag: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all flags for org admin's organization
router.get('/', authenticate, authorizeRoles('org_admin'), async (req, res) => {
  const org_id = req.user.org_id;

  try {
    const result = await pool.query(
      'SELECT * FROM feature_flags WHERE org_id = $1 ORDER BY created_at DESC',
      [org_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle flag (org admin only)
router.patch('/:id', authenticate, authorizeRoles('org_admin'), async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const flag = await pool.query(
      'SELECT * FROM feature_flags WHERE id = $1 AND org_id = $2',
      [id, org_id]
    );

    if (flag.rows.length === 0) {
      return res.status(404).json({ error: 'Flag not found' });
    }

    const newStatus = !flag.rows[0].is_enabled;

    await pool.query(
      'UPDATE feature_flags SET is_enabled = $1 WHERE id = $2',
      [newStatus, id]
    );

    res.json({ message: 'Flag updated', is_enabled: newStatus });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete flag (org admin only)
router.delete('/:id', authenticate, authorizeRoles('org_admin'), async (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  try {
    const flag = await pool.query(
      'SELECT * FROM feature_flags WHERE id = $1 AND org_id = $2',
      [id, org_id]
    );

    if (flag.rows.length === 0) {
      return res.status(404).json({ error: 'Flag not found' });
    }

    await pool.query('DELETE FROM feature_flags WHERE id = $1', [id]);

    res.json({ message: 'Flag deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;