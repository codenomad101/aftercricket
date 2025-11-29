# Cricket Data Scraper Guide

This application now uses web scraping and JSON API consumption instead of the cricketData API. The implementation supports both approaches.

## Architecture

- **`src/lib/cricket-scraper.ts`**: Main scraper implementation
- **`src/lib/cricket-api.ts`**: Wrapper that maintains backward compatibility

## Features

1. **Web Scraping**: Uses Cheerio to scrape cricket websites (Cricbuzz, ESPN Cricinfo, etc.)
2. **JSON API Support**: Can consume JSON data from third-party APIs
3. **Caching**: All data is cached in the database (15 minutes for matches, 7 days for series)
4. **Fallback Mechanism**: If scraping fails, falls back to JSON API

## Current Implementation

### Live Matches
- **Primary**: Scrapes Cricbuzz live scores page
- **Fallback**: JSON API endpoint (configurable)

### Series Data
- **Primary**: Scrapes Cricbuzz series page
- **Cached**: 7 days

### Match Details
- **Primary**: Scrapes individual match pages from Cricbuzz

## Customization

### Option 1: Use Different Scraping Sources

Edit `src/lib/cricket-scraper.ts` to scrape different websites:

```typescript
// Example: Scrape ESPN Cricinfo instead
async function scrapeESPNMatches(): Promise<CricketMatch[]> {
  const response = await fetch('https://www.espncricinfo.com/live-cricket-score', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });
  const html = await response.text();
  const $ = cheerio.load(html);
  // Parse HTML using Cheerio selectors
  // ...
}
```

### Option 2: Use JSON APIs Directly

Replace the scraping functions with JSON API calls:

```typescript
async function fetchFromJsonApi(): Promise<CricketMatch[]> {
  // Example: Use a free cricket API
  const response = await fetch('https://api.example.com/cricket/matches', {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Accept': 'application/json',
    },
  });
  
  const data = await response.json();
  // Transform data to match CricketMatch interface
  return data.matches.map(transformMatch);
}
```

### Option 3: Use Python Scraper (Separate Service)

If you prefer Python, you can:

1. Create a Python service that scrapes data
2. Expose it as a REST API
3. Call it from Next.js:

```typescript
async function fetchFromPythonService(): Promise<CricketMatch[]> {
  const response = await fetch('http://localhost:8000/api/matches', {
    headers: {
      'Accept': 'application/json',
    },
  });
  return response.json();
}
```

## Free Cricket API Alternatives

1. **ESPN Cricinfo**: Has some JSON endpoints (may require authentication)
2. **Cricbuzz**: Can be scraped (current implementation)
3. **Cricket API (cricketapi.com)**: Free tier available
4. **Sportmonks**: Free tier with limited requests
5. **Cricsportz**: Free cricket API

## Data Structure

The scraper returns data in the `CricketMatch` interface format:

```typescript
interface CricketMatch {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue: string;
  date: string;
  teams: string[];
  score?: Array<{
    r: number;  // runs
    w: number;  // wickets
    o: number;  // overs
    inning: string;
  }>;
  matchStarted?: boolean;
  matchEnded?: boolean;
}
```

## Caching

- **Matches**: Cached for 15 minutes
- **Series**: Cached for 7 days
- **Match Details**: Cached for 15 minutes

Cache is stored in the `api_cache` database table.

## Error Handling

The scraper includes:
- Try-catch blocks for all operations
- Fallback to JSON API if scraping fails
- Returns empty array on complete failure
- Logs errors to console

## Testing

To test the scraper:

```bash
# Test in Node.js
node -r dotenv/config -e "import('./src/lib/cricket-scraper.ts').then(m => m.getLiveMatches().then(console.log))"
```

## Notes

- **Rate Limiting**: Be respectful of website rate limits
- **User-Agent**: Always set a proper User-Agent header
- **Legal**: Ensure scraping is allowed by the website's terms of service
- **Reliability**: Scraping can break if website structure changes

## Future Improvements

1. Add support for multiple scraping sources
2. Implement retry logic with exponential backoff
3. Add monitoring and alerting for scraping failures
4. Create a Python microservice for complex scraping
5. Add support for ball-by-ball updates

