import { BookOpenCheck, Headphones, PenLine } from "lucide-react"
import { EmptyState } from "@/components/common/Page"

interface IfaSkillPlaceholderPageProps {
  skill: "Listening" | "Reading" | "Writing"
}

export function IfaSkillPlaceholderPage({ skill }: IfaSkillPlaceholderPageProps) {
  const Icon = skill === "Listening" ? Headphones : skill === "Reading" ? BookOpenCheck : PenLine

  return (
    <EmptyState
      icon={Icon}
      title={`${skill} — IELTS Foundation A`}
      description="Nội dung đang được cập nhật."
    />
  )
}
