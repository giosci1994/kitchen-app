import type { Metadata } from 'next';
import './globals.css';
import CookieBanner from './CookieBanner';

export const metadata: Metadata = {
  title: 'Kitchen App',
  description: 'Gestionale automatizzato per i processi in cucina',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
