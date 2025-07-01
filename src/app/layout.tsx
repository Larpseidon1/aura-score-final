import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const haasGrotText = localFont({
  src: [
    {
      path: '../fonts/NeueHaasGrotText-55Roman.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/NeueHaasGrotText-56RomanItalic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../fonts/NeueHaasGrotText-65Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/NeueHaasGrotText-66MediumItalic.otf',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../fonts/NeueHaasGrotText-75Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/NeueHaasGrotText-76BoldItalic.otf',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-haas-grot',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Aura Score',
  description: 'Quantifying taste, at scale—ranking projects by aura-adjusted revenue efficiency',
  keywords: 'Aura, Score, Hyperliquid, builder, revenue, analytics, dashboard, crypto, DeFi',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Aura Score',
    description: 'Quantifying taste, at scale—ranking projects by aura-adjusted revenue efficiency',
    url: 'https://maxxing.aura.money',
    siteName: 'Aura Score',
    images: [
      {
        url: '/link-preview.png',
        width: 1200,
        height: 630,
        alt: 'Aura Score - Hyperliquid Builder Revenue Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aura Score',
    description: 'Quantifying taste, at scale—ranking projects by aura-adjusted revenue efficiency',
    images: ['/link-preview.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${haasGrotText.className} text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
} 