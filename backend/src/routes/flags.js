const express = require('express');
const db = require('../db/database');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Create feature flag (org admin only)
router.post('/', authenticate, authorizeRoles('org_admin'), (req, res) => {
  const { feature_key } = req.body;
  const org_id = req.user.org_id;

  if (!feature_key) {
    return res.status(400).json({ error: 'Feature key is required' });
  }

  const existing = db.prepare(
    'SELECT * FROM feature_flags WHERE feature_key = ? AND org_id = ?'
  ).get(feature_key, org_id);

  if (existing) {
    return res.status(409).json({ error: 'Feature flag already exists' });
  }

  const result = db.prepare(
    'INSERT INTO feature_flags (org_id, feature_key, is_enabled) VALUES (?, ?, 1)'
  ).run(org_id, feature_key);

  res.status(201).json({
    message: 'Feature flag created',
    flag: { id: result.lastInsertRowid, org_id, feature_key, is_enabled: 1 }
  });
});

// Get all flags for org admin's organization
router.get('/', authenticate, authorizeRoles('org_admin'), (req, res) => {
  const org_id = req.user.org_id;

  const flags = db.prepare(
    'SELECT * FROM feature_flags WHERE org_id = ? ORDER BY created_at DESC'
  ).all(org_id);

  res.json(flags);
});

// Toggle flag (org admin only)
router.patch('/:id', authenticate, authorizeRoles('org_admin'), (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  const flag = db.prepare(
    'SELECT * FROM feature_flags WHERE id = ? AND org_id = ?'
  ).get(id, org_id);

  if (!flag) {
    return res.status(404).json({ error: 'Flag not found' });
  }

  const newStatus = flag.is_enabled === 1 ? 0 : 1;

  db.prepare(
    'UPDATE feature_flags SET is_enabled = ? WHERE id = ?'
  ).run(newStatus, id);

  res.json({ message: 'Flag updated', is_enabled: newStatus });
});

// Delete flag (org admin only)
router.delete('/:id', authenticate, authorizeRoles('org_admin'), (req, res) => {
  const { id } = req.params;
  const org_id = req.user.org_id;

  const flag = db.prepare(
    'SELECT * FROM feature_flags WHERE id = ? AND org_id = ?'
  ).get(id, org_id);

  if (!flag) {
    return res.status(404).json({ error: 'Flag not found' });
  }

  db.prepare('DELETE FROM feature_flags WHERE id = ?').run(id);

  res.json({ message: 'Flag deleted' });
});

// Check flag (end user - no auth needed)
router.get('/check', (req, res) => {
  const { feature_key, org_id } = req.query;

  if (!feature_key || !org_id) {
    return res.status(400).json({ error: 'feature_key and org_id are required' });
  }

  const flag = db.prepare(
    'SELECT * FROM feature_flags WHERE feature_key = ? AND org_id = ?'
  ).get(feature_key, org_id);

  if (!flag) {
    return res.status(404).json({ error: 'Feature flag not found' });
  }

  res.json({ feature_key, is_enabled: flag.is_enabled === 1 });
});

module.exports = router;