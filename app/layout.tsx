import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import MobileNav from "@/components/mobile-nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PIXI - Color Palette Generator",
  description: "Generate beautiful color palettes with AI assistance",
  generator: "v0.dev",
  icons: {
    icon: [
      {
        url: "/favicon.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background")}>
        <ThemeProvider attribute="class" defaultTheme="light">
        <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-30">
            <div className="container flex items-center justify-between py-4">
              {/* Logo */}
              <Link href="/" className="font-bold text-xl">
                ■ PIXI
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:block">
                <div className="inline-flex items-center justify-center rounded-md border bg-background p-1">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-muted"
                  >
                    Home
                  </Link>
                  <Link
                    href="/palette-generator"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-muted"
                  >
                    Palette Generator
                  </Link>
                  <Link
                    href="/image-picker"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-muted"
                  >
                    Image Picker
                  </Link>
                  <Link
                    href="/explore-palette"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-muted"
                  >
                    Explore Palette
                  </Link>
                </div>
              </nav>

              {/* Right side */}
              <div className="flex items-center space-x-4">
                {/* Desktop user avatar */}
                <div className="hidden md:flex w-10 h-10 rounded-full border items-center justify-center">VV</div>

                {/* Mobile navigation */}
                <MobileNav />
              </div>
            </div>
          </header>

          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
