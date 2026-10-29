import { Headphones } from "lucide-react"
import { EmptyState } from "@/components/common/Page"
import { SkillBrief } from "@/components/ifa/SkillBrief"

/**
 * Listening skill page. Theory recap is available now; the practice papers are
 * still being prepared, so the list area shows an empty state for the moment.
 */
export function IfaListeningPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-10">
      <SkillBrief skill="listening" />

      <h3 className="pt-1 text-sm font-bold uppercase tracking-wide text-muted-foreground">Đề luyện tập</h3>

      <EmptyState
        icon={Headphones}
        title="Đề Listening đang được cập nhật"
        description="Phần lý thuyết ở trên đã sẵn sàng để ôn. Các bài luyện nghe sẽ được thêm vào đây."
      />
    </div>
  )
}
