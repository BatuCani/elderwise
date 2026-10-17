import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Fraunces } from "next/font/google";
import { BottomNav } from "@/components/BottomNav";
import { FirstRun } from "@/components/FirstRun";
import { LiveBar } from "@/components/LiveBar";
import { ProfileRoot } from "@/components/ProfileRoot";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-atkinson" });
const fraunces = Fraunces({ subsets: ["latin"], weight: ["500"], variable: "--font-fraunces" });

export const metadata: Metadata = {
  title: "Elderwise",
  description: "Show it, say it, understand it: a patient voice AI companion for older adults.",
  applicationName: "Elderwise",
  // "Add to Home Screen" on iPhone opens full screen, without Safari's bars.
  appleWebApp: { capable: true, title: "Elderwise", statusBarStyle: "default" },
  icons: { apple: "/apple-touch-icon.png" },
  // Next only emits the newer mobile-web-app-capable tag; older iOS versions still need this one.
  other: { "apple-mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F4F1EA",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${atkinson.variable} ${fraunces.variable} antialiased`}>
      <body className="flex flex-col">
        <ProfileRoot />
        <FirstRun />
        {/* On tablets and desktop the app sits in a phone-width column; the background stays full-bleed. */}
        <div className="mx-auto flex w-full max-w-app flex-1 flex-col">{children}</div>
        <LiveBar />
        <BottomNav />
      </body>
    </html>
  );
}
