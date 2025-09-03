import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

// If you already have requireAuth/requireAdmin middleware, import those and delete these:
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

export default router;
