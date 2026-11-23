import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../config/db.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token autentikasi dibutuhkan untuk mengakses fitur ini.'
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(403).json({
      success: false,
      message: 'Token sesi telah kedaluwarsa atau tidak valid. Silakan login kembali.'
    });
  }

  if (!decoded || typeof decoded !== 'object' || decoded.id == null) {
    return res.status(401).json({ success: false, message: 'Token tidak memiliki akun yang valid.' });
  }

  try {
    if (db.getDbStatus().postgresConnected) {
      const result = await db.query('SELECT id, email, full_name, avatar_url, is_verified FROM users WHERE id = $1', [decoded.id]);
      if (result && result.rows.length > 0) {
        const user = result.rows[0];
        if (!user.is_verified) {
          return res.status(403).json({ success: false, message: 'Akun harus diverifikasi sebelum mengakses workspace.' });
        }
        req.user = user;
      } else {
        return res.status(401).json({ success: false, message: 'Akun tidak ditemukan. Silakan login kembali.' });
      }
    } else {
      const user = db.localStore.users.find(u => String(u.id) === String(decoded.id));
      if (!user) {
        return res.status(401).json({ success: false, message: 'Akun tidak ditemukan. Silakan login kembali.' });
      }
      if (!user.is_verified) {
        return res.status(403).json({ success: false, message: 'Akun harus diverifikasi sebelum mengakses workspace.' });
      }
      req.user = user;
    }

    return next();
  } catch (err) {
    return next(err);
  }
};
