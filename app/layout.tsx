import type {Metadata} from 'next';
import {Fredoka, Quicksand} from 'next/font/google';
import './globals.css';

const fredoka = Fredoka({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fredoka',
  weight: ['400', '500', '600', '700'],
});

const quicksand = Quicksand({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-quicksand',
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Kids Reading App - Learn with Marlee, Kaylee & Ellee',
  description: 'Fun kids reading app for Marlee, Kaylee, and Ellee with age-tailored phonics, interactive stories, and premium AI voices.',
  openGraph: {
    title: 'Kids Reading App - Learn with Marlee, Kaylee & Ellee',
    description: 'Fun kids reading app for Marlee, Kaylee, and Ellee with age-tailored phonics, interactive stories, and premium AI voices.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kids Reading App - Learn with Marlee, Kaylee & Ellee',
    description: 'Fun kids reading app for Marlee, Kaylee, and Ellee with age-tailored phonics, interactive stories, and premium AI voices.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${fredoka.variable} ${quicksand.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased selection:bg-amber-200">
        {children}
      </body>
    </html>
  );
}


