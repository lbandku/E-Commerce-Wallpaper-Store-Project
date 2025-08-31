// backend/src/routes/auth.js
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { auth as requireAuth } from '../middleware/auth.js';

const router = Router();

// helper to sign a JWT with the fields we need on the client
function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * POST /api/auth/register
 * body: { email, name, password, role? }
 * role is optional; defaults to "user"
 */
router.post('/register', async (req, res) => {
  try {
    const { email, name, password, role } = req.body || {};
    if (!email || !name || !password) {
      return res.status(400).json({ message: 'email, name, and password are required' });
    }
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ message: 'Email already in use' });

    const user = await User.create({ email, name, password, role });
    const token = signToken(user);

    return res.status(201).json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error('REGISTER error', err);
    return res.status(500).json({ message: 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 * body: { email, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    return res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error('LOGIN error', err);
    return res.status(500).json({ message: 'Login failed' });
  }
});

/**
 * GET /api/auth/me
 * header: Authorization: Bearer <token>
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('_id email name role createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (err) {
    console.error('ME error', err);
    return res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

export default router;
