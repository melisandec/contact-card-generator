import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CardCrafter — Create Stunning Contact Cards',
  description: 'Design beautiful, professional contact cards in minutes with CardCrafter. Export as PNG, PDF, or share online.',
  keywords: ['contact card', 'business card', 'card generator', 'design tool'],
  openGraph: {
    title: 'CardCrafter',
    description: 'Create stunning contact cards in minutes',
    type: 'website',
  },
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
