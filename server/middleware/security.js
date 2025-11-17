import rateLimit from 'express-rate-limit';

// Rate limiting for general API requests
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Rate limiting for password reset or sensitive operations
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per hour
  message: 'Too many attempts, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
});

// Slow down repeated requests (brute force protection)
export const loginSlowDown = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Start slowing down after 10 requests
  delayAfter: 5, // Begin slowing down responses after 5 requests
  delayMs: 500, // Add 500ms delay per request after delayAfter
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true,
});

// IP-based suspicious activity tracker
const suspiciousIPs = new Map();

export const trackSuspiciousActivity = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  
  // Track failed attempts
  if (!suspiciousIPs.has(ip)) {
    suspiciousIPs.set(ip, {
      failedAttempts: 0,
      lastAttempt: Date.now(),
      blocked: false,
    });
  }
  
  const ipData = suspiciousIPs.get(ip);
  
  // Check if IP is blocked
  if (ipData.blocked) {
    const blockDuration = 60 * 60 * 1000; // 1 hour
    if (Date.now() - ipData.lastAttempt < blockDuration) {
      return res.status(403).json({
        success: false,
        message: 'Your IP has been temporarily blocked due to suspicious activity. Please try again later.',
      });
    } else {
      // Unblock after duration
      ipData.blocked = false;
      ipData.failedAttempts = 0;
    }
  }
  
  next();
};

export const recordFailedAttempt = (ip) => {
  if (suspiciousIPs.has(ip)) {
    const ipData = suspiciousIPs.get(ip);
    ipData.failedAttempts += 1;
    ipData.lastAttempt = Date.now();
    
    // Block IP after 10 failed attempts
    if (ipData.failedAttempts >= 10) {
      ipData.blocked = true;
      console.warn(`⚠️ IP ${ip} has been blocked due to excessive failed attempts`);
    }
  }
};

export const clearFailedAttempts = (ip) => {
  if (suspiciousIPs.has(ip)) {
    suspiciousIPs.get(ip).failedAttempts = 0;
  }
};

// Security headers middleware
export const securityHeaders = (req, res, next) => {
  // Prevent browsers from MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Enable XSS filter in older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

