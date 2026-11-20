import rateLimit from 'express-rate-limit';

// Standard rate limiter for normal API endpoints
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak permintaan dari IP ini. Silakan coba beberapa saat lagi.'
  }
});

// Stricter rate limiter for AI Gemini generation to protect quotas
export const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15, // max 15 requests per minute per user/IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Batas penggunaan AI tercapai (15 req/menit). Mohon tunggu sejenak sebelum mencoba lagi.'
  }
});

// Auth endpoints rate limiter (prevent brute-force login/register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Terlalu banyak upaya masuk. Silakan tunggu 15 menit.'
  }
});
