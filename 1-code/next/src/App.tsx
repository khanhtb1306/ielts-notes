import { lazy, Suspense } from "react"
import { HashRouter, Routes, Route } from "react-router-dom"
import { AppShell } from "@/components/layout/AppShell"
import { PageLoader } from "@/components/layout/PageLoader"

const LandingPage = lazy(() => import("@/pages/LandingPage").then((m) => ({ default: m.LandingPage })))
const NotesPage = lazy(() => import("@/pages/NotesPage").then((m) => ({ default: m.NotesPage })))
const FinalPage = lazy(() => import("@/pages/FinalPage").then((m) => ({ default: m.FinalPage })))
const IfaSpeakingPage = lazy(() => import("@/pages/IfaSpeakingPage").then((m) => ({ default: m.IfaSpeakingPage })))
const IfaSpeakingDrillPage = lazy(() => import("@/pages/IfaSpeakingDrillPage").then((m) => ({ default: m.IfaSpeakingDrillPage })))
const IfaVocabPage = lazy(() => import("@/pages/IfaVocabPage").then((m) => ({ default: m.IfaVocabPage })))
const PracticeRunnerPage = lazy(() => import("@/pages/PracticeRunnerPage").then((m) => ({ default: m.PracticeRunnerPage })))
const PracticeResultPage = lazy(() => import("@/pages/PracticeResultPage").then((m) => ({ default: m.PracticeResultPage })))

export default function App() {
  return (
    <HashRouter>
      <AppShell>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/pronunciation" element={<NotesPage type="pronunciation" />} />
            <Route path="/grammar" element={<NotesPage type="grammar" />} />
            <Route path="/speaking" element={<NotesPage type="speaking" />} />
            <Route path="/speaking-ifa" element={<IfaSpeakingPage />} />
            <Route path="/speaking-ifa/drill" element={<IfaSpeakingDrillPage />} />
            <Route path="/vocab-ifa" element={<IfaVocabPage />} />
            <Route path="/final" element={<FinalPage />} />
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
