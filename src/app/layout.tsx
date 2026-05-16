import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import '../styles/tailwind.css';
import RegisterServiceWorker from '@/components/RegisterServiceWorker';

const geistSans = Geist({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-geist-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'ClashTimer — Upgrade Timer Manager',
  description:
    'Pantau semua timer upgrade Clash of Clans dari beberapa akun sekaligus. OCR screenshot otomatis, notifikasi Telegram, dan manajemen akun mudah.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={geistSans.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f1117" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ClashTimer" />
        <link rel="apple-touch-icon" href="/assets/images/app_logo.png" />
      </head>
      <body className={geistSans.className}>
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}