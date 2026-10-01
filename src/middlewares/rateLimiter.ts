import { Request, Response, NextFunction, RequestHandler } from 'express';

export interface RateLimitOptions {
    /** The time window in milliseconds. Can be a static number or a dynamic function. */
    windowMs: number | ((req: Request) => number);
    /** The maximum number of requests allowed within the windowMs. Can be a static number or a dynamic function. */
    max: number | ((req: Request) => number);
    /** Custom function to generate keys (defaults to IP address). */
    keyGenerator?: (req: Request) => string;
    /** Response message when the limit is exceeded. */
    message?: string;
}

export interface RateLimitRecord {
    /** Number of requests made in the current window. */
    count: number;
    /** Timestamp when the current window expires. */
    resetTime: number;
}

/**
 * Creates a dynamic rate limiting middleware.
 * 
 * @param options - Configuration options for the rate limiter.
 * @returns Express middleware function (RequestHandler).
 */
const rateLimiter = (options: RateLimitOptions): RequestHandler => {
    const store = new Map<string, RateLimitRecord>();

    // Periodic cleanup to prevent memory leaks from old IP addresses
    setInterval(() => {
        const now = Date.now();
        for (const [key, record] of store.entries()) {
            if (now > record.resetTime) {
                store.delete(key);
            }
        }
    }, 60000); // Runs every 1 minute

    return (req: Request, res: Response, next: NextFunction): void => {
        // Resolve dynamic or static values for windowMs and max
        const windowMs = typeof options.windowMs === 'function' ? options.windowMs(req) : options.windowMs;
        const max = typeof options.max === 'function' ? options.max(req) : options.max;
        
        // Resolve key (defaults to IP address with safe type fallbacks)
        const xForwardedFor = req.headers['x-forwarded-for'];
        const fallbackIp = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor;
        
        const key = options.keyGenerator 
            ? options.keyGenerator(req) 
            : req.ip || fallbackIp || req.socket.remoteAddress || 'unknown';

        const message = options.message || 'Too many requests, please try again later.';
        const currentTime = Date.now();

        // If the key is new, initialize its record
        if (!store.has(key)) {
            store.set(key, { count: 1, resetTime: currentTime + windowMs });
            return next();
        }

        // Using non-null assertion operator (!) since we already checked .has()
        const record = store.get(key)!;

        // If the window has expired, reset the counter and time window
        if (currentTime > record.resetTime) {
            record.count = 1;
            record.resetTime = currentTime + windowMs;
            store.set(key, record);
            return next();
        }

        // Increment request count
        record.count += 1;
        store.set(key, record);

        // Calculate remaining requests
        const remaining = Math.max(0, max - record.count);

        // Set standard rate limiting headers (values must be strings in TS headers)
        res.setHeader('X-RateLimit-Limit', max.toString());
        res.setHeader('X-RateLimit-Remaining', remaining.toString());
        res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

        // Check if limit is exceeded
        if (record.count > max) {
            res.status(429).json({
                status: 429,
                error: 'Too Many Requests',
                message: message
            });
            return;
        }

        next();
    };
}

export default rateLimiter;