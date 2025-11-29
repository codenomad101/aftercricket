import * as cheerio from 'cheerio';

async function testCricketTracker() {
  console.log('Testing CricTracker (crictracker.com) scrapability...\n');

  try {
    // Test 1: Check robots.txt
    console.log('1. Checking robots.txt...');
    try {
      const robotsResponse = await fetch('https://www.crictracker.com/robots.txt');
      const robotsText = await robotsResponse.text();
      console.log('Robots.txt content:');
      console.log(robotsText);
      console.log('\n');
    } catch (e) {
      console.log('Could not fetch robots.txt\n');
    }

    // Test 2: Check main page structure
    console.log('2. Checking main page structure...');
    const mainResponse = await fetch('https://www.crictracker.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!mainResponse.ok) {
      console.log(`Error: HTTP ${mainResponse.status}`);
      return;
    }

    const html = await mainResponse.text();
    const $ = cheerio.load(html);

    console.log('Page title:', $('title').text());
    console.log('Page loaded successfully\n');

    // Test 3: Look for live scores section
    console.log('3. Looking for live scores section...');
    const liveScoreSelectors = [
      '.live-score',
      '.live-scores',
      '[class*="live"]',
      '[class*="score"]',
      '[id*="live"]',
      '[id*="score"]',
    ];

    let foundLiveScores = false;
    for (const selector of liveScoreSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`Found ${elements.length} elements with selector: ${selector}`);
        foundLiveScores = true;
      }
    }

    if (!foundLiveScores) {
      console.log('No obvious live scores section found');
      console.log('Checking common cricket website patterns...\n');
    }

    // Test 4: Check for API endpoints in page source
    console.log('4. Checking for API endpoints...');
    const apiPatterns = [
      /api[^"']*\.json/gi,
      /fetch\(['"]([^'"]*api[^'"]*)['"]/gi,
      /axios\.(get|post)\(['"]([^'"]*api[^'"]*)['"]/gi,
      /\.get\(['"]([^'"]*api[^'"]*)['"]/gi,
    ];

    const foundApis: string[] = [];
    for (const pattern of apiPatterns) {
      const matches = html.match(pattern);
      if (matches) {
        foundApis.push(...matches);
      }
    }

    if (foundApis.length > 0) {
      console.log('Potential API endpoints found:');
      foundApis.slice(0, 10).forEach((api, i) => {
        console.log(`  ${i + 1}. ${api}`);
      });
    } else {
      console.log('No obvious API endpoints found in page source');
    }

    // Test 5: Check live scores page
    console.log('\n5. Checking live scores page...');
    try {
      const liveResponse = await fetch('https://www.crictracker.com/live-cricket-scores/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (liveResponse.ok) {
        const liveHtml = await liveResponse.text();
        const $live = cheerio.load(liveHtml);
        
        console.log('Live scores page title:', $live('title').text());
        
        // Look for match cards/containers
        const matchContainers = $live('[class*="match"], [class*="score"], [class*="card"]');
        console.log(`Found ${matchContainers.length} potential match containers`);
        
        if (matchContainers.length > 0) {
          console.log('\nSample structure:');
          const firstMatch = matchContainers.first();
          console.log('Class:', firstMatch.attr('class'));
          console.log('HTML snippet:', firstMatch.html()?.substring(0, 200));
        }
      }
    } catch (e) {
      console.log('Could not fetch live scores page:', e);
    }

    // Test 6: Check if site uses JavaScript rendering
    console.log('\n6. Checking for JavaScript-rendered content...');
    const scriptTags = $('script').length;
    console.log(`Found ${scriptTags} script tags`);
    
    if (scriptTags > 10) {
      console.log('⚠️  Site likely uses JavaScript for dynamic content');
      console.log('   May need headless browser (Puppeteer/Playwright) for scraping');
    }

    console.log('\n✅ Test completed!');
    console.log('\nRecommendation:');
    console.log('- Check terms of service before scraping');
    console.log('- Respect rate limits');
    console.log('- Consider using official APIs if available');

  } catch (error) {
    console.error('Error testing CricketTracker:', error);
  }
}

testCricketTracker();

