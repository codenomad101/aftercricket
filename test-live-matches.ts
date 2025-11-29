
import 'dotenv/config';
import { getLiveMatches } from './src/lib/cricket-scraper';

async function test() {
    console.log('Testing getLiveMatches with new scraping logic...');
    try {
        const matches = await getLiveMatches(true); // Force refresh
        console.log(`Found ${matches.length} matches:`);
        matches.forEach(m => {
            console.log(`\nMatch: ${m.name}`);
            console.log(`Status: ${m.status}`);
            console.log(`Type: ${m.matchType}`);
            if (m.score) {
                console.log('Scores:');
                m.score.forEach(s => {
                    console.log(`  ${s.inning}: ${s.r}/${s.w} (${s.o} ov)`);
                });
            } else {
                console.log('No scores found');
            }
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
