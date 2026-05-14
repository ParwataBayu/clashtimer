import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import '../styles/tailwind.css';

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
      <body className={geistSans.className}>{children}
</body>
    </html>
  );
}