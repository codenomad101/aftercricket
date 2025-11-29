# Puppeteer Setup for CricTracker Scraping

## Installation

Puppeteer is required for scraping JavaScript-rendered content from CricTracker.

### Install Puppeteer

```bash
npm install puppeteer @types/puppeteer
```

### For Production (Lighter Installation)

If you want a lighter installation without downloading Chromium:

```bash
npm install puppeteer-core @types/puppeteer
```

Then set `PUPPETEER_EXECUTABLE_PATH` environment variable to point to your Chrome/Chromium binary.

## How It Works

### Architecture

```
Request → Puppeteer Launches Browser → Loads CricTracker Page 
→ Waits for JavaScript to Render → Extracts HTML → Parses with Cheerio 
→ Returns Match Data → Caches Result
```

### Process Flow

1. **Browser Launch**: Puppeteer launches a headless Chrome browser
2. **Page Navigation**: Navigates to CricTracker live scores page
3. **Wait for Content**: Waits for network to be idle and content to render
4. **HTML Extraction**: Gets the fully rendered HTML (after JavaScript execution)
5. **Parsing**: Uses Cheerio to parse the HTML and extract match data
6. **Cleanup**: Closes the browser to free resources

## Configuration

### Browser Launch Options

The scraper uses optimized settings:

```typescript
{
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
    '--window-size=1920x1080',
  ],
}
```

### Timeouts

- **Page Load**: 30 seconds
- **Element Wait**: 10 seconds
- **JavaScript Wait**: 2 seconds after network idle

## Performance Considerations

### Resource Usage

- **Memory**: ~100-200MB per browser instance
- **CPU**: Moderate during page load
- **Time**: 3-5 seconds per scrape (vs 1-2 seconds for simple fetch)

### Optimization Tips

1. **Reuse Browser Instances**: For multiple scrapes, reuse browser
2. **Cache Results**: Already implemented (60-second cache)
3. **Parallel Scraping**: Can scrape multiple pages in parallel
4. **Resource Blocking**: Block images/fonts to speed up (optional)

## Error Handling

The scraper includes multiple fallback mechanisms:

1. **Puppeteer Fails** → Falls back to simple fetch
2. **CricTracker Fails** → Falls back to Cricbuzz
3. **All Fail** → Returns empty array

## Production Deployment

### Environment Variables

```env
# Optional: Use system Chrome instead of bundled Chromium
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Optional: Skip Chromium download (use puppeteer-core)
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```

### Docker Considerations

If deploying in Docker, add to Dockerfile:

```dockerfile
# Install Chromium dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-sandbox \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

### Vercel/Serverless

For serverless deployments (Vercel, AWS Lambda):

1. Use `puppeteer-core` instead of `puppeteer`
2. Use a service like Browserless.io or ScrapingBee
3. Or use the simple fetch fallback

## Monitoring

### Key Metrics

- **Scraping Success Rate**: Should be > 90%
- **Average Scrape Time**: Should be < 5 seconds
- **Browser Memory Usage**: Monitor for leaks
- **Error Rate**: Should be < 10%

### Logging

The scraper logs:
- Browser launch status
- Page load progress
- Match count found
- Errors and fallbacks

## Troubleshooting

### Issue: Puppeteer not found

**Solution**: Install Puppeteer
```bash
npm install puppeteer
```

### Issue: Browser launch fails

**Solutions**:
1. Check system dependencies (for Linux)
2. Use `--no-sandbox` flag (already included)
3. Set `PUPPETEER_EXECUTABLE_PATH` to system Chrome

### Issue: Timeout errors

**Solutions**:
1. Increase timeout values
2. Check network connectivity
3. Verify CricTracker is accessible

### Issue: No matches found

**Solutions**:
1. Check if selectors need updating
2. Verify page structure hasn't changed
3. Check browser console for errors

## Alternative: Playwright

If Puppeteer doesn't work well, you can switch to Playwright:

```bash
npm install playwright
```

Playwright supports multiple browsers and may be more reliable in some cases.

## Security

- Always use headless mode in production
- Don't expose browser to external network
- Use sandbox flags for security
- Respect rate limits

## Cost Considerations

- **Development**: Free (local)
- **Production**: 
  - Self-hosted: Server resources
  - Cloud services: Browserless.io (~$75/month), ScrapingBee (~$49/month)
  - Serverless: May have cold start issues

