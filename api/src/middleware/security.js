import { rateLimit } from "express-rate-limit";
import { slowDown } from "express-slow-down";

// General rate limiter for all endpoints (100 requests per 15 minutes)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    statusCode: 429,
    error: "Too Many Requests",
    message: "Too many requests from this IP, please try again after 15 minutes."
  }
});

// General response slow down for all endpoints
export const apiSpeedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes, then...
  delayMs: (hits) => hits * 500, // begin adding 500ms of delay per request above 50
  maxDelayMs: 2000 // limit delay to a maximum of 2 seconds
});

// Stricter rate limiter for authentication routes (5 requests per 15 minutes)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    statusCode: 429,
    error: "Too Many Requests",
    message: "Too many authentication requests from this IP, please try again after 15 minutes."
  }
});

// Stricter slow down for authentication routes
export const authSpeedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 3, // allow 3 requests per 15 minutes, then...
  delayMs: (hits) => hits * 1000, // begin adding 1000ms of delay per request above 3
  maxDelayMs: 5000 // limit delay to a maximum of 5 seconds
});
