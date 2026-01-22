import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const rubik = Rubik({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dojo HelpDesk",
  description: "A modern ticketing system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${rubik.className} antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
