import { Inbox } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function EmptyDeck({
  title = "Không có thẻ nào",
  hint = "Đổi chủ đề hoặc bộ lọc ở cột trái.",
}: {
  title?: string
  hint?: string
}) {
  return (
    <Card>
      <CardContent className="flex min-h-[320px] flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <Inbox className="size-7 text-muted-foreground" />
        </div>
        <div>
          <p className="text-lg font-bold">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  )
}
