import type { Metadata } from "next";
import { Space_Grotesk, Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { SceneHost } from "@/components/canvas/SceneHost";
import { Navbar } from "@/components/layout/Navbar";
import { TimecodePreloader } from "@/components/layout/TimecodePreloader";
import { CustomCursor } from "@/components/layout/CustomCursor";

const fontDisplay = Space_Grotesk({
  subsets: ["latin", "vietnamese"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const fontSans = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const fontMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "THIẾT BỊ GIA — Creative Media & Design Collective",
  description:
    "Portfolio tập thể của anh em Thiết Bị Gia: Photographer, Quay video (DOP), Dựng hậu kỳ, Ánh sáng và Thiết kế sáng tạo.",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`}
    >
      <body className="font-sans bg-obsidian text-ivory selection:bg-rec selection:text-obsidian">
        <SmoothScrollProvider>
          <TimecodePreloader />
          <CustomCursor />
          <Navbar />

          {/* Main Route Content */}
          <main className="relative min-h-[100dvh]">{children}</main>

          {/* Intercepting Overlay Slot (@modal) */}
          {modal}

          {/* Single Persistent WebGL Canvas across all routes & modals */}
          <SceneHost />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
