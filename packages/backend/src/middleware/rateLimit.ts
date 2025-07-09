import rateLimit from 'express-rate-limit';

// Limit profile update requests: 20 requests per 15 minutes per IP/user
export const profileUpdateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Too many profile update attempts, please try again later',
  },
}); 