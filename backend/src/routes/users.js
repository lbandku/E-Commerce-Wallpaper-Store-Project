// backend/src/routes/users.js
import { Router } from 'express';
import User from '../models/User.js';
import { auth, requireAdmin } from '../middleware/auth.js';

const router = Router();

/** GET /api/users  (admin) list users */
router.get('/', auth, requireAdmin, async (_req, res) => {
  try {
    const users = await User.find().select('_id email name role createdAt');
    res.json(users);
  } catch {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

/** PATCH /api/users/:id/role  (admin) change role -> { role: "user" | "admin" } */
router.patch('/:id/role', auth, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body || {};
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true, select: '_id email name role' }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Failed to update role' });
  }
});

/** DELETE /api/users/:id  (admin) delete any user */
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: 'User not found' });
    await u.deleteOne();
    res.json({ message: 'User deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

export default router;


