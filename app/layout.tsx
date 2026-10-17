import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Fraunces } from "next/font/google";
import { BottomNav } from "@/components/BottomNav";
import { FirstRun } from "@/components/FirstRun";
import { ProfileRoot } from "@/components/ProfileRoot";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-atkinson" });
const fraunces = Fraunces({ subsets: ["latin"], weight: ["500"], variable: "--font-fraunces" });

export const metadata: Metadata = {
  title: "Elderwise",
  description: "Show it, say it, understand it: a patient voice AI companion for older adults.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F4F1EA",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${atkinson.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <ProfileRoot />
        <FirstRun />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
