import { lazy, Suspense } from "react"
import { HashRouter, Routes, Route } from "react-router-dom"
import { AppShell } from "@/components/layout/AppShell"
import { PageLoader } from "@/components/layout/PageLoader"

const LandingPage = lazy(() => import("@/pages/LandingPage").then((m) => ({ default: m.LandingPage })))
const CoursePage = lazy(() => import("@/pages/CoursePage").then((m) => ({ default: m.CoursePage })))
const NotesPage = lazy(() => import("@/pages/NotesPage").then((m) => ({ default: m.NotesPage })))
const FinalPage = lazy(() => import("@/pages/FinalPage").then((m) => ({ default: m.FinalPage })))
const DailyIndexPage = lazy(() => import("@/pages/DailyIndexPage").then((m) => ({ default: m.DailyIndexPage })))
const DailyLessonPage = lazy(() => import("@/pages/DailyLessonPage").then((m) => ({ default: m.DailyLessonPage })))
const TopicsIndexPage = lazy(() => import("@/pages/TopicsIndexPage").then((m) => ({ default: m.TopicsIndexPage })))
const TopicDetailPage = lazy(() => import("@/pages/TopicDetailPage").then((m) => ({ default: m.TopicDetailPage })))
const PracticePage = lazy(() => import("@/pages/PracticePage").then((m) => ({ default: m.PracticePage })))
const PracticeRunnerPage = lazy(() => import("@/pages/PracticeRunnerPage").then((m) => ({ default: m.PracticeRunnerPage })))
const PracticeResultPage = lazy(() => import("@/pages/PracticeResultPage").then((m) => ({ default: m.PracticeResultPage })))

export default function App() {
  return (
    <HashRouter>
      <AppShell>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/course" element={<CoursePage />} />
            <Route path="/pronunciation" element={<NotesPage type="pronunciation" />} />
            <Route path="/grammar" element={<NotesPage type="grammar" />} />
            <Route path="/speaking" element={<NotesPage type="speaking" />} />
            <Route path="/final" element={<FinalPage />} />
            <Route path="/daily" element={<DailyIndexPage />} />
            <Route path="/daily/:lessonKey" element={<DailyLessonPage />} />
            <Route path="/topics" element={<TopicsIndexPage />} />
            <Route path="/topics/:topicKey" element={<TopicDetailPage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/practice/runner/:sessionId" element={<PracticeRunnerPage />} />
            <Route path="/practice/result/:sessionId" element={<PracticeResultPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AppShell>
    </HashRouter>
  )
}

function NotFound() {
  return (
    <div className="rounded-xl border border-border bg-card p-8 text-center">
      <h2 className="text-xl font-semibold">Trang không tồn tại</h2>
      <p className="text-muted-foreground mt-2">Đường dẫn không hợp lệ.</p>
    </div>
  )
}
