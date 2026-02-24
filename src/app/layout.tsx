import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
