import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Root Game Tracker",
  description: "Track your Root board game matches",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
