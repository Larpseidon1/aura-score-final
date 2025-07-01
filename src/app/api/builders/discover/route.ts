import { NextRequest, NextResponse } from 'next/server';
import { builderDiscovery } from '@/lib/builderDiscovery';

// Mark this route as dynamic since it uses search parameters
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const action = request.nextUrl.searchParams.get('action') || 'scan';

    switch (action) {
      case 'scan':
        // Scan potential addresses for builder activity
        const scanResults = await builderDiscovery.discoverFromAddressList();
        return NextResponse.json({
          action: 'scan',
          results: scanResults,
          summary: {
            total: scanResults.length,
            active: scanResults.filter(r => r.hasRevenue).length,
            inactive: scanResults.filter(r => !r.hasRevenue).length
          }
        });

      case 'analyze':
        // Analyze known builders
        const analysis = await builderDiscovery.analyzeKnownBuilders();
        return NextResponse.json({
          action: 'analyze',
          results: analysis
        });

      case 'csv':
        // Check CSV data existence
        const csvResults = await builderDiscovery.checkBuilderCSVData(
          // Test our known builders
          [
            '0x0cbf655b0d22ae71fba3a674b0e1c0c7e7f975af',
            '0x1cc34f6af34653c515b47a83e1de70ba9b0cda1f',
            '0x1922810825c90f4270048b96da7b1803cd8609ef',
            '0x6acc0acd626b29b48923228c111c94bd4faa6a43',
            '0x7975cafdff839ed5047244ed3a0dd82a89866081'
          ]
        );
        return NextResponse.json({
          action: 'csv',
          results: csvResults
        });

      case 'report':
        // Generate comprehensive report
        const report = await builderDiscovery.generateDiscoveryReport();
        return NextResponse.json({
          action: 'report',
          results: report
        });

      default:
        return NextResponse.json({
          error: 'Invalid action. Use: scan, analyze, csv, or report'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Builder discovery error:', error);
    return NextResponse.json({
      error: 'Failed to discover builders',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 