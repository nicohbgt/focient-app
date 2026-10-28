import type { Metadata } from 'next';
import './globals.css';
import '../components/components.css';

export const metadata: Metadata = {
  title: 'FoCient — Focus & Efficient Guilt-Free Productivity',
  description: 'Intelligent daily focus management, Top 3 isolation, and guilt-free adaptive rescheduling ecosystem.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-neutral-canvas text-neutral-text font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
