import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../config/db.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'prodil_studio_secret_2026';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token autentikasi dibutuhkan untuk mengakses fitur ini.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check in PostgreSQL or local store
    if (db.getDbStatus().postgresConnected) {
      const result = await db.query('SELECT id, email, full_name, is_verified FROM users WHERE id = $1', [decoded.id]);
      if (result && result.rows.length > 0) {
        req.user = result.rows[0];
        return next();
      }
    } else {
      const user = db.localStore.users.find(u => u.id === decoded.id || u.email === decoded.email);
      if (user) {
        req.user = user;
        return next();
      }
    }

    // Default payload if user matched
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Token sesi telah kedaluwarsa atau tidak valid. Silakan login kembali.'
    });
  }
};

/**
 * Optional Auth middleware: if token present, decodes it, but doesn't reject guest users
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      req.user = null;
    }
  }
  next();
};
