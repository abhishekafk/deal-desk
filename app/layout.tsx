import type { Metadata } from 'next';
import { Onest } from 'next/font/google';
import './globals.css';

const onest = Onest({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-onest',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DealDesk — Fair Pay Checker for Micro-Creators in India',
  description: "Talk to DealDesk like a sharp friend who knows brand deals. Paste an offer, get a verdict, price ruler, and replies.",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full ${onest.variable}`}>
      <body className={`min-h-full flex flex-col bg-[#F3F5F9] text-[#121A2B] antialiased ${onest.className}`}>
        {children}
      </body>
    </html>
  );
}
