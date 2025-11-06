import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';
import { generateNonce, injectNonce, checkRateLimit } from './helpers.js';

/**
 * The DEBUG flag will do two things that help during development:
 * 1. we will skip caching on the edge, which makes it easier to
 *    debug.
 * 2. we will return an error message on exception in your Response rather
 *    than the default 404.html page.
 */
const DEBUG = false

/**
 * Cache TTL configuration
 */
const CACHE_TTL = DEBUG ? 0 : 86400 // 24 hours in production, no cache in debug

/**
 * Rate limiting configuration
 */
const RATE_LIMIT = {
  enabled: !DEBUG,
  maxRequests: 100, // per window
  windowMs: 60000,  // 1 minute
}

addEventListener('fetch', event => {
  try {
    event.respondWith(handleEvent(event))
  } catch (e) {
    if (DEBUG) {
      return event.respondWith(
        new Response(e.message || e.toString(), {
          status: 500,
        }),
      )
    }
    event.respondWith(new Response('Internal Error', { status: 500 }))
  }
})

async function handleEvent(event) {
  const url = new URL(event.request.url)
  const clientIP = event.request.headers.get('CF-Connecting-IP')

  // Rate limiting check
  if (RATE_LIMIT.enabled) {
    const rateLimitResult = await checkRateLimit(clientIP, RATE_LIMIT)
    if (!rateLimitResult.allowed) {
      return new Response('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(RATE_LIMIT.windowMs / 1000).toString(),
          'X-RateLimit-Limit': RATE_LIMIT.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
        }
      })
    }
  }

  let options = {}

  /**
   * You can add custom logic to how we fetch your assets
   * by configuring the function `mapRequestToAsset`
   */
  // options.mapRequestToAsset = handlePrefix(/^\/docs/)

  try {
    if (DEBUG) {
      // customize caching
      options.cacheControl = {
        bypassCache: true,
      }
    } else {
      // Enable caching in production
      options.cacheControl = {
        browserTTL: CACHE_TTL,
        edgeTTL: CACHE_TTL,
      }
    }

    const page = await getAssetFromKV(event, options)

    // Generate nonce for CSP
    const nonce = generateNonce()

    // allow headers to be altered
    let responseBody = page.body

    // For HTML files, inject nonce into CSP and script tags
    const contentType = page.headers.get('content-type') || ''
    if (contentType.includes('text/html')) {
      responseBody = await injectNonce(page.body, nonce)
    }

    const response = new Response(responseBody, page)

    // Security headers
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

    // Enhanced CSP with nonce (no unsafe-inline!)
    const cspValue = `
      default-src 'self';
      script-src 'self' 'nonce-${nonce}';
      style-src 'self' 'nonce-${nonce}' https://cdn.jsdelivr.net https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net;
      img-src 'self' data: blob:;
      connect-src 'self';
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self';
      upgrade-insecure-requests;
    `.replace(/\s+/g, ' ').trim()

    response.headers.set('Content-Security-Policy', cspValue)

    // Caching headers
    if (!DEBUG) {
      response.headers.set('Cache-Control', `public, max-age=${CACHE_TTL}`)
      response.headers.set('CDN-Cache-Control', `max-age=${CACHE_TTL * 365}`)
    }

    return response

  } catch (e) {
    // if an error is thrown try to serve the asset at 404.html
    if (!DEBUG) {
      try {
        let notFoundResponse = await getAssetFromKV(event, {
          mapRequestToAsset: req => new Request(`${new URL(req.url).origin}/404.html`, req),
        })

        return new Response(notFoundResponse.body, { ...notFoundResponse, status: 404 })
      } catch (e) {}
    }

    return new Response(e.message || e.toString(), { status: 500 })
  }
}

/**
 * Here's one example of how to modify a request to
 * remove a specific prefix, in this case `/docs` from
 * the url. This can be useful if you are deploying to a
 * route on a zone, or if you only want your static content
 * to exist at a specific path.
 */
function handlePrefix(prefix) {
  return request => {
    // compute the default (e.g. / -> index.html)
    let defaultAssetKey = mapRequestToAsset(request)
    let url = new URL(defaultAssetKey.url)

    // strip the prefix from the path for lookup
    url.pathname = url.pathname.replace(prefix, '/')

    // inherit all other props from the default request
    return new Request(url.toString(), defaultAssetKey)
  }
}