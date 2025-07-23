import { creditService, InsufficientCreditsError } from '@/lib/services/credit-service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { teamId, userId, credits, actionType, description, metadata } = await request.json();

  if (!teamId || !credits || !actionType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const newBalance = await creditService.useCredits(teamId, userId, credits, actionType, description, metadata);
    return NextResponse.json(newBalance);
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }
    console.error('Error using credits:', error);
    return NextResponse.json({ error: 'Failed to use credits' }, { status: 500 });
  }
}
