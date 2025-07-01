# Hyperliquid Builder Revenue Dashboard

A modern, responsive web dashboard that displays revenue analytics for Hyperliquid builder codes. Built with Next.js 14+, TypeScript, and Tailwind CSS.

## Features

- **Real-time Revenue Analytics**: Track builder revenue with interactive charts
- **Combination Charts**: Bar charts showing daily revenue per builder with cumulative line overlay
- **Time Period Filtering**: Toggle between 24H, 7D, 30D, 90D, and All Time views
- **Builder Leaderboard**: Sortable table with pagination showing top builders
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark Theme**: Modern dark UI following hypeburn.fun aesthetic
- **Interactive Elements**: Hover tooltips, smooth animations, and transitions

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Data Fetching**: TanStack Query (React Query)
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hyperliquid-builder-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── builders/      # Builder API endpoints
│   │   └── index.ts       # Main type definitions
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard page
├── components/            # React components
│   ├── Dashboard.tsx      # Main dashboard component
│   ├── Header.tsx         # Dashboard header with metrics
│   ├── RevenueChart.tsx   # Main revenue chart
│   ├── StatsCards.tsx     # Statistics cards
│   └── BuilderLeaderboard.tsx # Builder ranking table
├── lib/                   # Utilities and data
│   ├── mockData.ts        # Mock data generation
│   └── queryClient.ts     # React Query configuration
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
    └── formatters.ts      # Data formatting utilities
```

## API Endpoints

### GET `/api/builders/revenue`
Returns dashboard data for the specified time range.

**Query Parameters:**
- `timeRange` (optional): '24h' | '7d' | '30d' | '90d' | 'all'

**Response:**
```typescript
{
  builders: BuilderRevenue[];
  timeRange: string;
  lastUpdated: string;
  totalRevenue: number;
  totalTransactions: number;
  activeBuilders: number;
  growthRate: number;
}
```

### GET `/api/builders/[code]`
Returns detailed data for a specific builder.

**Response:**
```typescript
{
  builderCode: string;
  builderName: string;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    transactionCount: number;
    avgFee: number;
  }>;
  totalRevenue: number;
  totalTransactions: number;
  avgFee: number;
  growthRate: number;
}
```

## Data Structure

### BuilderRevenue Interface
```typescript
interface BuilderRevenue {
  builderCode: string;
  builderName?: string;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    transactionCount: number;
    avgFee: number;
  }>;
  totalRevenue: number;
  totalTransactions: number;
  avgFee: number;
  growthRate: number;
}
```

## Customization

### Colors
The dashboard uses a custom color palette defined in `tailwind.config.js`:

- **Primary**: Orange (#f97316) - Main accent color
- **Secondary**: Gray scale - Background and text colors
- **Accent**: Yellow (#fbbf24) - Chart highlights
- **Success**: Green (#10b981) - Positive metrics
- **Error**: Red (#ef4444) - Negative metrics

### Adding Real Data
To integrate with real Hyperliquid data:

1. Replace mock data functions in `src/lib/mockData.ts`
2. Update API endpoints to fetch from real data sources
3. Add authentication if required
4. Implement real-time updates using WebSockets or polling

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Environment Variables
Create a `.env.local` file for local development:
```env
NEXT_PUBLIC_API_URL=your_api_url_here
```

## Performance

- **Initial Load**: Optimized for under 3 seconds
- **Caching**: API responses cached for 5-10 minutes
- **Bundle Size**: Optimized with Next.js built-in optimizations
- **Images**: Automatic optimization with Next.js Image component

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Design inspiration from [hypeburn.fun/builders](https://hypeburn.fun/builders)
- Built with modern web technologies for optimal performance and user experience 