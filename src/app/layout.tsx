import type { Metadata } from "next";
import { Geist, Geist_Mono, EB_Garamond, Mynerve } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { NavTransitionProvider } from "@/components/NavTransition";
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

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  // Without this, next/font only loads the upright style, so the browser
  // fakes italics by skewing it instead of using EB Garamond's actual
  // (much more distinct, calligraphic) italic design.
  style: ["normal", "italic"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${mynerve.variable} ${ebGaramond.variable} h-full scroll-smooth antialiased`}
    >
      <body className="relative min-h-full flex flex-col">
        <NavTransitionProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </NavTransitionProvider>
      </body>
    </html>
  );
}
