"use client";

import dynamic from "next/dynamic";

// The family view reads the clock and this browser's saved answers, so it renders on the client only.
const FamilyView = dynamic(() => import("./FamilyView"), { ssr: false });

export default function FamilyPage() {
  return <FamilyView />;
}
