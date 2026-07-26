import type { TopicLabel, TopicIndexEntry } from "@/types/content"

export function displayLabel(
  meta: TopicLabel | TopicIndexEntry | undefined | null,
  fallback: string,
): string {
  if (!meta) return fallback
  return meta.viLabel || meta.label || fallback
}
