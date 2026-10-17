import { notFound } from "next/navigation";
import { findTopic, TOPICS } from "@/lib/lessons";
import { TopicView } from "./TopicView";

// One page per topic, built ahead of time for all 8 topics.
export function generateStaticParams() {
  return TOPICS.map((t) => ({ topic: t.id }));
}

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const found = findTopic(topic);
  if (!found) return notFound();
  return <TopicView id={found.id} />;
}
