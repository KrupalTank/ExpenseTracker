const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// 1. REGISTER USER
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    // Check if user exists
    const userCheck = await db.query('SELECT * FROM users WHERE username = $1', [username.trim().toLowerCase()]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const newUser = await db.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at',
      [username.trim().toLowerCase(), passwordHash]
    );

    const user = newUser.rows[0];

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' } // 30 days token for mobile convenience
    );

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// 2. LOGIN USER
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const userResult = await db.query('SELECT * FROM users WHERE username = $1', [username.trim().toLowerCase()]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = userResult.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate Token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Login successful.',
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// 3. VERIFY TOKEN (Used for persistent auto-login on app load)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userResult = await db.query('SELECT id, username, created_at FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ user: userResult.rows[0] });
  } catch (err) {
    console.error('Verify token error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;