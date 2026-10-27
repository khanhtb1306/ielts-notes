import { useState } from "react"
import { Volume2, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { dictLookup, playUrl } from "@/lib/tts"
import { useSpeak } from "@/lib/use-speak"

export function PronTool() {
  const [word, setWord] = useState("")
  const [result, setResult] = useState<{ ipa: string; audio: string } | null>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "empty">("idle")
  const speak = useSpeak()

  async function run() {
    const w = word.trim()
    if (!w) return
    speak(w)
    setStatus("loading")
    setResult(null)
    const d = await dictLookup(w)
    if (d && (d.ipa || d.audio)) {
      setResult(d)
      setStatus("done")
    } else {
      setStatus("empty")
    }
  }

  return (
    <Card className="searchable">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-primary" />
          Phát âm từ bất kỳ
        </CardTitle>
        <CardDescription>
          Gõ một từ tiếng Anh rồi bấm Nghe. Có mạng sẽ hiện IPA và giọng người thật; không mạng dùng giọng máy.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            id="pron-word"
            name="pron-word"
            aria-label="Từ cần tra phát âm"
            placeholder="Ví dụ: comfortable, delicious, restaurant..."
            value={word}
            onChange={(e) => setWord(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") run()
            }}
          />
          <div className="flex gap-2">
            <Button onClick={run}>Nghe</Button>
            <Button variant="outline" onClick={() => word.trim() && speak(word.trim())}>
              Giọng máy
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Giọng, âm điệu (Anh-Anh / Anh-Mỹ) và tốc độ đọc chỉnh chung ở nút Cài đặt trên thanh điều hướng — áp dụng cho toàn bộ web.
        </p>
        {status === "loading" && <div className="text-sm text-muted-foreground">Đang tra...</div>}
        {status === "done" && result && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
            {result.ipa && <span className="text-lg font-mono">{result.ipa}</span>}
            {result.audio && (
              <Button variant="outline" size="sm" onClick={() => playUrl(result.audio)}>
                <PlayCircle className="h-4 w-4" /> Giọng người thật
              </Button>
            )}
          </div>
        )}
        {status === "empty" && (
          <div className="text-sm text-muted-foreground">
            Đã đọc bằng giọng máy. Không có mạng hoặc không tìm thấy từ trong từ điển.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
