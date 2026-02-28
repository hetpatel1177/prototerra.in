import type { Metadata } from 'next';
import { Inter, Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import dynamic from 'next/dynamic';
import SmoothScroll from '@/components/SmoothScroll';
import Navbar from '@/components/Navbar';
import Providers from '@/components/Providers';

const Footer = dynamic(() => import('@/components/Footer'), {
  ssr: true, // Keep SEO but separate chunk
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://prototerra.in'),
  title: 'ProtoTerra | Earth & Code',
  description: 'Technology shaped by Earth. Immersive storytelling environment and premium products built from nature.',
  keywords: ['ProtoTerra', 'Earth', 'Code', 'Sustainable Tech', 'Premium Accessories', 'Natural Materials'],
  authors: [{ name: 'ProtoTerra' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://prototerra.in',
    siteName: 'ProtoTerra',
    title: 'ProtoTerra | Earth & Code',
    description: 'Technology shaped by Earth. Immersive storytelling environment and premium products built from nature.',
    images: [{
      url: 'https://prototerra.in/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'ProtoTerra Header Image',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProtoTerra | Earth & Code',
    description: 'Technology shaped by Earth. Immersive storytelling environment and premium products built from nature.',
    creator: '@prototerra',
    images: ['https://prototerra.in/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased bg-pt-bg text-pt-text selection:bg-pt-clay selection:text-pt-bg" suppressHydrationWarning>
        <Providers>
          <SmoothScroll>
            <Navbar />
            {children}
            <Footer />
          </SmoothScroll>
        </Providers>
      </body>
    </html>
  );
}
