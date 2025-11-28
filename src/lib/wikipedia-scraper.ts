import * as cheerio from 'cheerio';

const TEAM_FLAGS: Record<string, string> = {
  'India': '🇮🇳',
  'Australia': '🇦🇺',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Pakistan': '🇵🇰',
  'South Africa': '🇿🇦',
};

export interface PlayerInfo {
  name: string;
  fullName?: string;
  role?: string;
  battingStyle?: string;
  bowlingStyle?: string;
  dateOfBirth?: Date;
  placeOfBirth?: string;
  imageUrl?: string;
  wikipediaUrl: string;
  stats?: {
    test?: any;
    odi?: any;
    t20i?: any;
  };
}

export interface TeamInfo {
  name: string;
  country: string;
  flag: string;
  playing11: string[];
}

async function fetchWikipediaPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch Wikipedia page: ${response.statusText}`);
  }
  return response.text();
}

export async function getTeamInfo(teamName: string): Promise<TeamInfo> {
  const teamMap: Record<string, string> = {
    'India': 'India_national_cricket_team',
    'Australia': 'Australia_national_cricket_team',
    'England': 'England_cricket_team',
    'Pakistan': 'Pakistan_national_cricket_team',
    'South Africa': 'South_Africa_national_cricket_team',
  };

  const wikiSlug = teamMap[teamName] || teamName.replace(/\s+/g, '_');
  const url = `https://en.wikipedia.org/wiki/${wikiSlug}`;
  
  try {
    const html = await fetchWikipediaPage(url);
    const $ = cheerio.load(html);
    
    // Try to find current squad or playing 11
    const playing11: string[] = [];
    
    // Filter function to check if a name is likely a player name
    const isPlayerName = (name: string, href: string): boolean => {
      const lowerName = name.toLowerCase();
      // Exclude organization names, common words, etc.
      const excludePatterns = [
        'board of control',
        'cricket in',
        'cricket association',
        'cricket board',
        'national cricket',
        'cricket team',
        'cricket council',
        'international cricket',
        'edit',
        'category:',
        'template:',
        'file:',
        'help:',
        'special:',
        'wikipedia:',
        'portal:',
        'talk:',
        'user:',
      ];
      
      return name.length > 2 && 
             name.length < 50 &&
             !excludePatterns.some(pattern => lowerName.includes(pattern) || href.toLowerCase().includes(pattern)) &&
             !name.includes('[') &&
             !name.includes(']') &&
             !name.match(/^\d+$/) && // Not just numbers
             name.split(' ').length <= 4; // Reasonable name length
    };

    // Method 1: Look for "Current squad" or "Squad" sections
    $('h2, h3').each((_, heading) => {
      const headingText = $(heading).text().toLowerCase();
      if (headingText.includes('squad') || headingText.includes('current') || headingText.includes('players')) {
        let nextElement = $(heading).next();
        let count = 0;
        while (nextElement.length && count < 20) {
          nextElement.find('a[href*="/wiki/"]').each((_, link) => {
            const href = $(link).attr('href') || '';
            const text = $(link).text().trim();
            if (isPlayerName(text, href) && !playing11.includes(text)) {
              playing11.push(text);
            }
          });
          nextElement = nextElement.next();
          count++;
        }
      }
    });

    // Method 2: Look in infobox for current players
    $('.infobox').find('a[href*="/wiki/"]').each((_, link) => {
      const text = $(link).text().trim();
      const href = $(link).attr('href') || '';
      if (isPlayerName(text, href) && !playing11.includes(text)) {
        playing11.push(text);
      }
    });

    // Method 3: Look in tables with player names
    $('table.wikitable').each((_, table) => {
      const tableText = $(table).text().toLowerCase();
      if (tableText.includes('player') || tableText.includes('name')) {
        $(table).find('td:first-child a, th:first-child a').each((_, link) => {
          const text = $(link).text().trim();
          const href = $(link).attr('href') || '';
          if (isPlayerName(text, href) && !playing11.includes(text)) {
            playing11.push(text);
          }
        });
      }
    });

    return {
      name: teamName,
      country: teamName,
      flag: TEAM_FLAGS[teamName] || '🏏',
      playing11: playing11.slice(0, 11), // Limit to 11 players
    };
  } catch (error) {
    console.error(`Error fetching team info for ${teamName}:`, error);
    return {
      name: teamName,
      country: teamName,
      flag: TEAM_FLAGS[teamName] || '🏏',
      playing11: [],
    };
  }
}

export async function getPlayerInfo(playerName: string, teamName?: string): Promise<PlayerInfo | null> {
  try {
    // Search for player on Wikipedia
    const searchUrl = `https://en.wikipedia.org/wiki/Special:Search/${encodeURIComponent(playerName)}`;
    const searchHtml = await fetchWikipediaPage(searchUrl);
    const $search = cheerio.load(searchHtml);
    
    // Find the first result link
    let playerUrl = '';
    $search('.mw-search-result-heading a').first().each((_, link) => {
      const href = $search(link).attr('href');
      if (href) {
        playerUrl = href.startsWith('http') ? href : `https://en.wikipedia.org${href}`;
      }
    });

    if (!playerUrl) {
      // Try direct page access
      const wikiSlug = playerName.replace(/\s+/g, '_');
      playerUrl = `https://en.wikipedia.org/wiki/${wikiSlug}`;
    }

    const html = await fetchWikipediaPage(playerUrl);
    const $ = cheerio.load(html);

    // Extract player information from infobox
    const info: PlayerInfo = {
      name: playerName,
      wikipediaUrl: playerUrl,
    };

    // Get full name
    const fullName = $('.infobox .fn, .infobox th:contains("Full name")').next().text().trim() ||
                     $('.infobox th:contains("Born")').parent().find('td').first().text().trim();
    if (fullName) info.fullName = fullName;

    // Get image
    const image = $('.infobox img').first().attr('src');
    if (image) {
      info.imageUrl = image.startsWith('http') ? image : `https:${image}`;
    }

    // Get role/position
    const roleText = $('.infobox th:contains("Role")').next().text().trim() ||
                    $('.infobox th:contains("Batting")').text().trim();
    if (roleText) info.role = roleText;

    // Get batting style
    const battingStyle = $('.infobox th:contains("Batting")').next().text().trim();
    if (battingStyle) info.battingStyle = battingStyle;

    // Get bowling style
    const bowlingStyle = $('.infobox th:contains("Bowling")').next().text().trim();
    if (bowlingStyle) info.bowlingStyle = bowlingStyle;

    // Get date of birth
    const dobText = $('.infobox th:contains("Born")').next().text().trim();
    if (dobText) {
      const dobMatch = dobText.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
      if (dobMatch) {
        try {
          info.dateOfBirth = new Date(dobText);
        } catch (e) {
          // Ignore date parsing errors
        }
      }
    }

    // Get place of birth
    const pobText = $('.infobox th:contains("Born")').next().text().trim();
    if (pobText) {
      const pobMatch = pobText.match(/\(([^)]+)\)/);
      if (pobMatch) {
        info.placeOfBirth = pobMatch[1];
      }
    }

    // Try to extract stats from infobox tables
    const stats: any = {};
    
    // Look for career statistics section
    $('h2, h3').each((_, heading) => {
      const headingText = $(heading).text().toLowerCase();
      if (headingText.includes('career statistics') || headingText.includes('statistics')) {
        let nextTable = $(heading).nextAll('table').first();
        if (nextTable.length) {
          const headers = nextTable.find('th').map((_, th) => $(th).text().trim().toLowerCase()).get();
          const formatIndex = headers.findIndex(h => h.includes('test') || h.includes('odi') || h.includes('t20'));
          
          if (formatIndex >= 0) {
            nextTable.find('tr').each((_, row) => {
              const cells = $(row).find('td, th').map((_, cell) => $(cell).text().trim()).get();
              if (cells.length > formatIndex) {
                const format = headers[formatIndex];
                const formatKey = format.includes('test') ? 'test' : format.includes('odi') ? 'odi' : 't20i';
                
                if (!stats[formatKey]) stats[formatKey] = {};
                
                const rowLabel = cells[0]?.toLowerCase() || '';
                const value = cells[formatIndex + 1] || '';
                
                if (rowLabel.includes('matches')) stats[formatKey].matches = parseInt(value) || 0;
                if (rowLabel.includes('runs scored') || rowLabel.includes('runs')) stats[formatKey].runs = parseInt(value) || 0;
                if (rowLabel.includes('wickets')) stats[formatKey].wickets = parseInt(value) || 0;
                if (rowLabel.includes('batting average')) stats[formatKey].battingAverage = value;
                if (rowLabel.includes('bowling average')) stats[formatKey].bowlingAverage = value;
                if (rowLabel.includes('strike rate')) stats[formatKey].strikeRate = value;
                if (rowLabel.includes('economy')) stats[formatKey].economyRate = value;
                if (rowLabel.includes('high') && rowLabel.includes('score')) stats[formatKey].highestScore = value;
                if (rowLabel.includes('best') && rowLabel.includes('bowling')) stats[formatKey].bestBowling = value;
                if (rowLabel.includes('centuries') || rowLabel.includes('100s')) stats[formatKey].centuries = parseInt(value) || 0;
                if (rowLabel.includes('fifties') || rowLabel.includes('50s')) stats[formatKey].halfCenturies = parseInt(value) || 0;
                if (rowLabel.includes('5 wicket')) stats[formatKey].fiveWickets = parseInt(value) || 0;
              }
            });
          }
        }
      }
    });

    if (Object.keys(stats).length > 0) {
      info.stats = stats;
    }

    return info;
  } catch (error) {
    console.error(`Error fetching player info for ${playerName}:`, error);
    return null;
  }
}

export async function scrapeAllTeams(): Promise<TeamInfo[]> {
  const teams = ['India', 'Australia', 'England', 'Pakistan', 'South Africa'];
  const results: TeamInfo[] = [];

  for (const team of teams) {
    try {
      const teamInfo = await getTeamInfo(team);
      results.push(teamInfo);
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error scraping team ${team}:`, error);
    }
  }

  return results;
}

