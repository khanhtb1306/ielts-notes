import { useNavigate } from "react-router-dom"
import { useMemo, type ReactNode } from "react"
import { useData } from "@/stores/data"
import { useProgress } from "@/stores/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, FileText, Headphones, Images } from "lucide-react"

const FINAL_ROOT = "/final/google-doc-pre-course"

const TEACHER_DOCS = [
  { topic: "Work and study", file: "Lesson 7 - Job.docx", focus: "dream job, job likes/dislikes" },
  { topic: "Appearance", file: "Lesson 8 - Appearance.docx", focus: "age, build, hair, clothes" },
  { topic: "Family", file: "Lesson 9 - Family.docx", focus: "family size, siblings, hobbies" },
  { topic: "Personality", file: "Lesson 10 - Personality.docx", focus: "neat, easy-going, sociable, generous" },
  { topic: "Free time / Hobbies", file: "Lesson 13 - Weekend.docx", focus: "weekend, sports, films, books, music" },
  { topic: "Travelling", file: "Lesson 14 - Trip.docx", focus: "past trip, future trip" },
  { topic: "Restaurants", file: "Lesson 16 - Restaurants.docx", focus: "restaurant, order, taste, service" },
  { topic: "Hometown", file: "Lesson 18 - Hometown.docx", focus: "where from, like/dislike, nature" },
  { topic: "Health", file: "Lesson 19 - Health.docx", focus: "healthy lifestyle, exercise, illness" },
]

const FINAL_QUESTIONS = [
  [1, "Name", "What's your name?"],
  [2, "Name", "How do you spell your name?"],
  [3, "Name", "Do you like your name?"],
  [4, "Age", "How old are you?"],
  [5, "Birthday", "When is your birthday?"],
  [6, "Work / Study", "What do you do?"],
  [7, "Work / Study", "Are you a student or are you working?"],
  [8, "Work / Study", "What is your dream job? Why?"],
  [9, "Free time", "What do you often do in your free time?"],
  [10, "Weekend", "What do you often do at the weekend?"],
  [11, "Sports", "Do you like sports? How often?"],
  [12, "Films", "Do you like watching films?"],
  [13, "Films", "What kinds of films do you like?"],
  [14, "Films", "What is your favourite film?"],
  [15, "Films", "Do you like watching films at the cinema?"],
  [16, "Books", "Do you like reading books? What do you like reading most?"],
  [17, "Music", "Do you like listening to music? What kind of music do you often listen to?"],
  [18, "Games", "Do you like playing computer games? What is your favourite computer game?"],
  [19, "Time", "What time is it in your country?"],
  [20, "Daily routine", "What time do you get up?"],
  [21, "Daily routine", "What time do you go to school/work?"],
  [22, "Daily routine", "What time do you have breakfast?"],
  [23, "Daily routine", "What time do you have lunch?"],
  [24, "Daily routine", "What time do you have dinner?"],
  [25, "Daily routine", "What time do you come home from school/work?"],
  [26, "Daily routine", "What time do you go to bed?"],
  [27, "Transport", "How do you go to school/work?"],
  [28, "Frequency", "How often do you phone your friend?"],
  [29, "Friends", "How often do you have friends round? What do you like to do?"],
  [30, "Family", "Do you live in a big family?"],
  [31, "Family", "What does your father/mother do?"],
  [32, "Appearance", "What does he/she look like?"],
  [33, "Appearance", "What kind of hair does he/she have?"],
  [34, "Clothes", "What kinds of clothes does he/she often wear?"],
  [35, "Personality", "What is he/she like?"],
  [36, "Personality", "Is he/she friendly, talkative, humorous, or generous?"],
  [37, "Likes", "What does he/she like?"],
  [38, "House", "What is your favourite room in your house?"],
  [39, "House", "Can you describe your living room/bedroom/kitchen?"],
  [40, "Travel", "Do you love travelling?"],
  [41, "Travel", "Tell me about one trip you remember the most."],
  [42, "Travel", "Tell me about one trip you want to take in the future."],
  [43, "Food", "What are your favourite foods/drinks? Are they good for you?"],
  [44, "Restaurant", "Do you like eating out? How often do you go to a restaurant?"],
  [45, "Shopping", "Do you like shopping? Why or why not?"],
  [46, "Shopping", "What kind of shops do you like? Why or why not?"],
  [47, "Unknown", "Chưa nghe rõ - nghe lại audio 47.wav"],
  [48, "Unknown", "Chưa nghe rõ - nghe lại audio 48.wav"],
  [49, "Unknown", "Chưa nghe rõ - nghe lại audio 49.wav"],
  [50, "Unknown", "Chưa nghe rõ - nghe lại audio 50.wav"],
] as const

function audioFileName(n: number, q: string) {
  const known: Record<number, string> = {
    1: "01 - What's your name.wav",
    2: "02 - How do you spell your name.wav",
    3: "03 - Do you like your name.wav",
    4: "04 - How old are you.wav",
    5: "05 - When is your birthday.wav",
    6: "06 - What do you do.wav",
    7: "07 - Are you a student or are you working.wav",
    8: "08 - What is your dream job - why.wav",
    9: "09 - What do you often do in your free time.wav",
    10: "10 - What do you often do at the weekend.wav",
    11: "11 - Do you like sports - how often.wav",
    12: "12 - Do you like watching films.wav",
    13: "13 - What kinds of films do you like.wav",
    14: "14 - What is your favourite film.wav",
    15: "15 - Do you like watching films at the cinema.wav",
    16: "16 - Do you like reading books - what do you like reading most.wav",
    17: "17 - Do you like listening to music - what kind of music do you often listen to.wav",
    18: "18 - Do you like playing computer games - what is your favourite computer game.wav",
    19: "19 - What time is it in your country.wav",
    20: "20 - What time do you get up.wav",
    21: "21 - What time do you go to school or work.wav",
    22: "22 - What time do you have breakfast.wav",
    23: "23 - What time do you have lunch.wav",
    24: "24 - What time do you have dinner.wav",
    25: "25 - What time do you come home from school or work.wav",
    26: "26 - What time do you go to bed.wav",
    27: "27 - How do you go to school or work.wav",
    28: "28 - How often do you phone your friend.wav",
    29: "29 - How often do you have friends round - what do you like to do.wav",
    30: "30 - Do you live in a big family.wav",
    31: "31 - What does your father or mother do.wav",
    32: "32 - What does he or she look like.wav",
    33: "33 - What kind of hair does he or she have.wav",
    34: "34 - What kinds of clothes does he or she often wear.wav",
    35: "35 - What is he or she like.wav",
    36: "36 - Is he or she friendly talkative humorous or generous.wav",
    37: "37 - What does he or she like.wav",
    38: "38 - What is your favourite room in your house.wav",
    39: "39 - Can you describe your living room bedroom or kitchen.wav",
    40: "40 - Do you love travelling.wav",
    41: "41 - Tell me about one trip you remember the most.wav",
    42: "42 - Tell me about one trip you want to take in the future.wav",
    43: "43 - What are your favourite foods or drinks - are they good for you.wav",
    44: "44 - Do you like eating out - how often do you go to a restaurant.wav",
    45: "45 - Do you like shopping - why or why not.wav",
    46: "46 - What kind of shops do you like - why or why not.wav",
  }
  return known[n] || `${String(n).padStart(2, "0")}.wav`.replace(/^0(\d\.wav)$/, "$1") || q
}

function finalHref(path: string) {
  return `${FINAL_ROOT}/${path.split("/").map(encodeURIComponent).join("/")}`
}

export function FinalPage() {
  const navigate = useNavigate()
  const { docs, meta } = useData()
  const done = useProgress((s) => s.done)
  const toggle = useProgress((s) => s.toggle)

  const speaking = docs.filter((d) => d.type === "speaking")
  const know = docs.filter((d) => d.type === "grammar" || d.type === "pronunciation")
  const all = [...speaking, ...know]
  const numDone = useMemo(() => all.filter((d) => done[d.id]).length, [all, done])
  const pct = all.length ? Math.round((numDone / all.length) * 100) : 0
  const finalGrammar = docs.find((d) => d.id === "10-final-grammar-atlas")
  const finalSpeaking = docs.find((d) => d.id === "13-final-speaking-test")

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-emerald-500/10 via-card to-card p-6">
        <Badge variant="success" className="mb-2">
          Kỳ thi cuối · Pre-IELTS
        </Badge>
        <h2 className="text-2xl font-bold">{meta.reviewTitle || "Final Review"}</h2>
        <p className="text-muted-foreground mt-1">{meta.reviewIntro}</p>
        <div className="mt-4 flex items-center gap-3">
          <Progress value={pct} className="flex-1" />
          <div className="text-sm font-semibold tabular-nums">
            {numDone}/{all.length} · {pct}%
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <QuickCard
          icon={<Images className="h-5 w-5" />}
          title="Grammar Atlas"
          text="Ôn ngữ pháp theo ảnh/sơ đồ giáo viên gửi."
          action="Mở note"
          onClick={() => navigate(finalGrammar ? `/grammar#doc-${finalGrammar.id}` : "/grammar")}
        />
        <QuickCard
          icon={<Headphones className="h-5 w-5" />}
          title="Audio Drill"
          text="Nghe 50 audio phản xạ; 01-46 đã map câu hỏi."
          action="Luyện ngay"
          onClick={() => document.getElementById("final-audio-bank")?.scrollIntoView({ behavior: "smooth" })}
        />
        <QuickCard
          icon={<BookOpen className="h-5 w-5" />}
          title="Speaking Sheets"
          text="9 file giáo viên gửi theo chủ đề speaking."
          action="Xem file"
          onClick={() => document.getElementById("final-teacher-sheets")?.scrollIntoView({ behavior: "smooth" })}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tài liệu gốc giáo viên gửi</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <a href={finalHref("tong-hop-kien-thuc-khoa-pre.md")}>Mở Markdown tổng hợp</a>
          </Button>
          {finalGrammar && (
            <Button variant="outline" onClick={() => navigate(`/grammar#doc-${finalGrammar.id}`)}>
              Mở Grammar Atlas <ArrowRight className="h-3 w-3" />
            </Button>
          )}
          {finalSpeaking && (
            <Button variant="outline" onClick={() => navigate(`/speaking#doc-${finalSpeaking.id}`)}>
              Mở Speaking Test Bank <ArrowRight className="h-3 w-3" />
            </Button>
          )}
        </CardContent>
      </Card>

      <Card id="final-audio-bank">
        <CardHeader>
          <CardTitle>Audio Drill · câu hỏi giáo viên có thể random</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Luyện theo thứ tự: nghe audio, dừng lại trả lời 2-3 câu, sau đó mở note speaking cùng topic để sửa câu.
            `47.wav` đến `50.wav` đang để chưa xác định vì chưa nghe rõ.
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {FINAL_QUESTIONS.map(([n, topic, question]) => {
              const file = audioFileName(n, question)
              return (
                <div key={n} className="rounded-lg border border-border bg-muted/20 p-3">
                  <div className="flex items-start gap-2">
                    <Badge variant={topic === "Unknown" ? "outline" : "secondary"}>{String(n).padStart(2, "0")}</Badge>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-muted-foreground">{topic}</div>
                      <div className="font-medium leading-snug">{question}</div>
                    </div>
                  </div>
                  <audio controls preload="none" src={finalHref(`audio/${file}`)} className="mt-2 h-8 w-full" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card id="final-teacher-sheets">
        <CardHeader>
          <CardTitle>Suggested Speaking Sheets · không phải vocab</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {TEACHER_DOCS.map((doc) => (
              <a
                key={doc.file}
                href={finalHref(`suggested-vocab/${doc.file}`)}
                className="rounded-lg border border-border bg-card p-4 hover:border-primary hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-center gap-2 font-semibold">
                  <FileText className="h-4 w-4 text-primary" /> {doc.topic}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{doc.file}</div>
                <div className="mt-2 text-sm">Ôn: {doc.focus}</div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      <ExamPart
        num={1}
        title="Speaking · tất cả chủ đề đã học"
        docs={speaking}
        done={done}
        toggle={toggle}
        navigate={navigate}
      />
      <ExamPart
        num={2}
        title="Kiến thức đã học · Grammar & Pronunciation"
        docs={know}
        done={done}
        toggle={toggle}
        navigate={navigate}
      />

      {meta.vocab && Object.keys(meta.vocab).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vocabulary Bank</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(meta.vocab).map(([topic, words]) => (
              <div key={topic}>
                <h3 className="font-semibold mb-2">{topic}</h3>
                <div className="flex flex-wrap gap-2">
                  {words.map((w, i) => (
                    <span key={i} className="rounded-md border border-border bg-muted/50 px-2 py-1 text-sm">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function QuickCard({
  icon,
  title,
  text,
  action,
  onClick,
}: {
  icon: ReactNode
  title: string
  text: string
  action: string
  onClick: () => void
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-primary">
          {icon}
          <div className="font-semibold">{title}</div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{text}</p>
        <Button className="mt-4" variant="outline" size="sm" onClick={onClick}>
          {action} <ArrowRight className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  )
}

function ExamPart({
  num,
  title,
  docs,
  done,
  toggle,
  navigate,
}: {
  num: number
  title: string
  docs: { id: string; title: string; type: string; lesson: string }[]
  done: Record<string, boolean>
  toggle: (id: string) => void
  navigate: (path: string) => void
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold shrink-0">
          {num}
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 md:grid-cols-2">
          {docs.map((d) => (
            <label
              key={d.id}
              className={`flex items-center gap-3 rounded-lg border border-border px-3 py-2 hover:bg-accent/30 transition-colors cursor-pointer ${
                done[d.id] ? "bg-primary/5 border-primary/40" : ""
              }`}
            >
              <Checkbox checked={!!done[d.id]} onCheckedChange={() => toggle(d.id)} />
              <span className="flex-1 min-w-0">
                <span className="font-medium">{d.title}</span>
                {d.lesson && <span className="ml-2 text-xs text-muted-foreground">{d.lesson}</span>}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  navigate(`/${d.type}#doc-${d.id}`)
                }}
              >
                Mở <ArrowRight className="h-3 w-3" />
              </Button>
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
