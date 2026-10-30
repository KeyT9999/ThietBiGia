import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { SceneHost } from "@/components/canvas/SceneHost";
import { Navbar } from "@/components/layout/Navbar";
import { TimecodePreloader } from "@/components/layout/TimecodePreloader";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { getPublicSiteContent } from "@/lib/site-content";

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

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0b0e",
};

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublicSiteContent();
  const settings = content.settings;
  const brandName = settings.brandName || "THIẾT BỊ GIA";
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://thietbigia.vn"
    ),
    icons: { icon: "/brand-logo.png", shortcut: "/brand-logo.png" },
    title: {
      default: brandName + " — " + (settings.brandSubtitle || "Creative Media Collective"),
      template: "%s | " + brandName,
    },
    description: settings.siteDescription,
    openGraph: {
      siteName: brandName,
      locale: "vi_VN",
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  const initialContent = await getPublicSiteContent();
  return (
    <html
      lang="vi"
      className={fontDisplay.variable + " " + fontSans.variable + " " + fontMono.variable}
    >
      <body className="font-sans bg-obsidian text-ivory selection:bg-rec selection:text-obsidian">
        <SmoothScrollProvider initialContent={initialContent}>
          <TimecodePreloader />
          <CustomCursor />
          <CommandPalette />
          <Navbar />
          <main className="relative min-h-[100dvh]">{children}</main>
          {modal}
          <SceneHost />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
