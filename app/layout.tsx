import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DealDesk — Fair Pay Checker for Micro-Creators in India',
  description: "Paste a brand's DM or email. Know in seconds if it's fair, what you'd be giving away, how that brand usually pays, and a reply to send.",
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
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-teal-100 selection:text-teal-900">
        {children}
      </body>
    </html>
  );
}
