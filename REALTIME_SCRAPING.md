# Real-Time Cricket Score Scraping Guide

## How Real-Time Scraping Works

### Architecture Overview

```
Frontend (React) 
    ↓ (Polling every 30 seconds)
API Route (/api/cricket/live-scores/realtime)
    ↓ (Bypasses cache, forces fresh scrape)
Cricket Scraper (cricket-scraper.ts)
    ↓ (Scrapes website)
Cricbuzz/ESPN Cricinfo
    ↓ (Returns HTML)
Cheerio Parser
    ↓ (Extracts match data)
Database Cache (30 seconds TTL)
    ↓
Frontend Updates
```

## Implementation Details

### 1. **Frontend Polling** (Client-Side)

The frontend components poll the API at regular intervals:

```typescript
// MatchSlider.tsx - Updates every 30 seconds
useEffect(() => {
  fetchMatches();
  const interval = setInterval(fetchMatches, 30000); // 30 seconds
  return () => clearInterval(interval);
}, []);
```

**Why 30 seconds?**
- Balance between real-time feel and server load
- Cricket scores don't change every second
- Reduces server requests while keeping data fresh

### 2. **API Endpoints**

#### Regular Endpoint (Cached)
- **Route**: `/api/cricket/live-scores`
- **Cache**: 1 minute
- **Use Case**: General browsing, less frequent updates

#### Real-Time Endpoint (Fresh Data)
- **Route**: `/api/cricket/live-scores/realtime`
- **Cache**: Bypassed (always fresh)
- **Use Case**: Live score widgets, real-time updates

### 3. **Scraper Caching Strategy**

```typescript
// Live matches: 30-60 second cache
// Series data: 7 days cache
// Match details: 1 minute cache
```

**Cache Levels:**
- **Level 1**: Database cache (30 seconds for live matches)
- **Level 2**: Memory cache (optional, for high traffic)
- **Level 3**: CDN cache (for static series data)

### 4. **Scraping Process**

```typescript
1. Check cache (if not forcing refresh)
2. If cache valid (< 30 seconds old) → return cached
3. If cache expired → scrape website
4. Parse HTML with Cheerio
5. Extract match data
6. Store in cache
7. Return data
```

## Real-Time Update Strategies

### Option 1: Polling (Current Implementation)
✅ **Pros:**
- Simple to implement
- Works with any data source
- No special server requirements

❌ **Cons:**
- Constant server requests
- Not truly "real-time" (30s delay)
- Higher server load

**Best for:** Most use cases, moderate traffic

### Option 2: Server-Sent Events (SSE)
✅ **Pros:**
- True push updates
- Lower latency
- Efficient connection reuse

❌ **Cons:**
- Requires persistent connection
- More complex implementation
- Browser connection limits

**Implementation:**
```typescript
// API Route: /api/cricket/live-scores/stream
export async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      const interval = setInterval(async () => {
        const matches = await getLiveMatches(true);
        controller.enqueue(`data: ${JSON.stringify(matches)}\n\n`);
      }, 30000);
      
      // Cleanup on close
      return () => clearInterval(interval);
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### Option 3: WebSockets
✅ **Pros:**
- True bidirectional real-time
- Lowest latency
- Can handle multiple updates

❌ **Cons:**
- Most complex
- Requires WebSocket server
- Higher resource usage

**Best for:** High-traffic sites, multiple concurrent users

### Option 4: Background Job + Push
✅ **Pros:**
- Scrapes continuously in background
- Frontend gets instant updates
- Efficient resource usage

❌ **Cons:**
- Requires job queue (Redis, Bull, etc.)
- More infrastructure needed

**Implementation:**
```typescript
// Background job runs every 30 seconds
// Updates database
// Frontend polls database (fast, no scraping)
```

## Performance Optimization

### 1. **Smart Caching**
```typescript
// Only scrape if cache is older than 30 seconds
const cacheAge = Date.now() - cacheTimestamp;
if (cacheAge < 30000) {
  return cached; // Use cache
}
// Otherwise scrape
```

### 2. **Incremental Updates**
```typescript
// Only update changed matches
// Compare old vs new data
// Send only deltas to frontend
```

### 3. **Request Batching**
```typescript
// Batch multiple match requests
// Scrape all at once
// Return all together
```

### 4. **Rate Limiting**
```typescript
// Limit requests per IP
// Implement exponential backoff
// Use queue for high traffic
```

## Monitoring & Alerts

### Key Metrics to Track:
1. **Scraping Success Rate**: Should be > 95%
2. **Average Response Time**: Should be < 2 seconds
3. **Cache Hit Rate**: Should be > 70%
4. **Error Rate**: Should be < 5%

### Alerts:
- Scraping failures > 3 consecutive
- Response time > 5 seconds
- Cache hit rate < 50%

## Troubleshooting

### Issue: Scores not updating
**Solutions:**
1. Check if scraper is running
2. Verify website structure hasn't changed
3. Check cache expiration
4. Verify API endpoint is being called

### Issue: High server load
**Solutions:**
1. Increase cache TTL
2. Reduce polling frequency
3. Implement request throttling
4. Use CDN for static data

### Issue: Scraping fails
**Solutions:**
1. Check website is accessible
2. Verify HTML selectors are correct
3. Check rate limiting
4. Implement retry logic

## Best Practices

1. **Respect Rate Limits**: Don't scrape too frequently
2. **User-Agent**: Always set proper User-Agent
3. **Error Handling**: Graceful fallbacks
4. **Logging**: Log all scraping attempts
5. **Testing**: Test selectors regularly
6. **Legal**: Check website's terms of service

## Future Enhancements

1. **WebSocket Support**: For true real-time
2. **Multiple Sources**: Scrape from multiple sites
3. **Intelligent Polling**: Adjust frequency based on match status
4. **Predictive Caching**: Pre-fetch likely needed data
5. **Edge Caching**: Use edge functions for faster responses

