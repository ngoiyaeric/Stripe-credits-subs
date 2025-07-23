import { creditService } from '@/lib/services/credit-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('teamId');

  if (!teamId) {
    return NextResponse.json({ error: 'teamId is required' }, { status: 400 });
  }

  try {
    const balance = await creditService.getCreditBalance(Number(teamId));
    return NextResponse.json(balance);
  } catch (error) {
    console.error('Error getting credit balance:', error);
    return NextResponse.json({ error: 'Failed to get credit balance' }, { status: 500 });
  }
}
