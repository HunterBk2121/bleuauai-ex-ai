/**
 * Rate limiter utility
 * Helps prevent API rate limit issues by throttling requests
 */

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum number of requests per window
}

interface RateLimiter {
  wait: () => Promise<void>
  reset: () => void
  getStatus: () => {
    remaining: number
    nextReset: Date
  }
}

/**
 * Create a rate limiter
 */
export function rateLimit(options: RateLimitOptions): RateLimiter {
  const { windowMs, maxRequests } = options
  let requestTimestamps: number[] = []
  let waitQueue: Array<() => void> = []
  let processing = false

  /**
   * Process the wait queue
   */
  const processQueue = async () => {
    if (processing || waitQueue.length === 0) return

    processing = true

    while (waitQueue.length > 0) {
      // Clean up old timestamps
      const now = Date.now()
      requestTimestamps = requestTimestamps.filter((timestamp) => now - timestamp < windowMs)

      // Check if we can process the next request
      if (requestTimestamps.length < maxRequests) {
        const resolve = waitQueue.shift()
        if (resolve) {
          requestTimestamps.push(now)
          resolve()
          // Small delay to prevent race conditions
          await new Promise((r) => setTimeout(r, 10))
        }
      } else {
        // Wait until the oldest timestamp expires
        const oldestTimestamp = requestTimestamps[0]
        const waitTime = oldestTimestamp + windowMs - now
        await new Promise((r) => setTimeout(r, waitTime > 0 ? waitTime : 0))
      }
    }

    processing = false
  }

  return {
    /**
     * Wait until a request can be made within rate limits
     */
    wait: () => {
      return new Promise<void>((resolve) => {
        waitQueue.push(resolve)
        processQueue()
      })
    },

    /**
     * Reset the rate limiter
     */
    reset: () => {
      requestTimestamps = []
      waitQueue = []
      processing = false
    },

    /**
     * Get the current status of the rate limiter
     */
    getStatus: () => {
      const now = Date.now()
      requestTimestamps = requestTimestamps.filter((timestamp) => now - timestamp < windowMs)

      return {
        remaining: maxRequests - requestTimestamps.length,
        nextReset: new Date(now + windowMs),
      }
    },
  }
}
