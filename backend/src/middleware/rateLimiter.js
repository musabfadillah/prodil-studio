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

// Auth endpoints rate limiter (prevent brute-force login/register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Terlalu banyak upaya masuk. Silakan tunggu 15 menit.'
  }
});
