
import { NextRequest, NextResponse } from 'next/server';
import { generateMatchPrediction } from '@/lib/huggingface';
import { CricketMatch } from '@/types';

// Simple in-memory cache for demo purposes
// In production, use Redis or database
const predictionCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { match } = body as { match: CricketMatch };

        if (!match || !match.id) {
            return NextResponse.json({ error: 'Invalid match data' }, { status: 400 });
        }

        // Check cache
        const cached = predictionCache.get(match.id);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            return NextResponse.json(cached.data);
        }

        // Generate new prediction
        const prediction = await generateMatchPrediction(match);

        if (!prediction) {
            return NextResponse.json({ error: 'Failed to generate prediction' }, { status: 500 });
        }

        // Update cache
        predictionCache.set(match.id, {
            data: prediction,
            timestamp: Date.now()
        });

        return NextResponse.json(prediction);
    } catch (error) {
        console.error('Prediction API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
