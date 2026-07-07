"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext.jsx";
import { AuthProvider } from "@/contexts/AuthContext.jsx";
import { SessionProvider } from "next-auth/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const variable = `${geistSans.variable} ${geistMono.variable}`;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#050505" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="UniVerse" />
        <link rel="apple-touch-icon" href="/app_icon.svg" />
      </head>
      <body
        className={`${variable} antialiased bg-white dark:bg-gray-900 transition-colors duration-300`}
      >
        <SessionProvider>
          <ThemeProvider>
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
