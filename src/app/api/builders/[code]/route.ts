import { NextRequest, NextResponse } from 'next/server';
import { getRealBuilderByCode } from '@/lib/realData';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    const builder = await getRealBuilderByCode(code);
    
    if (!builder) {
      return NextResponse.json(
        { error: 'Builder not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(builder);
  } catch (error) {
    console.error('Error fetching builder data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch builder data' },
      { status: 500 }
    );
  }
} 