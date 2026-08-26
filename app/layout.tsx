import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import "./globals.css";

const zodiak = localFont({
  src: [
    {
      path: "./fonts/Zodiak-Variable.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-display",
  display: "swap",
});

const satoshi = localFont({
  src: [
    {
      path: "./fonts/Satoshi-Variable.woff2",
      weight: "300 900",
      style: "normal",
    },
    {
      path: "./fonts/Satoshi-Variable-Italic.woff2",
      weight: "300 900",
      style: "italic",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

const instrumentSerif = localFont({
  src: [
    {
      path: "./fonts/InstrumentSerif-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/InstrumentSerif-Italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Abdellah Kachani — UI/UX Designer",
  description:
    "Portfolio of Abdellah Kachani, UI/UX designer crafting cinematic, conversion-focused digital experiences.",
  metadataBase: new URL("https://abdellahkachani.com"),
  openGraph: {
    title: "Abdellah Kachani — UI/UX Designer",
    description:
      "Cinematic, conversion-focused digital experiences. Selected work and case studies.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Abdellah Kachani — UI/UX Designer",
    description:
      "Cinematic, conversion-focused digital experiences. Selected work and case studies.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="cursor-none-fine">
      <body
        className={`${zodiak.variable} ${satoshi.variable} ${instrumentSerif.variable} min-h-screen antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
