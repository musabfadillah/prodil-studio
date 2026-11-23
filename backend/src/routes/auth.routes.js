import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { sendVerificationEmail } from '../utils/email.js';
import { authenticateToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate random 6 digit numeric code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * POST /api/auth/register
 */
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    if (db.getDbStatus().postgresConnected) {
      const existing = await db.query('SELECT id, is_verified FROM users WHERE email = $1', [normalizedEmail]);
      if (existing && existing.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah terdaftar. Silakan login atau gunakan email lain.'
        });
      }
    } else {
      const existing = db.localStore.users.find(u => u.email === normalizedEmail);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah terdaftar. Silakan login atau gunakan email lain.'
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    let newUser = null;

    if (db.getDbStatus().postgresConnected) {
      const insertUser = await db.query(
        `INSERT INTO users (email, password_hash, full_name, is_verified)
         VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, is_verified, created_at`,
        [normalizedEmail, passwordHash, fullName || normalizedEmail.split('@')[0], false]
      );
      newUser = insertUser.rows[0];

      // Save verification token
      await db.query(
        `INSERT INTO verification_tokens (user_id, token, code, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [newUser.id, verificationCode, verificationCode, expiresAt]
      );
    } else {
      // Local Store
      const newId = db.localStore.users.length + 1;
      newUser = {
        id: newId,
        email: normalizedEmail,
        password_hash: passwordHash,
        full_name: fullName || normalizedEmail.split('@')[0],
        avatar_url: null,
        is_verified: false,
        created_at: new Date().toISOString()
      };
      db.localStore.users.push(newUser);
      db.localStore.verification_tokens.push({
        id: db.localStore.verification_tokens.length + 1,
        user_id: newId,
        code: verificationCode,
        token: verificationCode,
        expires_at: expiresAt.toISOString()
      });
      db.localStore.save();
    }

    // Send email with code
    const emailResult = await sendVerificationEmail(normalizedEmail, verificationCode, newUser.full_name);

    res.status(201).json({
      success: true,
      requiresVerification: true,
      message: 'Pendaftaran berhasil! Kode verifikasi telah dikirim ke email kamu.',
      email: normalizedEmail,
      previewCode: emailResult.previewCode || null // Available for dev/testing ease
    });
  } catch (err) {
    console.error('[Register Error]:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server saat pendaftaran: ' + err.message });
  }
});

/**
 * POST /api/auth/verify-email
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email dan 6 digit kode wajib diisi.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const trimmedCode = code.toString().trim();

    let user = null;
    let isValidCode = false;

    if (db.getDbStatus().postgresConnected) {
      const userRes = await db.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
      if (!userRes || userRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
      }
      user = userRes.rows[0];

      const tokenRes = await db.query(
        `SELECT * FROM verification_tokens 
         WHERE user_id = $1 AND code = $2 AND expires_at > NOW() 
         ORDER BY id DESC LIMIT 1`,
        [user.id, trimmedCode]
      );

      if (tokenRes && tokenRes.rows.length > 0) {
        isValidCode = true;
        // Update user verified
        await db.query('UPDATE users SET is_verified = TRUE WHERE id = $1', [user.id]);
        // Delete used tokens
        await db.query('DELETE FROM verification_tokens WHERE user_id = $1', [user.id]);
      }
    } else {
      user = db.localStore.users.find(u => u.email === normalizedEmail);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
      }

      const tokenRecord = db.localStore.verification_tokens
        .filter(t => t.user_id === user.id && t.code === trimmedCode)
        .reverse()[0];

      if (tokenRecord && new Date(tokenRecord.expires_at) > new Date()) {
        isValidCode = true;
        user.is_verified = true;
        db.localStore.save();
      }
    }

    if (!isValidCode) {
      return res.status(400).json({
        success: false,
        message: 'Kode verifikasi tidak valid atau telah kedaluwarsa. Silakan minta kode baru.'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Selamat! Email kamu berhasil diverifikasi.',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        isVerified: true
      }
    });
  } catch (err) {
    console.error('[Verify Email Error]:', err);
    res.status(500).json({ success: false, message: 'Gagal memverifikasi email: ' + err.message });
  }
});

/**
 * POST /api/auth/resend-code
 */
router.post('/resend-code', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email wajib diisi.' });

    const normalizedEmail = email.toLowerCase().trim();
    let user = null;

    if (db.getDbStatus().postgresConnected) {
      const resUser = await db.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
      if (!resUser || resUser.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
      }
      user = resUser.rows[0];
    } else {
      user = db.localStore.users.find(u => u.email === normalizedEmail);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
      }
    }

    const newCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    if (db.getDbStatus().postgresConnected) {
      await db.query(
        `INSERT INTO verification_tokens (user_id, token, code, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [user.id, newCode, newCode, expiresAt]
      );
    } else {
      db.localStore.verification_tokens.push({
        id: db.localStore.verification_tokens.length + 1,
        user_id: user.id,
        code: newCode,
        token: newCode,
        expires_at: expiresAt.toISOString()
      });
      db.localStore.save();
    }

    const emailRes = await sendVerificationEmail(normalizedEmail, newCode, user.full_name);

    res.json({
      success: true,
      message: 'Kode verifikasi baru telah dikirimkan ke email kamu.',
      previewCode: emailRes.previewCode || null
    });
  } catch (err) {
    console.error('[Resend Code Error]:', err);
    res.status(500).json({ success: false, message: 'Gagal mengirim ulang kode: ' + err.message });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = null;

    if (db.getDbStatus().postgresConnected) {
      const result = await db.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
      if (result && result.rows.length > 0) {
        user = result.rows[0];
      }
    } else {
      user = db.localStore.users.find(u => u.email === normalizedEmail);
    }

    if (!user || !user.password_hash) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.'
      });
    }

    // Check email verification status
    if (!user.is_verified) {
      // Re-trigger code send
      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      if (db.getDbStatus().postgresConnected) {
        await db.query(
          `INSERT INTO verification_tokens (user_id, token, code, expires_at) VALUES ($1, $2, $3, $4)`,
          [user.id, code, code, expiresAt]
        );
      } else {
        db.localStore.verification_tokens.push({
          id: db.localStore.verification_tokens.length + 1,
          user_id: user.id,
          code,
          token: code,
          expires_at: expiresAt.toISOString()
        });
        db.localStore.save();
      }

      const emailResult = await sendVerificationEmail(normalizedEmail, code, user.full_name);

      return res.status(403).json({
        success: false,
        requiresVerification: true,
        message: 'Email akun kamu belum diverifikasi. Masukkan kode 6-digit yang baru saja dikirim.',
        email: normalizedEmail,
        previewCode: emailResult.previewCode || null
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Login berhasil! Selamat datang di Prodil Studio.',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        isVerified: true
      }
    });
  } catch (err) {
    console.error('[Login Error]:', err);
    res.status(500).json({ success: false, message: 'Gagal login: ' + err.message });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      fullName: req.user.full_name || req.user.fullName,
      avatarUrl: req.user.avatar_url || req.user.avatarUrl,
      isVerified: req.user.is_verified ?? true
    },
    databaseStatus: db.getDbStatus()
  });
});

export default router;
