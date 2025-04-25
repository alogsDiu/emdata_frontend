import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nunito_Sans } from 'next/font/google'; // Import the font
import Footer from "@/components/general/Footer";

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],        // Specify character subsets
  weight: ['400', '700'], // Specify desired weights
  display: 'swap',          // Recommended display strategy
  variable: '--font-nunito-sans' // Define a CSS variable (optional but good practice)
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Emdata",
  description: "Emdata a platform for storing and sharing personal madical data, and with the ability to sum up everything and give medical 'advice'",
  icons: {
    icon: '/favicon.ico', // Add this line to reference your icon
  },
};

type locale = Promise<{ locale: string }>;

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: locale;
}>) {
  
  let locale = (await params).locale;

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} ${nunitoSans.variable}`}>
        {children}
        <Footer locale={locale} />
      </body>
    </html>
  );
}
