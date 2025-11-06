/**
 * Worker Helper Functions
 * Utilities for CSP nonce generation and rate limiting
 */

/**
 * Generate a cryptographically secure nonce for CSP
 * @returns {string} Base64 encoded nonce
 */
export function generateNonce() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, array));
}

/**
 * Inject nonce into HTML content
 * @param {Response} response - Response object
 * @param {string} nonce - Generated nonce
 * @returns {Promise<string>} Modified HTML
 */
export async function injectNonce(response, nonce) {
  const text = await response.text();

  // Inject nonce into script tags
  let modified = text.replace(
    /<script(\s+[^>]*)?>/gi,
    (match, attrs) => {
      // Skip if already has nonce or is external script with src
      if (match.includes('nonce=') || (attrs && attrs.includes('src='))) {
        return match;
      }
      return `<script nonce="${nonce}"${attrs || ''}>`;
    }
  );

  // Inject nonce into inline style tags
  modified = modified.replace(
    /<style(\s+[^>]*)?>/gi,
    (match, attrs) => {
      if (match.includes('nonce=')) {
        return match;
      }
      return `<style nonce="${nonce}"${attrs || ''}>`;
    }
  );

  return modified;
}

/**
 * Simple in-memory rate limiter
 * Note: In production, use Cloudflare Durable Objects or KV for distributed rate limiting
 */
const rateLimitStore = new Map();

/**
 * Check rate limit for client IP
 * @param {string} clientIP - Client IP address
 * @param {Object} config - Rate limit configuration
 * @returns {Promise<{allowed: boolean, remaining: number}>}
 */
export async function checkRateLimit(clientIP, config) {
  if (!clientIP) {
    return { allowed: true, remaining: config.maxRequests };
  }

  const now = Date.now();
  const key = `ratelimit:${clientIP}`;

  // Get or create rate limit entry
  let entry = rateLimitStore.get(key);

  if (!entry || now - entry.windowStart > config.windowMs) {
    // New window
    entry = {
      count: 1,
      windowStart: now
    };
    rateLimitStore.set(key, entry);

    // Cleanup old entries (prevent memory leak)
    if (rateLimitStore.size > 10000) {
      const oldKeys = [];
      for (const [k, v] of rateLimitStore.entries()) {
        if (now - v.windowStart > config.windowMs * 2) {
          oldKeys.push(k);
        }
      }
      oldKeys.forEach(k => rateLimitStore.delete(k));
    }

    return { allowed: true, remaining: config.maxRequests - 1 };
  }

  // Within window
  entry.count++;

  if (entry.count > config.maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: config.maxRequests - entry.count };
}
