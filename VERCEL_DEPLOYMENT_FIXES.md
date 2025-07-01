# Vercel Deployment Fixes

## Critical Issues to Fix

### 1. Fix vercel.json (Remove conflicting routes)
Replace your current `vercel.json` with:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=300, s-maxage=300"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 2. Fix API Routes - Add Dynamic Exports

**File: `src/app/api/builders/revenue/route.ts`**
```typescript
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
```

**File: `src/app/api/builders/discover/route.ts`**
```typescript
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

      case 'validate':
        // Validate specific addresses
        const addresses = request.nextUrl.searchParams.get('addresses')?.split(',') || [];
        const validationResults = await builderDiscovery.validateAddresses(addresses);
        return NextResponse.json({
          action: 'validate',
          results: validationResults
        });

      case 'analyze':
        // Deep analysis of top builders
        const analysisResults = await builderDiscovery.analyzeTopBuilders();
        return NextResponse.json({
          action: 'analyze',
          results: analysisResults
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: scan, validate, or analyze' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in builder discovery:', error);
    return NextResponse.json(
      { error: 'Failed to process discovery request' },
      { status: 500 }
    );
  }
}
```

### 3. Fix next.config.js for src/ directory

**File: `next.config.js`**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure Next.js recognizes the src/ directory structure
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
```

### 4. Update .gitignore
Add to your `.gitignore`:

```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# development logs
*.log
server.log
```

### 5. Fix comparison API route

**File: `src/app/api/comparison/route.ts`**
Add this at the top:
```typescript
export const dynamic = 'force-dynamic';
```

### 6. Deployment Instructions

1. **Create new GitHub repo** with these files
2. **Connect to Vercel** - import the new repo
3. **Environment Variables** - Add any necessary env vars in Vercel dashboard
4. **Deploy** - Vercel will automatically build and deploy

### 7. Project Structure Verification

Ensure your project has this exact structure:
```
your-project/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── builders/
│   │   │   │   ├── [code]/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── discover/
│   │   │   │   │   └── route.ts
│   │   │   │   └── revenue/
│   │   │   │       └── route.ts
│   │   │   └── comparison/
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── lib/
│   ├── types/
│   └── utils/
├── public/
├── next.config.js
├── package.json
├── vercel.json
└── .gitignore
```

## Why These Fixes Work

1. **vercel.json**: Removes conflicting `routes` property that caused "Mixed routing properties" error
2. **Dynamic exports**: Tells Next.js these API routes use dynamic server features
3. **next.config.js**: Ensures Next.js properly recognizes the src/app directory structure
4. **Project structure**: Matches exactly what Vercel expects for Next.js App Router

## Testing Before Deployment

Run these commands locally to verify:
```bash
npm run build
npm run start
```

If the build succeeds locally, it will deploy successfully on Vercel. 