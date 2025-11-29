import * as cheerio from 'cheerio';
import { CricketMatch } from '@/types';

// Puppeteer will be imported dynamically to avoid issues if not installed
let puppeteer: any = null;

async function getPuppeteer() {
  if (!puppeteer) {
    try {
      puppeteer = await import('puppeteer');
    } catch (error) {
      console.error('Puppeteer not installed. Run: npm install puppeteer');
      throw new Error('Puppeteer is required for JavaScript-rendered content');
    }
  }
  return puppeteer;
}

/**
 * Scrape CricTracker for live cricket matches using Puppeteer
 * Handles JavaScript-rendered content
 */
export async function scrapeCricTrackerMatches(): Promise<CricketMatch[]> {
  let browser: any = null;
  
  try {
    const puppeteerModule = await getPuppeteer();
    const browserInstance = puppeteerModule.default || puppeteerModule;
    
    // Launch browser with optimized settings
    browser = await browserInstance.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
      ],
    });

    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Navigate to live scores page
    console.log('Loading CricTracker live scores page...');
    try {
      await page.goto('https://www.crictracker.com/', {
        waitUntil: 'domcontentloaded', // Changed from networkidle2 for faster loading
        timeout: 30000,
      });
      console.log('Successfully loaded CricTracker homepage');
    } catch (e) {
      console.log('Failed to load CricTracker, error:', e);
      throw e;
    }

    // Wait for content to load (adjust selector based on actual page structure)
    try {
      await page.waitForSelector('[class*="match"], [class*="score"], .match-card, .live-match', {
        timeout: 10000,
      });
    } catch (e) {
      console.log('Match elements not found with initial selectors, continuing...');
    }

    // Wait a bit more for JavaScript to render (using Promise-based delay)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get the rendered HTML
    const html = await page.content();
    await browser.close();
    browser = null;

    // Parse with Cheerio
    const $ = cheerio.load(html);
    const matches: CricketMatch[] = [];

    console.log('Parsing match data from rendered HTML...');

    // Try multiple selectors to find matches
    const selectors = [
      '.match-card',
      '.live-match',
      '.score-card',
      '[class*="match-card"]',
      '[class*="live-match"]',
      '[class*="score-card"]',
      '.ct-match-card',
      '.match-item',
      'article.match',
      '[data-match-id]',
    ];

    let foundMatches = false;

    for (const selector of selectors) {
      const elements = $(selector);
      
      if (elements.length > 0) {
        console.log(`Found ${elements.length} potential matches using selector: ${selector}`);
        foundMatches = true;
        
        elements.each((index, element) => {
          try {
            const $el = $(element);
            
            // Extract match information
            const title = $el.find('h3, h4, h2, .title, [class*="title"], a').first().text().trim();
            const link = $el.find('a').first().attr('href') || '';
            
            if (title && (title.includes(' vs ') || title.includes(' VS '))) {
              const teams = title.split(/vs|VS/).map(t => t.trim()).filter(Boolean);
              
              if (teams.length >= 2) {
                const status = $el.find('.status, [class*="status"], .live, [class*="live"], .match-status').text().trim() || 'Live';
                const score = $el.find('.score, [class*="score"], .match-score').text().trim();
                const venue = $el.find('.venue, [class*="venue"], .location, .match-venue').text().trim();
                const matchType = $el.find('.format, [class*="format"], .match-type').text().trim() || 'ODI';
                
                const matchId = link ? link.split('/').filter(Boolean).pop() || `match-${index}` : `match-${index}-${Date.now()}`;
                
                matches.push({
                  id: `crictracker-${matchId}`,
                  name: title,
                  matchType: matchType,
                  status: status || 'Live',
                  venue: venue || '',
                  date: new Date().toISOString(),
                  dateTimeGMT: new Date().toISOString(),
                  teams: teams,
                  matchStarted: !status.toLowerCase().includes('upcoming'),
                  matchEnded: status.toLowerCase().includes('complete') || 
                             status.toLowerCase().includes('finished') ||
                             status.toLowerCase().includes('result'),
                });
              }
            }
          } catch (err) {
            console.error('Error parsing match element:', err);
          }
        });
        
        // If we found matches with this selector, break
        if (matches.length > 0) {
          break;
        }
      }
    }

    // Alternative: Look for any content with "vs" pattern
    if (!foundMatches || matches.length === 0) {
      console.log('Trying alternative parsing method...');
      
      $('article, .post, [class*="card"], [class*="match"]').each((index, element) => {
        const $el = $(element);
        const text = $el.text();
        const title = $el.find('h1, h2, h3, h4, h5, .title, a').first().text().trim();
        
        // Check if it contains "vs" (team vs team pattern)
        if ((text.includes(' vs ') || text.includes(' VS ')) && title) {
          const teams = title.split(/vs|VS/).map(t => t.trim()).filter(Boolean);
          
          if (teams.length >= 2 && !matches.some(m => m.name === title)) {
            matches.push({
              id: `crictracker-alt-${index}-${Date.now()}`,
              name: title,
              matchType: 'ODI',
              status: 'Live',
              venue: '',
              date: new Date().toISOString(),
              dateTimeGMT: new Date().toISOString(),
              teams: teams,
              matchStarted: true,
              matchEnded: false,
            });
          }
        }
      });
    }

    console.log(`Successfully scraped ${matches.length} matches from CricTracker using Puppeteer`);
    return matches;

  } catch (error) {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        // Ignore close errors
      }
    }
    console.error('Error scraping CricTracker with Puppeteer:', error);
    throw error;
  }
}

/**
 * Get match details from CricTracker using Puppeteer
 */
export async function scrapeCricTrackerMatchDetails(matchUrl: string): Promise<CricketMatch | null> {
  let browser: any = null;
  
  try {
    const puppeteerModule = await getPuppeteer();
    const browserInstance = puppeteerModule.default || puppeteerModule;
    
    browser = await browserInstance.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    await page.goto(matchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Wait for content to render
    await new Promise(resolve => setTimeout(resolve, 2000));

    const html = await page.content();
    await browser.close();
    browser = null;

    const $ = cheerio.load(html);
    
    const title = $('h1, .match-title, [class*="title"]').first().text().trim();
    const teams = title.split(/vs|VS/).map(t => t.trim()).filter(Boolean);
    
    return {
      id: matchUrl.split('/').pop() || `match-${Date.now()}`,
      name: title,
      matchType: $('.format, [class*="format"]').text().trim() || 'ODI',
      status: $('.status, .live, [class*="status"]').text().trim() || 'Live',
      venue: $('.venue, .location, [class*="venue"]').text().trim() || '',
      date: new Date().toISOString(),
      dateTimeGMT: new Date().toISOString(),
      teams: teams,
      matchStarted: true,
      matchEnded: false,
    };
  } catch (error) {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        // Ignore
      }
    }
    console.error('Error scraping CricTracker match details:', error);
    return null;
  }
}

/**
 * Fallback: Simple fetch-based scraper (if Puppeteer fails or not installed)
 */
export async function scrapeCricTrackerMatchesSimple(): Promise<CricketMatch[]> {
  try {
    // Try the main page - live scores might be on homepage
    const response = await fetch('https://www.crictracker.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const matches: CricketMatch[] = [];

    // Try to find matches in initial HTML (may be limited if JS-rendered)
    $('article, .post, [class*="match"], [class*="card"]').each((index, element) => {
      const $el = $(element);
      const title = $el.find('h1, h2, h3, h4, a').first().text().trim();
      
      if (title && (title.includes(' vs ') || title.includes(' VS '))) {
        const teams = title.split(/vs|VS/).map(t => t.trim()).filter(Boolean);
        
        if (teams.length >= 2) {
          matches.push({
            id: `crictracker-simple-${index}`,
            name: title,
            matchType: 'ODI',
            status: 'Live',
            venue: '',
            date: new Date().toISOString(),
            dateTimeGMT: new Date().toISOString(),
            teams: teams,
            matchStarted: true,
            matchEnded: false,
          });
        }
      }
    });

    return matches;
  } catch (error) {
    console.error('Error with simple CricTracker scraping:', error);
    throw error;
  }
}
