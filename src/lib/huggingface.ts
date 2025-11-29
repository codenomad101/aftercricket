
import { CricketMatch } from '@/types';

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const MODEL_ID = 'HuggingFaceH4/zephyr-7b-beta'; // A good general purpose instruction model

interface PredictionResult {
    winner: string;
    probability: number;
    reasoning: string;
}

export async function generateMatchPrediction(match: CricketMatch): Promise<PredictionResult | null> {
    if (!HUGGINGFACE_API_KEY) {
        console.error('HUGGINGFACE_API_KEY is not set');
        return null;
    }

    try {
        const prompt = `
You are a cricket expert. Predict the winner of the following match based on general cricket knowledge.
Match: ${match.name}
Teams: ${match.teams.join(' vs ')}
Venue: ${match.venue}
Format: ${match.matchType}
Date: ${match.date}

Provide the response in the following JSON format ONLY:
{
  "winner": "Team Name",
  "probability": 75,
  "reasoning": "Brief explanation why"
}
`;

        const response = await fetch(
            `https://api-inference.huggingface.co/models/${MODEL_ID}`,
            {
                headers: {
                    Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 200,
                        return_full_text: false,
                        temperature: 0.1, // Low temperature for more deterministic results
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        // Parse the generated text to extract JSON
        if (Array.isArray(result) && result[0]?.generated_text) {
            const generatedText = result[0].generated_text;

            // Try to find JSON block
            const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    const prediction = JSON.parse(jsonMatch[0]);
                    return {
                        winner: prediction.winner,
                        probability: Math.min(Math.max(prediction.probability, 0), 100), // Clamp between 0-100
                        reasoning: prediction.reasoning
                    };
                } catch (e) {
                    console.error('Failed to parse prediction JSON:', e);
                }
            }
        }

        return null;
    } catch (error) {
        console.error('Error generating prediction:', error);

        // Fallback to mock prediction for demonstration if API fails
        console.log('Falling back to mock prediction');
        const teams = match.teams || ['Team A', 'Team B'];
        const randomWinner = teams[Math.floor(Math.random() * teams.length)];
        const randomProb = 55 + Math.floor(Math.random() * 30); // 55-85%

        return {
            winner: randomWinner,
            probability: randomProb,
            reasoning: `Based on recent form and head-to-head records, ${randomWinner} has a slight edge in these conditions. (Mock Prediction - API Unavailable)`
        };
    }
}
