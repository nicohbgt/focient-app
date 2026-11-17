import type { Metadata } from 'next';
import './globals.css';
import '../components/components.css';
import { HorizontalScrollManager } from '../components/primitive/HorizontalScrollManager';

export const metadata: Metadata = {
  title: 'FoCient',
  description: 'Intelligent daily focus management, Top 3 isolation, and guilt-free adaptive rescheduling ecosystem.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/brand/focient-logo.svg', type: 'image/svg+xml' },
      { url: '/brand/focient-logo.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/brand/focient-logo.png',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/brand/focient-logo.png', sizes: '512x512', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563EB" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-neutral-canvas text-neutral-text font-sans antialiased">
        <HorizontalScrollManager />
        {children}
      </body>
    </html>
  );
}
