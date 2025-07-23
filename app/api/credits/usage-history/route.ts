import { creditService } from '@/lib/services/credit-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('teamId');
  const limit = searchParams.get('limit') || '10';
  const offset = searchParams.get('offset') || '0';

  if (!teamId) {
    return NextResponse.json({ error: 'teamId is required' }, { status: 400 });
  }

  try {
    const history = await creditService.getUsageHistory(Number(teamId), Number(limit), Number(offset));
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error getting usage history:', error);
    return NextResponse.json({ error: 'Failed to get usage history' }, { status: 500 });
  }
}
