const userRequestTimestamps = new Map();
const RATE_LIMIT_WINDOW_MS = 10000; // 10 seconds
const MAX_REQUESTS_PER_WINDOW = 20; // 20 requests per 10 seconds

export function isRateLimited(sessionId) {
    const now = Date.now();
    const timestamps = userRequestTimestamps.get(sessionId) || [];

    // Filter out timestamps older than the rate limit window
    const recentTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);

    if (recentTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
        return true; // Rate limit exceeded
    }

    // Add the current timestamp and update the map
    recentTimestamps.push(now);
    userRequestTimestamps.set(sessionId, recentTimestamps);

    return false; // Not rate limited
}
