import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora, Mynerve } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import EdgeBlur from "@/components/EdgeBlur";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const mynerve = Mynerve({
  variable: "--font-mynerve",
  weight: "400",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eric Forbush | UX Designer",
  description: "Creating simple and enjoyable digital experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${mynerve.variable} ${lora.variable} h-full scroll-smooth antialiased`}
    >
      <body className="relative min-h-full flex flex-col">
        <Nav />
        <EdgeBlur edge="top" />
        <main className="flex-1">{children}</main>
        <Footer />
        <EdgeBlur edge="bottom" />
      </body>
    </html>
  );
}
