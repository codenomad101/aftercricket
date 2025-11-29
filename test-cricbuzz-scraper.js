// Enhanced test script to dump Cricbuzz HTML structure
const cheerio = require('cheerio');
const fs = require('fs');

async function analyzeCricbuzz() {
    console.log('Fetching Cricbuzz homepage...\n');

    const response = await fetch('https://www.cricbuzz.com/', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        },
    });

    const html = await response.text();

    // Save HTML for inspection
    fs.writeFileSync('/tmp/cricbuzz-homepage.html', html);
    console.log('✓ Saved HTML to /tmp/cricbuzz-homepage.html\n');

    const $ = cheerio.load(html);

    // Look for all divs with class attributes
    console.log('=== SEARCHING FOR MATCH-RELATED ELEMENTS ===\n');

    // Search for any element containing "vs" in text
    let matchElements = [];
    $('*').each((index, element) => {
        const $el = $(element);
        const text = $el.text();
        const directText = $el.clone().children().remove().end().text().trim();

        if ((text.includes(' vs ') || text.includes(' VS ')) && text.length < 500) {
            const classes = $el.attr('class') || 'no-class';
            const tag = $el.prop('tagName');
            matchElements.push({
                tag,
                classes,
                text: text.substring(0, 150),
                directText: directText.substring(0, 100)
            });
        }
    });

    console.log(`Found ${matchElements.length} elements containing "vs"\n`);

    // Group by classes to find patterns
    const classGroups = {};
    matchElements.forEach(el => {
        const key = `${el.tag}.${el.classes}`;
        if (!classGroups[key]) {
            classGroups[key] = [];
        }
        classGroups[key].push(el);
    });

    console.log('=== GROUPED BY ELEMENT TYPE ===\n');
    Object.entries(classGroups).slice(0, 10).forEach(([key, elements]) => {
        console.log(`${key} (${elements.length} occurrences)`);
        console.log(`  Example text: "${elements[0].text}"`);
        console.log('');
    });

    // Look for specific cricket-related classes
    console.log('\n=== SEARCHING FOR CRICKET-SPECIFIC CLASSES ===\n');

    const cricketClasses = [
        'match', 'score', 'live', 'cricket', 'team', 'cb-',
        'format', 'time', 'date', 'preview', 'odi', 't20', 'test'
    ];

    cricketClasses.forEach(keyword => {
        const elements = $(`[class*="${keyword}"]`);
        if (elements.length > 0 && elements.length < 100) {
            console.log(`[class*="${keyword}"]: ${elements.length} elements`);
            elements.slice(0, 2).each((i, el) => {
                const $el = $(el);
                console.log(`  ${$el.prop('tagName')}.${$el.attr('class')}: "${$el.text().substring(0, 80)}"`);
            });
            console.log('');
        }
    });

    // Check if it's a JavaScript-rendered page
    console.log('\n=== CHECKING FOR JAVASCRIPT RENDERING ===\n');
    const scripts = $('script');
    console.log(`Found ${scripts.length} script tags`);

    const hasReact = html.includes('react') || html.includes('React');
    const hasNext = html.includes('next') || html.includes('Next');
    const hasVue = html.includes('vue') || html.includes('Vue');

    console.log(`React detected: ${hasReact}`);
    console.log(`Next.js detected: ${hasNext}`);
    console.log(`Vue detected: ${hasVue}`);

    // Look for JSON data in script tags
    console.log('\n=== LOOKING FOR JSON DATA ===\n');
    scripts.each((i, script) => {
        const $script = $(script);
        const content = $script.html() || '';
        if (content.includes('match') && content.includes('{') && content.length < 5000) {
            console.log(`Script ${i + 1} (first 200 chars):`);
            console.log(content.substring(0, 200));
            console.log('...\n');
        }
    });
}

analyzeCricbuzz().catch(console.error);
