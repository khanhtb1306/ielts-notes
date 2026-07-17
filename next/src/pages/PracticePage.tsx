import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Trophy, X, Sparkles, PlayCircle } from "lucide-react"
import { useData } from "@/stores/data"
import { useHistory } from "@/stores/history"
import { usePractice, uid } from "@/stores/practice"
import { samplePool, hashCode, type SamplePoolConfig } from "@/lib/sample-pool"
import { displayLabel } from "@/lib/topic-label"
import type { QuestionKind, TopicRole } from "@/types/content"

const ALL_TYPES: QuestionKind[] = ["fill_blank", "single_choice", "multi_select", "matching"]
const ALL_ROLES: TopicRole[] = ["core", "review", "preview"]

interface MixRow {
  topic: string
  percent: number
}

export function PracticePage() {
  const { topicsIndex, topicLabels, practicePresets } = useData()
  const allEntries = useHistory((s) => s.entries)
  const historyEntries = allEntries.slice(0, 5)
  const save = usePractice((s) => s.save)
  const navigate = useNavigate()

  const [presetId, setPresetId] = useState<string>("")
  const [total, setTotal] = useState<number>(30)
  const [seedStr, setSeedStr] = useState<string>("")
  const [types, setTypes] = useState<Set<QuestionKind>>(new Set(ALL_TYPES))
  const [roles, setRoles] = useState<Set<TopicRole>>(new Set(ALL_ROLES))
  const [mix, setMix] = useState<MixRow[]>([])
  const [warn, setWarn] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const topicOptions = useMemo(() => {
    const keys = topicsIndex.order || Object.keys(topicsIndex.topics)
    return keys.map((k) => {
      const label = displayLabel(topicLabels[k], k)
      const n = (topicsIndex.topics[k]?.refs || []).filter((r) => r.kind === "question").length
      return { key: k, label, n }
    })
  }, [topicsIndex, topicLabels])

  function applyPreset(id: string) {
    setPresetId(id)
    if (!id) return
    const p = practicePresets.find((x) => x.id === id)
    if (!p) return
    setTotal(p.totalQuestions || 30)
    setMix(p.mix.map((m) => ({ topic: m.topic, percent: m.percent })))
    setTypes(new Set(p.questionTypes || ALL_TYPES))
  }

  function addRow(topic: string) {
    if (!topic || mix.some((m) => m.topic === topic)) return
    setMix([...mix, { topic, percent: 10 }])
  }
  function updateRow(topic: string, percent: number) {
    setMix(mix.map((m) => (m.topic === topic ? { ...m, percent } : m)))
  }
  function removeRow(topic: string) {
    setMix(mix.filter((m) => m.topic !== topic))
  }
  function resetMix() {
    setMix([])
    setPresetId("")
    setWarn(null)
    setInfo(null)
  }
  function toggleType(t: QuestionKind, on: boolean) {
    const next = new Set(types)
    if (on) next.add(t)
    else next.delete(t)
    setTypes(next)
  }
  function toggleRole(r: TopicRole, on: boolean) {
    const next = new Set(roles)
    if (on) next.add(r)
    else next.delete(r)
    setRoles(next)
  }

  const sumPct = mix.reduce((s, m) => s + m.percent, 0)
  const pctColor = Math.abs(sumPct - 100) > 0.5 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"

  function generate() {
    setWarn(null)
    setInfo(null)
    const activeMix = mix.filter((m) => m.percent > 0)
    if (!activeMix.length) {
      setWarn("Cần chọn ít nhất 1 topic có % > 0.")
      return
    }
    const totalPct = activeMix.reduce((s, m) => s + m.percent, 0)
    if (Math.abs(totalPct - 100) > 0.5) {
      setWarn(`Tổng % phải bằng 100 (hiện: ${totalPct}).`)
      return
    }
    const seed = seedStr.trim()
      ? parseInt(seedStr.trim(), 10) || hashCode(seedStr.trim())
      : Math.floor(Math.random() * 1e9)
    const config: SamplePoolConfig = {
      mix: activeMix,
      total,
      seed,
      questionTypes: [...types],
      roles: [...roles],
    }
    const sampled = samplePool(topicsIndex, config)
    if (!sampled.questions.length) {
      setWarn("Không có câu nào match filter. Nới lỏng loại câu / vai trò / topic.")
      return
    }
    const notices: string[] = []
    if (sampled.skipped.length)
      notices.push(
        `Đã bỏ qua topic không có câu: ${sampled.skipped.map((s) => `${s.topic} (${s.percent}%)`).join(", ")}.`
      )
    if (sampled.shortages.length)
      notices.push(
        `Một số topic không đủ câu: ${sampled.shortages.map((s) => `${s.topic} (${s.got}/${s.wanted})`).join(", ")}.`
      )
    if (notices.length) setInfo(notices.join(" "))

    const presetLabel = presetId ? practicePresets.find((p) => p.id === presetId)?.label || null : null
    const sessionId = uid()
    save({
      id: sessionId,
      config,
      presetId: presetId || null,
      presetLabel,
      questions: sampled.questions,
      answers: {},
      startedAt: Date.now(),
    })
    setTimeout(() => navigate(`/practice/runner/${sessionId}`), 150)
  }

  useEffect(() => {
    if (presetId && practicePresets.length && mix.length === 0) applyPreset(presetId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-orange-500/10 via-card to-card p-6">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="h-5 w-5 text-orange-500" />
          <Badge variant="secondary">Generator</Badge>
        </div>
        <h2 className="text-2xl font-bold">Final Practice</h2>
        <p className="text-muted-foreground mt-1">
          Chọn preset chuẩn từ đề mẫu, hoặc tùy chỉnh tỷ lệ % topic; bấm Generate để sinh phiên quiz shuffle. Chấm điểm client-side.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Preset</Label>
              <select
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                value={presetId}
                onChange={(e) => applyPreset(e.target.value)}
              >
                <option value="">— Custom —</option>
                {practicePresets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Tổng số câu</Label>
              <Input
                type="number"
                min={5}
                max={200}
                value={total}
                onChange={(e) => setTotal(parseInt(e.target.value, 10) || 30)}
              />
            </div>
            <div className="space-y-1">
              <Label>Random seed (optional)</Label>
              <Input
                type="text"
                placeholder="để trống = ngẫu nhiên"
                value={seedStr}
                onChange={(e) => setSeedStr(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Loại câu</Label>
              <div className="mt-2 flex flex-wrap gap-3">
                {ALL_TYPES.map((t) => (
                  <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={types.has(t)} onCheckedChange={(v) => toggleType(t, !!v)} />
                    {t}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label>Vai trò</Label>
              <div className="mt-2 flex flex-wrap gap-3">
                {ALL_ROLES.map((r) => (
                  <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={roles.has(r)} onCheckedChange={(v) => toggleRole(r, !!v)} />
                    {r}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Mix topic (%)</Label>
              <div className="text-sm text-muted-foreground">
                Tổng %: <b className={pctColor}>{sumPct.toFixed(0)}</b> · Câu: <b>{total}</b>
              </div>
            </div>
            <div className="space-y-2">
              {mix.map((row) => {
                const label = displayLabel(topicLabels[row.topic], row.topic)
                const n = Math.round((row.percent / 100) * total)
                return (
                  <div key={row.topic} className="grid grid-cols-[1fr_100px_60px_40px] items-center gap-3">
                    <div className="font-medium text-sm truncate">{label}</div>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={row.percent}
                      onChange={(e) => updateRow(row.topic, parseFloat(e.target.value) || 0)}
                    />
                    <div className="text-sm text-muted-foreground tabular-nums">≈ {n}</div>
                    <Button variant="ghost" size="icon" onClick={() => removeRow(row.topic)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
            <div className="mt-3 flex gap-2">
              <select
                className="rounded-md border border-input bg-transparent px-3 py-2 text-sm flex-1"
                value=""
                onChange={(e) => {
                  addRow(e.target.value)
                  e.target.value = ""
                }}
              >
                <option value="">+ Thêm topic…</option>
                {topicOptions
                  .filter((t) => !mix.some((m) => m.topic === t.key))
                  .map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label} ({t.n} câu)
                    </option>
                  ))}
              </select>
              <Button variant="ghost" onClick={resetMix}>Reset mix</Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Button onClick={generate}>
              <Sparkles className="h-4 w-4" /> Generate
            </Button>
            {warn && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
                {warn}
              </div>
            )}
            {info && (
              <div className="rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-sm">{info}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {historyEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>5 phiên gần nhất</CardTitle>
            <CardDescription>Bấm để xem lại kết quả và câu sai.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border">
            {historyEntries.map((h) => {
              const pct = h.total ? Math.round((h.score / h.total) * 100) : 0
              return (
                <button
                  key={h.id}
                  className="w-full text-left flex items-center justify-between px-6 py-3 hover:bg-accent/30"
                  onClick={() => navigate(`/practice/result/${h.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold w-12 text-primary tabular-nums">{pct}%</div>
                    <div>
                      <div className="font-medium">{h.presetLabel || "custom"}</div>
                      <div className="text-xs text-muted-foreground">
                        {h.score}/{h.total} · {new Date(h.submittedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <PlayCircle className="h-5 w-5 text-muted-foreground" />
                </button>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
