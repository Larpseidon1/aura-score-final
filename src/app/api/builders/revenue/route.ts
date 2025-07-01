import { NextRequest, NextResponse } from 'next/server';
import { getRealBuilderData } from '@/lib/realData';

// Mark this route as dynamic since it uses search parameters
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const timeRange = request.nextUrl.searchParams.get('timeRange') as '24h' | '7d' | '30d' | '90d' | 'all' || '7d';
    
    const data = await getRealBuilderData(timeRange);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
} 