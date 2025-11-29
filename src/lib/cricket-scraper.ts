import * as cheerio from 'cheerio';
import { db } from './db';
import { apiCache } from './db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { CricketMatch, CricketSeries } from '@/types';

const CACHE_TTL_MINUTES = 15;
const LIVE_MATCHES_CACHE_SECONDS = 30; // 30 seconds for real-time feel

async function getCachedData(key: string): Promise<string | null> {
  const cached = await db
    .select()
    .from(apiCache)
    .where(and(eq(apiCache.key, key), gt(apiCache.expiresAt, new Date())))
    .limit(1);

  if (cached.length > 0) {
    return cached[0].value;
  }
  return null;
}

async function setCachedData(key: string, value: string, ttlDays?: number, ttlSeconds?: number): Promise<void> {
  const expiresAt = new Date();
  if (ttlDays) {
    expiresAt.setDate(expiresAt.getDate() + ttlDays);
  } else if (ttlSeconds) {
    expiresAt.setSeconds(expiresAt.getSeconds() + ttlSeconds);
  } else {
    // For live matches, use shorter cache (1 minute for real-time updates)
    if (key.includes('live_matches') || key.includes('match_')) {
      expiresAt.setSeconds(expiresAt.getSeconds() + 60); // 1 minute for live data
    } else {
      expiresAt.setMinutes(expiresAt.getMinutes() + CACHE_TTL_MINUTES);
    }
  }

  try {
    // Try upsert first (most efficient)
    await db.insert(apiCache).values({
      key,
      value,
      expiresAt,
    }).onConflictDoUpdate({
      target: apiCache.key,
      set: {
        value,
        expiresAt,
      },
    });
  } catch (error) {
    // Fallback: If upsert fails, delete and insert
    try {
      await db.delete(apiCache).where(eq(apiCache.key, key));
      await db.insert(apiCache).values({
        key,
        value,
        expiresAt,
      });
    } catch (fallbackError) {
      // If both methods fail, log but don't throw (cache is not critical)
      console.error('Failed to cache data:', fallbackError);
    }
  }
}

/**
 * Fetch live matches by scraping Cricbuzz
 * Alternative: Can use ESPN Cricinfo or other cricket sites
 * @param forceRefresh - If true, bypasses cache and fetches fresh data
 */
export async function getLiveMatches(forceRefresh: boolean = false): Promise<CricketMatch[]> {
  const cacheKey = 'live_matches_scraped';

  // For real-time updates, use shorter cache (30 seconds) or bypass cache
  if (!forceRefresh) {
    const cached = await getCachedData(cacheKey);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        // Return cached data if available (cache TTL handles freshness)
        return data || [];
      } catch (e) {
        console.error('Error parsing cached data:', e);
      }
    }
  }

  try {
    let allMatches: CricketMatch[] = [];

    // 1. Get Live Scores (High Priority for scores)
    try {
      const liveMatches = await scrapeLiveScoresPage();
      if (liveMatches.length > 0) {
        allMatches = [...liveMatches];
      }
    } catch (e) {
      console.log('Live scores scraping failed:', e);
    }

    // 2. Get Homepage Matches (For Schedule/Upcoming)
    try {
      const homeMatches = await scrapeCricbuzzMatches();

      // Merge: Add matches from homepage that aren't in live scores
      for (const homeMatch of homeMatches) {
        // Check if this match is already in allMatches (by loose name matching)
        const isDuplicate = allMatches.some(m => {
          // Normalize names for comparison
          const mName = m.name.toLowerCase().replace(/\s+/g, '');
          const hName = homeMatch.name.toLowerCase().replace(/\s+/g, '');
          return mName.includes(hName) || hName.includes(mName);
        });

        if (!isDuplicate) {
          allMatches.push(homeMatch);
        }
      }
    } catch (e) {
      console.log('Homepage scraping failed:', e);
    }

    if (allMatches.length > 0) {
      await setCachedData(cacheKey, JSON.stringify(allMatches), undefined);
      return allMatches;
    }

    // Option 2: Fallback to CricTracker (uses Puppeteer for JS)
    try {
      const { scrapeCricTrackerMatches, scrapeCricTrackerMatchesSimple } = await import('./crictracker-scraper');

      // Try Puppeteer-based scraping first
      try {
        const matches = await scrapeCricTrackerMatches();
        if (matches.length > 0) {
          await setCachedData(cacheKey, JSON.stringify(matches), undefined);
          return matches;
        }
      } catch (puppeteerError) {
        const errorMessage = puppeteerError instanceof Error ? puppeteerError.message : String(puppeteerError);
        console.log('Puppeteer scraping failed, trying simple fetch...', errorMessage);
        // Fallback to simple fetch if Puppeteer fails
        const matches = await scrapeCricTrackerMatchesSimple();
        if (matches.length > 0) {
          await setCachedData(cacheKey, JSON.stringify(matches), undefined);
          return matches;
        }
      }
    } catch (crictrackerError) {
      console.log('CricTracker scraping also failed', crictrackerError);
    }

    // If all sources fail, return empty array
    console.log('All scraping sources failed, returning empty array');
    return [];
  } catch (error) {
    console.error('Error fetching live matches:', error);

    // Fallback: Try JSON API approach
    try {
      return await fetchFromJsonApi();
    } catch (fallbackError) {
      console.error('Fallback API also failed:', fallbackError);
      return [];
    }
  }
}

/**
 * Extract match data from Cricbuzz's Next.js JSON payload
 * Cricbuzz is now a Next.js app with match data embedded in script tags
 */
async function scrapeCricbuzzFromJson(html: string): Promise<CricketMatch[]> {
  try {
    console.log('Extracting matches from Next.js JSON payload...');
    const matches: CricketMatch[] = [];

    // Look for match patterns directly in the HTML
    // Format: "Bangladesh vs Ireland, 2nd T20I" with timing nearby
    const matchPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+vs\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([^"\\]+?)(?:"|\\)/g;

    let matchData;
    const seenMatches = new Set<string>();

    while ((matchData = matchPattern.exec(html)) !== null) {
      try {
        const team1 = matchData[1].trim();
        const team2 = matchData[2].trim();
        const matchDesc = matchData[3].trim();

        // Skip if teams are too short or contain invalid characters
        if (team1.length < 3 || team2.length < 3) continue;
        if (team1.includes('{') || team2.includes('{')) continue;

        // Skip non-match content (predictions, news, articles, etc.)
        const lowerDesc = matchDesc.toLowerCase();
        if (lowerDesc.includes('prediction') ||
          lowerDesc.includes('preview article') ||
          lowerDesc.includes('news') ||
          lowerDesc.includes('analysis') ||
          lowerDesc.includes('report')) {
          continue;
        }

        const matchName = `${team1} vs ${team2}`;

        // Better duplicate filtering - use just team names to avoid showing same match multiple times
        // But allow if it's a different match number (1st vs 2nd)
        const matchKey = matchName; // Just use team names for basic dedup

        // Skip duplicates of the same teams
        if (seenMatches.has(matchKey)) continue;
        seenMatches.add(matchKey);

        // Extract format from match description
        let matchType = 'ODI'; // Default
        const formatMatch = matchDesc.match(/(\d+)(?:st|nd|rd|th)?\s*(T20I|ODI|Test)/i);
        if (formatMatch) {
          const format = formatMatch[2].toUpperCase();
          if (format === 'T20I') {
            matchType = 'T20I';
          } else if (format === 'ODI') {
            matchType = 'ODI';
          } else if (format === 'TEST') {
            matchType = 'Test';
          }
        } else if (matchDesc.toLowerCase().includes('test')) {
          matchType = 'Test';
        } else if (matchDesc.toLowerCase().includes('t20')) {
          matchType = 'T20I';
        }

        // Try to find timing information near this match
        // Look in a window around the match text
        const matchIndex = matchPattern.lastIndex;
        const searchWindow = html.substring(Math.max(0, matchIndex - 1000), matchIndex + 1000);

        let matchTime = '';
        let matchDate = new Date().toISOString();
        let matchTimeLabel = '';

        // Look for time pattern: "Today"  •  "12:00 PM" " GMT"
        const timePattern = /(Today|Tomorrow|Mon|Tue|Wed|Thu|Fri|Sat|Sun)[^"]*?(\d{1,2}:\d{2}\s*(?:AM|PM))[^"]*?GMT/i;
        const timeMatch = searchWindow.match(timePattern);

        if (timeMatch) {
          const dayLabel = timeMatch[1];
          const time = timeMatch[2];
          matchTime = `${dayLabel} • ${time}`;

          // Parse the time
          try {
            const timeStr = time.trim();
            const timeRegex = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;
            const timeResult = timeStr.match(timeRegex);

            if (timeResult) {
              let hours = parseInt(timeResult[1]);
              const minutes = parseInt(timeResult[2]);
              const ampm = timeResult[3].toUpperCase();

              // Convert to 24-hour format
              if (ampm === 'PM' && hours !== 12) {
                hours += 12;
              } else if (ampm === 'AM' && hours === 12) {
                hours = 0;
              }

              const date = new Date();
              if (dayLabel.toLowerCase() === 'tomorrow') {
                date.setDate(date.getDate() + 1);
                matchTimeLabel = 'Next';
              } else if (dayLabel.toLowerCase() === 'today') {
                matchTimeLabel = 'Today';
              } else {
                matchTimeLabel = 'Next';
              }

              date.setHours(hours, minutes, 0, 0);
              matchDate = date.toISOString();
            }
          } catch (e) {
            // Keep default date
          }
        }

        // Determine status
        let status = 'Preview';
        if (matchDesc.toLowerCase().includes('live')) {
          status = 'Live';
        } else if (matchTimeLabel === 'Today') {
          status = 'Today';
        } else if (matchTimeLabel === 'Next') {
          status = 'Upcoming';
        }

        const matchId = `cricbuzz-${team1.toLowerCase().replace(/\s+/g, '-')}-${team2.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

        matches.push({
          id: matchId,
          name: matchName,
          matchType: matchType,
          status: status,
          venue: '',
          date: matchDate,
          dateTimeGMT: matchDate,
          teams: [team1, team2],
          matchStarted: status === 'Live' || status === 'Today',
          matchEnded: false,
          matchTime: matchTime || undefined,
        });

        // Limit to avoid too many matches
        if (matches.length >= 20) break;
      } catch (err) {
        // Skip this match if parsing fails
        continue;
      }
    }

    console.log(`Extracted ${matches.length} matches from JSON payload`);
    return matches;
  } catch (error) {
    console.error('Error extracting from JSON:', error);
    return [];
  }
}

/**
 * Scrape the dedicated Live Scores page
 * https://www.cricbuzz.com/cricket-match/live-scores
 */
async function scrapeLiveScoresPage(): Promise<CricketMatch[]> {
  try {
    console.log('Scraping Cricbuzz Live Scores page...');
    const response = await fetch('https://www.cricbuzz.com/cricket-match/live-scores', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const matches: CricketMatch[] = [];

    // The live scores page uses <a> tags as match containers
    // Selector based on hierarchy analysis: A.w-full bg-cbWhite flex flex-col p-3 gap-1
    const matchContainers = $('a[class*="bg-cbWhite"][class*="flex"][class*="flex-col"][class*="p-3"]');

    console.log(`Found ${matchContainers.length} match containers on Live Scores page`);

    matchContainers.each((index, element) => {
      try {
        const $el = $(element);
        const matchLink = $el.attr('href') || '';

        // Extract Match Info (Format, Venue)
        // Usually the first child div or text
        // Text: "2-day Warm-up Match • Canberra, Manuka Oval"
        const infoText = $el.children().eq(0).text();

        // Extract Teams and Scores
        // Structure: Prime Ministers XI PMXI 85-0
        const teamRows = $el.find('div.flex.items-center.gap-4.justify-between');
        const teams: string[] = [];
        const scores: { r: number, w: number, o: number, inning: string }[] = [];

        teamRows.each((i, row) => {
          const $row = $(row);

          // Child 0: Team Name Container
          const teamContainer = $row.children().eq(0);
          // Try to get the full name (hidden wb:block) or just the first span
          let teamName = teamContainer.find('span.hidden.wb\\:block').text().trim();
          if (!teamName) {
            teamName = teamContainer.find('span').first().text().trim();
          }
          // Fallback: just get text of container
          if (!teamName) {
            teamName = teamContainer.text().trim();
          }

          if (teamName) teams.push(teamName);

          // Child 1: Score Container (Span)
          const scoreText = $row.children().eq(1).text().trim();

          // Parse score: "85-0" or "85-0 (20)"
          if (scoreText) {
            const scoreMatch = scoreText.match(/(\d+)[/-](\d+)(?:\s*\((\d+(?:\.\d+)?)\))?/);
            if (scoreMatch) {
              scores.push({
                r: parseInt(scoreMatch[1]),
                w: parseInt(scoreMatch[2]),
                o: scoreMatch[3] ? parseFloat(scoreMatch[3]) : 0,
                inning: teamName
              });
            }
          }
        });

        // If teams not found via rows, try parsing the full text
        if (teams.length < 2) {
          // Fallback parsing logic
          // ...
        }

        // Extract Status
        // Usually the last element or distinct style
        const status = $el.find('div.text-xs.text-cbTxtSec, div[class*="text-cbTxtSec"]').last().text().trim() || 'Live';

        // Extract Format from info text
        let matchType = 'ODI';
        if (infoText.includes('T20')) matchType = 'T20I';
        else if (infoText.includes('Test')) matchType = 'Test';

        const matchId = matchLink ? matchLink.split('/').filter(Boolean).pop() || `match-${index}` : `match-${index}-${Date.now()}`;

        matches.push({
          id: matchId,
          name: teams.join(' vs ') || 'Unknown Match',
          matchType,
          status,
          venue: infoText.split('•')[1]?.trim() || '',
          date: new Date().toISOString(),
          dateTimeGMT: new Date().toISOString(),
          teams: teams,
          score: scores,
          matchStarted: true,
          matchEnded: status.toLowerCase().includes('won') || status.toLowerCase().includes('draw'),
        });

      } catch (err) {
        console.error('Error parsing match on live scores page:', err);
      }
    });

    return matches;
  } catch (error) {
    console.error('Error scraping live scores page:', error);
    return [];
  }
}


/**
 * Scrape Cricbuzz homepage top section for live cricket matches
 * The homepage top section contains all the live scores
 */

async function scrapeCricbuzzMatches(): Promise<CricketMatch[]> {
  try {
    console.log('Scraping Cricbuzz homepage for live scores...');
    const response = await fetch('https://www.cricbuzz.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();

    // FIRST: Try extracting from Next.js JSON payload (most reliable for new Cricbuzz)
    try {
      const jsonMatches = await scrapeCricbuzzFromJson(html);
      if (jsonMatches.length > 0) {
        console.log(`Successfully extracted ${jsonMatches.length} matches from JSON payload`);
        return jsonMatches;
      }
    } catch (jsonError) {
      console.log('JSON extraction failed, falling back to HTML scraping...', jsonError);
    }

    // FALLBACK: Use HTML scraping (for backward compatibility)
    const $ = cheerio.load(html);
    const matches: CricketMatch[] = [];

    // Cricbuzz homepage top section selectors - try multiple patterns
    const topSectionSelectors = [
      '.cb-mtch-lst', // Main match list container
      '.cb-col-100', // Column containers
      '[class*="cb-mtch"]', // Any match-related class
      '.cb-hm-scrg-bttm', // Homepage score section
      '.cb-lv-scrs-well', // Live scores well
    ];

    console.log('Parsing matches from Cricbuzz homepage HTML...');


    // Try to find matches in the top section
    for (const containerSelector of topSectionSelectors) {
      const containers = $(containerSelector);

      if (containers.length > 0) {
        console.log(`Found ${containers.length} containers with selector: ${containerSelector}`);

        containers.each((containerIndex, container) => {
          const $container = $(container);

          // Look for match items within the container
          $container.find('.cb-lv-scrs-well, [class*="cb-lv"], [class*="match"], .cb-match-item').each((index, element) => {
            try {
              const $el = $(element);

              // Get match link
              const matchLink = $el.find('a').first().attr('href') || '';
              const matchId = matchLink ? matchLink.split('/').filter(Boolean).pop() || `match-${index}` : `match-${index}-${Date.now()}`;

              // Extract team names - try multiple selectors
              let teams: string[] = [];
              const teamSelectors = [
                '.cb-ovr-flo',
                '.cb-hmscg-bat-nm',
                '[class*="team"]',
                '.cb-text-complete',
                'a[href*="cricket-scores"]',
              ];

              for (const selector of teamSelectors) {
                const teamText = $el.find(selector).first().text().trim();
                if (teamText && (teamText.includes(' vs ') || teamText.includes(' VS '))) {
                  teams = teamText.split(/vs|VS/).map(t => t.trim()).filter(Boolean);
                  break;
                }
              }

              // Alternative: Get from link text or title
              if (teams.length < 2) {
                const linkText = $el.find('a').first().text().trim();
                if (linkText && (linkText.includes(' vs ') || linkText.includes(' VS '))) {
                  teams = linkText.split(/vs|VS/).map(t => t.trim()).filter(Boolean);
                }
              }

              // Get status
              const status = $el.find('.cb-text-live, .cb-text-complete, [class*="status"], .cb-lv-scrs-mtch-date').text().trim() || 'Live';

              // Get score
              const score = $el.find('.cb-scr-wll, [class*="score"], .cb-hmscg-bat-nm').text().trim();

              // Get venue
              const venue = $el.find('.cb-venue, [class*="venue"]').text().trim();

              // Get all text from the match element (used for both result and format detection)
              const allMatchTextFull = $el.text();
              const allMatchText = allMatchTextFull.toLowerCase();

              // Extract "won by" result for completed matches
              let result = '';
              const wonByPattern = /(?:won by|beat|defeated)\s+(\d+)\s*(runs?|wickets?|innings?)/i;
              const wonByMatch = allMatchTextFull.match(wonByPattern);

              if (wonByMatch) {
                const margin = wonByMatch[1];
                const unit = wonByMatch[2].toLowerCase();
                // Try to find which team won
                const teamWonPattern = /([A-Z][a-zA-Z\s]+)\s+(?:won|beat|defeated)/i;
                const teamWonMatch = allMatchTextFull.match(teamWonPattern);
                const winningTeam = teamWonMatch ? teamWonMatch[1].trim() : teams[0] || 'Team';
                result = `${winningTeam} won by ${margin} ${unit}`;
              } else {
                // Alternative patterns
                const altPatterns = [
                  /([A-Z][a-zA-Z\s]+)\s+won\s+by\s+(\d+)\s*(runs?|wickets?)/i,
                  /([A-Z][a-zA-Z\s]+)\s+beat\s+([A-Z][a-zA-Z\s]+)\s+by\s+(\d+)\s*(runs?|wickets?)/i,
                ];

                for (const pattern of altPatterns) {
                  const match = allMatchTextFull.match(pattern);
                  if (match) {
                    const winningTeam = match[1].trim();
                    const margin = match[2] || match[3];
                    const unit = (match[3] || match[4]).toLowerCase();
                    result = `${winningTeam} won by ${margin} ${unit}`;
                    break;
                  }
                }
              }

              // If no result found but match is completed, check status text
              if (!result && (status.toLowerCase().includes('won') || status.toLowerCase().includes('result'))) {
                result = status;
              }

              // Get match type/format - check multiple sources
              let matchType = 'ODI'; // Default
              const parentText = $el.parent().text().toLowerCase();
              const linkText = matchLink.toLowerCase();

              // Shared selectors and locations for format and time extraction
              // Structure: <div class="flex justify-between items-center">
              //   <span>2nd T20I • Ireland tour of Bangladesh, 2025</span>
              //   <div class="bg-cbItmBkgDark">T20I</div>
              // </div>

              // Look for the parent container with flex layout - use more flexible selectors
              const formatContainerSelectors = [
                'div[class*="flex"][class*="justify-between"][class*="items-center"]', // All classes present
                'div[class*="flex"][class*="justify-between"]', // Just flex and justify-between
                '[class*="flex"][class*="justify-between"]', // Any element with these classes
                'div.flex', // Simple flex div
              ];

              // Search in multiple locations: element, children, parent, siblings, ancestors
              const searchLocations = [
                $el, // The match element itself
                $el.parent(), // Parent element
                $el.parent().parent(), // Grandparent
                $el.parent().parent().parent(), // Great-grandparent
                $el.siblings(), // Sibling elements
                $el.closest('[class*="match"]'), // Closest match container
                $el.closest('[class*="cb-"]'), // Closest Cricbuzz container
              ];

              // FIRST: Directly search for format badge (most reliable)
              const formatBadgeSelectors = [
                '[class*="bg-cbItmBkgDark"]', // Any element with this class (most specific)
                '[class*="cbItmBkgDark"]', // Any element with cbItmBkgDark in class
                'div[class*="rounded-3xl"][class*="text-xxs"]', // Format badge styling
                'div[class*="rounded"][class*="text-white"]', // Rounded white text badge
              ];

              // Search for format badge directly first (most reliable)
              for (const location of searchLocations) {
                for (const selector of formatBadgeSelectors) {
                  const formatBadges = location.find(selector);
                  if (formatBadges.length > 0) {
                    formatBadges.each((idx, badge) => {
                      const formatText = $(badge).text().trim().toUpperCase();
                      if (formatText === 'T20I' || formatText === 'T-20I') {
                        matchType = 'T20I';
                        return false; // Break
                      } else if (formatText === 'ODI') {
                        matchType = 'ODI';
                        return false;
                      } else if (formatText === 'TEST') {
                        matchType = 'Test';
                        return false;
                      } else if (formatText.includes('T20') && formatText.length <= 10) {
                        // Only if it's a short text (likely format badge, not match description)
                        matchType = 'T20I';
                        return false;
                      }
                    });
                    if (matchType !== 'ODI') break; // Found a match
                  }
                }
                if (matchType !== 'ODI') break; // Found a match, exit
              }

              // SECOND: Check for format badge inside flex containers
              if (matchType === 'ODI') {
                for (const location of searchLocations) {
                  for (const containerSelector of formatContainerSelectors) {
                    const containers = location.find(containerSelector);
                    if (containers.length > 0) {
                      containers.each((idx, container) => {
                        const $container = $(container);
                        // Look for format badge inside this container
                        const formatBadge = $container.find('[class*="bg-cbItmBkgDark"], [class*="cbItmBkgDark"]');
                        if (formatBadge.length > 0) {
                          const formatText = formatBadge.first().text().trim().toUpperCase();
                          if (formatText === 'T20I' || formatText === 'T-20I') {
                            matchType = 'T20I';
                            return false; // Break
                          } else if (formatText === 'ODI') {
                            matchType = 'ODI';
                            return false;
                          } else if (formatText === 'TEST') {
                            matchType = 'Test';
                            return false;
                          } else if (formatText.includes('T20') && formatText.length <= 10) {
                            matchType = 'T20I';
                            return false;
                          }
                        }
                      });
                      if (matchType !== 'ODI') break; // Found a match
                    }
                  }
                  if (matchType !== 'ODI') break; // Found a match, exit
                }
              }

              // THIRD: Check the span text that contains format info (e.g., "2nd T20I • Ireland tour")
              if (matchType === 'ODI') {
                const spanWithFormat = $el.find('span[class*="text-cbTxtSec"], span[class*="cbTxtSec"]');
                if (spanWithFormat.length > 0) {
                  spanWithFormat.each((idx, span) => {
                    const spanText = $(span).text().trim();
                    // Check for patterns like "2nd T20I", "1st ODI", "3rd Test"
                    const formatPattern = /(\d+)(?:st|nd|rd|th)?\s*(T20I|T-20I|T20|ODI|TEST|Test)/i;
                    const match = spanText.match(formatPattern);
                    if (match) {
                      const format = match[2].toUpperCase();
                      if (format === 'T20I' || format === 'T-20I' || format.includes('T20')) {
                        matchType = 'T20I';
                        return false;
                      } else if (format === 'ODI') {
                        matchType = 'ODI';
                        return false;
                      } else if (format === 'TEST') {
                        matchType = 'Test';
                        return false;
                      }
                    }
                  });
                }
              }

              // Also check for elements with the exact class combination in wider search
              if (matchType === 'ODI') {
                // Search in all ancestors
                let current = $el;
                for (let i = 0; i < 5 && current.length > 0; i++) {
                  const badgeInAncestor = current.find('[class*="bg-cbItmBkgDark"]');
                  if (badgeInAncestor.length > 0) {
                    const formatText = badgeInAncestor.first().text().trim().toUpperCase();
                    if (formatText === 'T20I' || formatText === 'T-20I' || formatText.includes('T20')) {
                      matchType = 'T20I';
                      break;
                    } else if (formatText === 'ODI') {
                      matchType = 'ODI';
                      break;
                    } else if (formatText === 'TEST') {
                      matchType = 'Test';
                      break;
                    }
                  }
                  current = current.parent();
                }
              }

              // FOURTH: If format badge didn't work, check text content (fallback)
              if (matchType === 'ODI') {
                // Check for T20I/T20 indicators (prioritize T20I)
                // Look for patterns like "2nd T20I", "1st T20I", "T20I", etc.
                const t20iPattern = /(\d+)?(?:st|nd|rd|th)?\s*(T20I|T-20I)/i;
                if (t20iPattern.test(allMatchText) || t20iPattern.test(parentText) || t20iPattern.test(linkText)) {
                  matchType = 'T20I';
                } else if (allMatchText.includes('t20i') || allMatchText.includes('t-20i') ||
                  parentText.includes('t20i') || linkText.includes('t20i')) {
                  matchType = 'T20I';
                } else if (allMatchText.includes('t20') || allMatchText.includes('t-20') ||
                  allMatchText.includes('twenty20') || allMatchText.includes('20-20') ||
                  parentText.includes('t20') || linkText.includes('t20')) {
                  matchType = 'T20I'; // Default to T20I for T20 matches
                }
                // Check for Test indicators
                else if (allMatchText.includes('test') || parentText.includes('test') || linkText.includes('test')) {
                  matchType = 'Test';
                }
                // Check for ODI indicators
                else if (allMatchText.includes('odi') || allMatchText.includes('one day') ||
                  parentText.includes('odi') || linkText.includes('odi')) {
                  matchType = 'ODI';
                }
              }

              // Debug: Log if we're still defaulting to ODI
              if (matchType === 'ODI' && allMatchText.includes('t20')) {
                console.log('⚠️ Format detection: Found T20 in text but defaulting to ODI. Match text:', allMatchText.substring(0, 100));
              }

              // FIFTH: Check other specific selectors and any small rounded badges
              if (matchType === 'ODI') {
                const matchTypeSelectors = [
                  '.cb-text-gray',
                  '.cb-match-type',
                  '[class*="format"]',
                  '[class*="type"]',
                  '.cb-lv-scrs-mtch-date',
                  '.cb-mtch-info',
                  'div[class*="rounded"]', // Any rounded div (format badges)
                  'span[class*="rounded"]', // Any rounded span
                ];

                for (const selector of matchTypeSelectors) {
                  const matchTypeElements = $el.find(selector);
                  let found = false;
                  matchTypeElements.each((idx, elem) => {
                    const $elem = $(elem);
                    const matchTypeText = $elem.text().trim().toUpperCase();
                    // Only consider short text (likely format badges, not descriptions)
                    if (matchTypeText.length <= 10) {
                      if (matchTypeText === 'T20I' || matchTypeText === 'T-20I') {
                        matchType = 'T20I';
                        found = true;
                        return false; // Break
                      } else if (matchTypeText === 'ODI') {
                        matchType = 'ODI';
                        found = true;
                        return false;
                      } else if (matchTypeText === 'TEST') {
                        matchType = 'Test';
                        found = true;
                        return false;
                      } else if (matchTypeText.includes('T20') && matchTypeText.length <= 6) {
                        matchType = 'T20I';
                        found = true;
                        return false;
                      }
                    }
                  });
                  if (found) break; // Found a match, exit loop
                }
              }

              // SIXTH: Last resort - search all elements in the match for format badges
              // Look for small rounded elements with format text
              if (matchType === 'ODI') {
                $el.find('div, span').each((idx, elem) => {
                  const $elem = $(elem);
                  const classes = $elem.attr('class') || '';
                  const text = $elem.text().trim().toUpperCase();

                  // Check if it's a small badge-like element with format text
                  if (text.length <= 10 &&
                    (classes.includes('rounded') || classes.includes('bg-')) &&
                    (text === 'T20I' || text === 'ODI' || text === 'TEST' ||
                      (text.includes('T20') && text.length <= 6))) {
                    if (text === 'T20I' || text === 'T-20I' || (text.includes('T20') && text.length <= 6)) {
                      matchType = 'T20I';
                      return false; // Break
                    } else if (text === 'ODI') {
                      matchType = 'ODI';
                      return false;
                    } else if (text === 'TEST') {
                      matchType = 'Test';
                      return false;
                    }
                  }
                });
              }

              // Get match time/date - look for "Today", "Tomorrow", or specific time
              let matchDate = new Date().toISOString();
              let matchTimeLabel = '';

              // Check if match is live (Today) or upcoming (Next)
              const statusLower = status.toLowerCase();
              const allTextLower = $el.text().toLowerCase();

              // Check for "Today" indicators
              if (statusLower.includes('live') ||
                statusLower.includes('in progress') ||
                allTextLower.includes('today') ||
                allTextLower.includes('live now')) {
                matchTimeLabel = 'Today';
                matchDate = new Date().toISOString();
              }
              // Check for "Next" or "Tomorrow" indicators
              else if (statusLower.includes('starts') ||
                statusLower.includes('upcoming') ||
                statusLower.includes('scheduled') ||
                allTextLower.includes('tomorrow') ||
                allTextLower.includes('next') ||
                allTextLower.includes('starts at')) {
                matchTimeLabel = 'Next';
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                matchDate = tomorrow.toISOString();
              }

              // Extract match time - look for specific Cricbuzz time element
              // Format: <span class="text-cbPreview text-ellipsis ... dark:text-cbPreviewDark">Today • 6:30 PM</span>
              let matchTime = '';

              // FIRST: Direct search for text-cbPreview element (most reliable)
              const timeElementSelectors = [
                '.text-cbPreview', // Primary Cricbuzz time element
                '[class*="text-cbPreview"]', // Any element with text-cbPreview class
                '[class*="cbPreview"]', // Any element with cbPreview in class
                'span[class*="cbPreview"]', // Span with cbPreview
              ];

              for (const location of searchLocations) {
                for (const selector of timeElementSelectors) {
                  const timeElements = location.find(selector);
                  if (timeElements.length > 0) {
                    timeElements.each((idx, elem) => {
                      const timeText = $(elem).text().trim();
                      if (timeText && timeText.length > 0 && timeText.length < 100) {
                        // Check for Cricbuzz format: "Today • 5:30 PM" or "Tomorrow • 10:00 AM"
                        const cricbuzzTimePattern = /(Today|Tomorrow|Next)\s*[•·]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i;
                        const cricbuzzMatch = timeText.match(cricbuzzTimePattern);
                        if (cricbuzzMatch) {
                          matchTime = timeText;
                          const dayLabel = cricbuzzMatch[1];
                          if (dayLabel.toLowerCase() === 'today') {
                            matchTimeLabel = 'Today';
                          } else if (dayLabel.toLowerCase() === 'tomorrow' || dayLabel.toLowerCase() === 'next') {
                            matchTimeLabel = 'Next';
                          }
                          return false; // Break
                        }
                      }
                    });
                    if (matchTime) break; // Found time, exit
                  }
                }
                if (matchTime) break; // Found time, exit outer loop
              }

              // SECOND: Check in the same flex container that has the format badge
              if (!matchTime) {
                for (const location of searchLocations) {
                  for (const containerSelector of formatContainerSelectors) {
                    const container = location.find(containerSelector).first();
                    if (container.length > 0) {
                      // Look for time element in this container
                      const timeInContainer = container.find('.text-cbPreview, [class*="cbPreview"], [class*="time"], [class*="date"]');
                      if (timeInContainer.length > 0) {
                        const timeText = timeInContainer.first().text().trim();
                        if (timeText && timeText.length > 0 && timeText.length < 100) {
                          const cricbuzzTimePattern = /(Today|Tomorrow|Next)\s*[•·]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i;
                          const cricbuzzMatch = timeText.match(cricbuzzTimePattern);
                          if (cricbuzzMatch) {
                            matchTime = timeText;
                            const dayLabel = cricbuzzMatch[1];
                            if (dayLabel.toLowerCase() === 'today') {
                              matchTimeLabel = 'Today';
                            } else if (dayLabel.toLowerCase() === 'tomorrow' || dayLabel.toLowerCase() === 'next') {
                              matchTimeLabel = 'Next';
                            }
                            break;
                          }
                        }
                      }
                    }
                  }
                  if (matchTime) break;
                }
              }

              // If not found in container, use general selectors
              const timeSelectors = [
                '.text-cbPreview', // Primary Cricbuzz time element
                '[class*="cbPreview"]', // Any element with cbPreview class
                '.cb-lv-scrs-mtch-date',
                '.cb-text-gray',
                '[class*="date"]',
                '[class*="time"]',
                '.cb-match-date',
                '.cb-mtch-info',
                '.cb-schedule-date',
              ];

              // Search in multiple locations: element, children, parent, siblings, ancestors
              const timeSearchLocations = [
                $el, // The match element itself
                $el.parent(), // Parent element
                $el.parent().parent(), // Grandparent
                $el.siblings(), // Sibling elements
                $el.closest('[class*="match"]'), // Closest match container
              ];

              for (const location of timeSearchLocations) {
                for (const selector of timeSelectors) {
                  const timeElement = location.find(selector);
                  if (timeElement.length > 0) {
                    const timeText = timeElement.first().text().trim();
                    if (timeText && timeText.length > 0 && timeText.length < 100) {
                      // Check for Cricbuzz format: "Today • 5:30 PM" or "Tomorrow • 10:00 AM"
                      const cricbuzzTimePattern = /(Today|Tomorrow|Next)\s*[•·]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i;
                      const cricbuzzMatch = timeText.match(cricbuzzTimePattern);

                      if (cricbuzzMatch) {
                        const dayLabel = cricbuzzMatch[1];
                        const hours = parseInt(cricbuzzMatch[2]);
                        const minutes = parseInt(cricbuzzMatch[3]);
                        const ampm = cricbuzzMatch[4];

                        matchTime = timeText; // Store full text like "Today • 5:30 PM"

                        if (dayLabel.toLowerCase() === 'today') {
                          matchTimeLabel = 'Today';
                        } else if (dayLabel.toLowerCase() === 'tomorrow' || dayLabel.toLowerCase() === 'next') {
                          matchTimeLabel = 'Next';
                        }

                        // Parse and set the date
                        try {
                          let hour24 = hours;
                          if (ampm && ampm.toUpperCase() === 'PM' && hour24 !== 12) {
                            hour24 += 12;
                          } else if (ampm && ampm.toUpperCase() === 'AM' && hour24 === 12) {
                            hour24 = 0;
                          }
                          const date = new Date();
                          if (matchTimeLabel === 'Next') {
                            date.setDate(date.getDate() + 1);
                          }
                          date.setHours(hour24, minutes, 0, 0);
                          matchDate = date.toISOString();
                        } catch (e) {
                          // Keep default date
                        }
                        break; // Found time, exit inner loop
                      } else {
                        // Fallback: Check for generic time patterns
                        const timePattern = /(\d{1,2}):(\d{2})\s*(AM|PM)?/i;
                        const timeMatch = timeText.match(timePattern);
                        if (timeMatch) {
                          matchTime = timeText; // Store the full time text

                          const lowerTimeText = timeText.toLowerCase();
                          if (!matchTimeLabel) {
                            if (lowerTimeText.includes('today')) {
                              matchTimeLabel = 'Today';
                            } else if (lowerTimeText.includes('tomorrow') || lowerTimeText.includes('next')) {
                              matchTimeLabel = 'Next';
                            } else {
                              // If no label but has time, assume it's today if match hasn't started
                              if (statusLower.includes('starts') || statusLower.includes('upcoming')) {
                                matchTimeLabel = 'Next';
                              } else {
                                matchTimeLabel = 'Today';
                              }
                            }
                          }

                          // Try to parse the time
                          try {
                            const hours = parseInt(timeMatch[1]);
                            const minutes = parseInt(timeMatch[2]);
                            const ampm = timeMatch[3];
                            let hour24 = hours;
                            if (ampm && ampm.toUpperCase() === 'PM' && hour24 !== 12) {
                              hour24 += 12;
                            } else if (ampm && ampm.toUpperCase() === 'AM' && hour24 === 12) {
                              hour24 = 0;
                            }
                            const date = new Date();
                            if (matchTimeLabel === 'Next') {
                              date.setDate(date.getDate() + 1);
                            }
                            date.setHours(hour24, minutes, 0, 0);
                            matchDate = date.toISOString();
                          } catch (e) {
                            // Keep default date
                          }
                          break; // Found time, exit inner loop
                        }
                      }
                    }
                  }
                }
                if (matchTime) break; // Found time, exit outer loop
              }

              // Also check for time in the status or other text
              if (!matchTime) {
                const statusTimePattern = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;
                const statusTimeMatch = status.match(statusTimePattern);
                if (statusTimeMatch) {
                  matchTime = statusTimeMatch[0];
                }
              }

              // Check parent container and siblings for time/date info
              if (!matchTimeLabel) {
                const parentText = $el.parent().text().toLowerCase();
                const siblingText = $el.siblings().text().toLowerCase();
                const combinedText = parentText + ' ' + siblingText;

                if (combinedText.includes('today')) {
                  matchTimeLabel = 'Today';
                } else if (combinedText.includes('tomorrow') || combinedText.includes('next')) {
                  matchTimeLabel = 'Next';
                }
              }

              // Default to "Today" if match is live, "Next" if upcoming
              if (!matchTimeLabel) {
                if (statusLower.includes('live') || statusLower.includes('in progress')) {
                  matchTimeLabel = 'Today';
                } else if (statusLower.includes('starts') || statusLower.includes('upcoming')) {
                  matchTimeLabel = 'Next';
                }
              }

              if (teams.length >= 2) {
                // Check if match already exists (avoid duplicates)
                const matchName = `${teams[0]} vs ${teams[1]}`;
                if (!matches.some(m => m.name === matchName)) {
                  // Determine if match is today or next
                  const statusLower = status.toLowerCase();
                  const isToday = matchTimeLabel.toLowerCase().includes('today') ||
                    statusLower.includes('live') ||
                    statusLower.includes('starts') ||
                    !matchTimeLabel.toLowerCase().includes('tomorrow') && !matchTimeLabel.toLowerCase().includes('next');

                  matches.push({
                    id: `cricbuzz-${matchId}`,
                    name: matchName,
                    matchType: matchType,
                    status: status || (matchTimeLabel ? matchTimeLabel : 'Live'),
                    venue: venue || '',
                    date: matchDate,
                    dateTimeGMT: matchDate,
                    teams: teams,
                    matchStarted: !statusLower.includes('upcoming') &&
                      !statusLower.includes('scheduled') &&
                      !statusLower.includes('starts at'),
                    matchEnded: statusLower.includes('complete') ||
                      statusLower.includes('finished') ||
                      statusLower.includes('result') ||
                      statusLower.includes('won'),
                    result: result || undefined,
                    matchTime: matchTime || undefined,
                  });

                  // Add time label to status if available (but keep original status for display)
                  if (matchTimeLabel && !status.toLowerCase().includes(matchTimeLabel.toLowerCase()) && !matchTime) {
                    // Don't modify status, use matchTime field instead
                  }
                }
              }
            } catch (err) {
              console.error('Error parsing match element:', err);
            }
          });
        });

        // If we found matches, break
        if (matches.length > 0) {
          break;
        }
      }
    }

    // Fallback: Look for any links with "vs" pattern in the top section
    if (matches.length === 0) {
      console.log('Trying fallback parsing method...');
      $('a[href*="cricket-scores"], a[href*="live-cricket"]').each((index, element) => {
        const $el = $(element);
        const text = $el.text().trim();
        const href = $el.attr('href') || '';

        if (text && (text.includes(' vs ') || text.includes(' VS '))) {
          const teams = text.split(/vs|VS/).map(t => t.trim()).filter(Boolean);

          if (teams.length >= 2) {
            const matchId = href.split('/').filter(Boolean).pop() || `match-${index}`;
            const matchName = `${teams[0]} vs ${teams[1]}`;

            if (!matches.some(m => m.name === matchName)) {
              matches.push({
                id: `cricbuzz-${matchId}`,
                name: matchName,
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
        }
      });
    }

    console.log(`Successfully scraped ${matches.length} matches from Cricbuzz homepage`);
    return matches;
  } catch (error) {
    console.error('Error scraping Cricbuzz homepage:', error);
    throw error;
  }
}

/**
 * Alternative: Fetch from a JSON API endpoint
 * Example: ESPN Cricinfo or other cricket APIs
 */
async function fetchFromJsonApi(): Promise<CricketMatch[]> {
  try {
    // Example: ESPN Cricinfo API (if available)
    // const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/cricket/scoreboard');

    // Example: Alternative free cricket API
    // You can replace this with any JSON API endpoint
    const response = await fetch('https://cricket-api.vercel.app/api/matches', {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform the response to match CricketMatch interface
    // Adjust based on the actual API response structure
    if (Array.isArray(data)) {
      return data.map((match: any) => ({
        id: match.id || match.matchId || `match-${Date.now()}`,
        name: match.name || match.title || `${match.team1} vs ${match.team2}`,
        matchType: match.format || match.matchType || 'ODI',
        status: match.status || match.state || 'Live',
        venue: match.venue || match.location || '',
        date: match.date || match.startTime || new Date().toISOString(),
        dateTimeGMT: match.dateTimeGMT || match.startTime || new Date().toISOString(),
        teams: match.teams || [match.team1, match.team2].filter(Boolean),
        score: match.score,
        matchStarted: match.matchStarted !== undefined ? match.matchStarted : true,
        matchEnded: match.matchEnded !== undefined ? match.matchEnded : false,
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching from JSON API:', error);
    throw error;
  }
}

/**
 * Scrape series data from Cricbuzz or other sources
 */
export async function getSeries(offset: number = 0): Promise<CricketSeries[]> {
  const cacheKey = `series_scraped_${offset}`;

  const cached = await getCachedData(cacheKey);
  if (cached) {
    try {
      const data = JSON.parse(cached);
      console.log(`Using cached series data for offset ${offset}`);
      return data || [];
    } catch (e) {
      console.error('Error parsing cached series data:', e);
    }
  }

  console.log(`Fetching series data for offset ${offset}...`);
  try {
    const series = await scrapeCricbuzzSeries();

    // Cache for 7 days
    await setCachedData(cacheKey, JSON.stringify(series), 7);
    console.log(`Cached series data for offset ${offset} (expires in 7 days)`);

    return series;
  } catch (error) {
    console.error('Error fetching series:', error);
    return [];
  }
}

/**
 * Scrape series from Cricbuzz
 */
async function scrapeCricbuzzSeries(): Promise<CricketSeries[]> {
  try {
    const response = await fetch('https://www.cricbuzz.com/cricket-series', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const series: CricketSeries[] = [];

    // Parse series from Cricbuzz
    $('.cb-series-matches').each((index, element) => {
      try {
        const $el = $(element);
        const name = $el.find('.cb-series-name').text().trim();
        const matches = $el.find('.cb-match-count').text().trim();

        if (name) {
          series.push({
            id: `series-${index}`,
            name: name,
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
            odi: 0,
            t20: 0,
            test: 0,
            squads: 0,
            matches: parseInt(matches) || 0,
          });
        }
      } catch (err) {
        console.error('Error parsing series element:', err);
      }
    });

    return series;
  } catch (error) {
    console.error('Error scraping Cricbuzz series:', error);
    return [];
  }
}

/**
 * Get match details by scraping
 */
export async function getMatchDetails(matchId: string): Promise<CricketMatch | null> {
  const cacheKey = `match_scraped_${matchId}`;

  const cached = await getCachedData(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error('Error parsing cached match data:', e);
    }
  }

  try {
    // Scrape match details from Cricbuzz
    const response = await fetch(`https://www.cricbuzz.com/live-cricket-scores/${matchId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Parse match details
    const match: CricketMatch = {
      id: matchId,
      name: $('.cb-nav-main .cb-nav-hdr').text().trim() || 'Match',
      matchType: 'ODI',
      status: $('.cb-text-live').text().trim() || 'Live',
      venue: $('.cb-venue').text().trim() || '',
      date: new Date().toISOString(),
      dateTimeGMT: new Date().toISOString(),
      teams: [],
      matchStarted: true,
      matchEnded: false,
    };

    await setCachedData(cacheKey, JSON.stringify(match));
    return match;
  } catch (error) {
    console.error('Error fetching match details:', error);
    return null;
  }
}

