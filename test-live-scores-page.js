
const cheerio = require('cheerio');
const fs = require('fs');

async function analyzeLiveScoresPage() {
    console.log('Fetching Cricbuzz Live Scores page...\n');

    const response = await fetch('https://www.cricbuzz.com/cricket-match/live-scores', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        },
    });

    const html = await response.text();
    fs.writeFileSync('/tmp/cricbuzz-live-scores.html', html);
    console.log('✓ Saved HTML to /tmp/cricbuzz-live-scores.html\n');

    const $ = cheerio.load(html);

    console.log('=== SEARCHING FOR SCORES ===\n');

    // Look for common score patterns
    // 123-4, 123/4, 123/4 (20.0)
    const scoreElements = [];
    $('*').each((i, el) => {
        const text = $(el).clone().children().remove().end().text().trim();
        if (/^\d{1,3}[/-]\d{1,2}/.test(text) && text.length < 20) {
            scoreElements.push({
                tag: $(el).prop('tagName'),
                class: $(el).attr('class'),
                text: text
            });
        }
    });

    console.log(`Found ${scoreElements.length} potential score elements:\n`);
    scoreElements.slice(0, 10).forEach(el => {
        console.log(`${el.tag}.${el.class}: "${el.text}"`);
    });

    // Analyze hierarchy for the first score
    if (scoreElements.length > 0) {
        console.log('\n=== HIERARCHY ANALYSIS ===\n');
        const firstScore = $('span:contains("' + scoreElements[0].text + '")').first();

        // Find the row container (Parent 1 from previous analysis)
        const row = firstScore.closest('div.flex.items-center.gap-4.justify-between');
        if (row.length > 0) {
            console.log('Row HTML:');
            console.log(row.html());

            console.log('\nRow Children:');
            row.children().each((i, child) => {
                console.log(`Child ${i}: ${$(child).prop('tagName')}.${$(child).attr('class')}`);
                console.log(`  Text: "${$(child).text()}"`);
            });
        }
        let current = firstScore;
        for (let i = 0; i < 5; i++) {
            current = current.parent();
            console.log(`Parent ${i + 1}: ${current.prop('tagName')}.${current.attr('class')}`);
            // Print text of parent (truncated)
            console.log(`  Text: ${current.text().substring(0, 100).replace(/\s+/g, ' ')}`);
        }
    }

    // Look for match containers
    console.log('\n=== MATCH CONTAINERS ===\n');
    const matchContainers = $('.cb-mtch-lst');
    console.log(`Found ${matchContainers.length} .cb-mtch-lst elements`);

    const liveScores = $('.cb-lv-scrs-well');
    console.log(`Found ${liveScores.length} .cb-lv-scrs-well elements`);

    if (liveScores.length > 0) {
        console.log('\nSample Live Score Element:');
        console.log(liveScores.first().text().substring(0, 200));
    }
}

analyzeLiveScoresPage().catch(console.error);
