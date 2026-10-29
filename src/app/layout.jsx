import './globals.css';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'ODYSSEY — The Journey of a Software Engineer',
  description:
    'An interactive, cinematic journey through the worlds of a software engineer. Built with WebGL, Three.js and shaders.',
  openGraph: {
    title: 'ODYSSEY — The Journey of a Software Engineer',
    description: 'Enter another universe. A cinematic developer portfolio.',
    type: 'website',
  },
};

export const viewport = {
  themeColor: '#02030a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body className="grain edge-vignette">{children}</body>
    </html>
  );
}
