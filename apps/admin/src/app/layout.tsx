import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bania Admin",
  description: "Admin panel for Bania booking system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
