import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'Unauthorized' }); }
}
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
}

// GET /api/admin/users?limit=1000
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '100', 10), 1000);
  const users = await User.find()
    .select('-password -passwordHash -__v')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  res.json(users);
});


import { isValidObjectId } from 'mongoose';

// PATCH /api/admin/users/:id/role  { role: "admin" | "user" }
router.patch('/:id/role', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid user id' });
  if (!['admin', 'user'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

  // Can't remove own admin role
  const requesterId = String(req.user?._id || req.user?.id || req.user?.userId || '');
  if (requesterId === id && role !== 'admin') {
    return res.status(400).json({ error: 'Refusing to remove your own admin role' });
  }

  const updated = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  ).select('_id name email role createdAt');

  if (!updated) return res.status(404).json({ error: 'User not found' });
  return res.json(updated);
});


export default router;
