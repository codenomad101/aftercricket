// Test the updated JSON extraction
const fs = require('fs');

const html = fs.readFileSync('/tmp/cricbuzz-homepage.html', 'utf-8');

console.log('Testing updated JSON extraction...\n');

// Look for match patterns directly in the HTML
const matchPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+vs\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([^"\\]+?)(?:"|\\)/g;

let count = 0;
let matchData;

while ((matchData = matchPattern.exec(html)) !== null) {
    const team1 = matchData[1].trim();
    const team2 = matchData[2].trim();
    const matchDesc = matchData[3].trim();

    if (team1.length < 3 || team2.length < 3) continue;
    if (team1.includes('{') || team2.includes('{')) continue;

    count++;
    console.log(`Match ${count}:`);
    console.log(`  Teams: ${team1} vs ${team2}`);
    console.log(`  Description: ${matchDesc}`);

    // Extract format
    const formatMatch = matchDesc.match(/(\d+)(?:st|nd|rd|th)?\s*(T20I|ODI|Test)/i);
    if (formatMatch) {
        console.log(`  Format: ${formatMatch[2]}`);
    } else if (matchDesc.toLowerCase().includes('test')) {
        console.log(`  Format: Test`);
    } else if (matchDesc.toLowerCase().includes('t20')) {
        console.log(`  Format: T20I`);
    }

    // Look for timing
    const matchIndex = matchPattern.lastIndex;
    const searchWindow = html.substring(Math.max(0, matchIndex - 1000), matchIndex + 1000);
    const timePattern = /(Today|Tomorrow|Mon|Tue|Wed|Thu|Fri|Sat|Sun)[^"]*?(\d{1,2}:\d{2}\s*(?:AM|PM))[^"]*?GMT/i;
    const timeMatch = searchWindow.match(timePattern);

    if (timeMatch) {
        console.log(`  Time: ${timeMatch[1]} • ${timeMatch[2]}`);
    }

    console.log('');

    if (count >= 10) break;
}

console.log(`\nTotal matches found: ${count}`);
