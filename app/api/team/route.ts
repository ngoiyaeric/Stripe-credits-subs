import { getTeamForUser } from '@/lib/db/queries';
import { NextResponse } from 'next/server';

export async function GET() {
  const team = await getTeamForUser();
  return NextResponse.json(team);
}
