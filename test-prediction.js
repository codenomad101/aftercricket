
// Standalone test script for Hugging Face API
require('dotenv').config({ path: '.env.local' });

// Mock match data
const mockMatch = {
    id: 'test-match-1',
    name: 'India vs Australia',
    teams: ['India', 'Australia'],
    venue: 'Wankhede Stadium, Mumbai',
    matchType: 'ODI',
    date: new Date().toISOString(),
};

async function testPrediction() {
    console.log('Testing prediction for:', mockMatch.name);
    try {
        // We need to mock fetch since we're running in Node environment
        // But since the utility uses native fetch (available in Node 18+), it might work if environment is correct
        // However, the utility is written in TS and uses Next.js imports, so we can't run it directly with node
        // Instead, let's create a simple script that mimics the utility logic to test the API key and endpoint

        const API_KEY = process.env.HUGGINGFACE_API_KEY;
        if (!API_KEY) {
            console.error('HUGGINGFACE_API_KEY not found in .env.local');
            return;
        }

        console.log('API Key found (starts with):', API_KEY.substring(0, 5) + '...');

        const MODEL_ID = 'distilbert-base-uncased-finetuned-sst-2-english';
        const prompt = `
You are a cricket expert. Predict the winner of the following match based on general cricket knowledge.
Match: ${mockMatch.name}
Teams: ${mockMatch.teams.join(' vs ')}
Venue: ${mockMatch.venue}
Format: ${mockMatch.matchType}
Date: ${mockMatch.date}

Provide the response in the following JSON format ONLY:
{
  "winner": "Team Name",
  "probability": 75,
  "reasoning": "Brief explanation why"
}
`;

        console.log('Sending request to Hugging Face...');
        const response = await fetch(
            `https://api-inference.huggingface.co/models/${MODEL_ID}`,
            {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 200,
                        return_full_text: false,
                        temperature: 0.1,
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Raw result:', JSON.stringify(result, null, 2));

        if (Array.isArray(result) && result[0]?.generated_text) {
            const generatedText = result[0].generated_text;
            console.log('Generated text:', generatedText);

            const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const prediction = JSON.parse(jsonMatch[0]);
                console.log('Parsed prediction:', prediction);
            } else {
                console.log('Could not find JSON in response');
            }
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testPrediction();
