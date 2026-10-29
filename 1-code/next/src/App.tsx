import { lazy, Suspense } from "react"
import { HashRouter, Routes, Route } from "react-router-dom"
import { AppShell } from "@/components/layout/AppShell"
import { PageLoader } from "@/components/layout/PageLoader"

const LandingPage = lazy(() => import("@/pages/LandingPage").then((m) => ({ default: m.LandingPage })))
const NotesPage = lazy(() => import("@/pages/NotesPage").then((m) => ({ default: m.NotesPage })))
const PronunciationPage = lazy(() => import("@/pages/PronunciationPage").then((m) => ({ default: m.PronunciationPage })))
const FinalPage = lazy(() => import("@/pages/FinalPage").then((m) => ({ default: m.FinalPage })))
const IfaSpeakingPage = lazy(() => import("@/pages/IfaSpeakingPage").then((m) => ({ default: m.IfaSpeakingPage })))
const IfaSpeakingDrillPage = lazy(() => import("@/pages/IfaSpeakingDrillPage").then((m) => ({ default: m.IfaSpeakingDrillPage })))
const IfaVocabPage = lazy(() => import("@/pages/IfaVocabPage").then((m) => ({ default: m.IfaVocabPage })))
const IfaFinalSpeakingPage = lazy(() => import("@/pages/IfaFinalSpeakingPage").then((m) => ({ default: m.IfaFinalSpeakingPage })))
const IfaGrammarPage = lazy(() => import("@/pages/IfaGrammarPage").then((m) => ({ default: m.IfaGrammarPage })))
const IfaReadingPage = lazy(() => import("@/pages/IfaReadingPage").then((m) => ({ default: m.IfaReadingPage })))
const IfaWritingPage = lazy(() => import("@/pages/IfaWritingPage").then((m) => ({ default: m.IfaWritingPage })))
const IfaTestListPage = lazy(() => import("@/pages/IfaTestListPage").then((m) => ({ default: m.IfaTestListPage })))
const IfaListeningPage = lazy(() => import("@/pages/IfaListeningPage").then((m) => ({ default: m.IfaListeningPage })))
const PracticeRunnerPage = lazy(() => import("@/pages/PracticeRunnerPage").then((m) => ({ default: m.PracticeRunnerPage })))
const PracticeResultPage = lazy(() => import("@/pages/PracticeResultPage").then((m) => ({ default: m.PracticeResultPage })))

export default function App() {
  return (
    <HashRouter>
      <AppShell>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/pronunciation" element={<PronunciationPage />} />
            <Route path="/grammar" element={<NotesPage type="grammar" />} />
            <Route path="/speaking" element={<NotesPage type="speaking" />} />
            <Route path="/speaking-ifa" element={<IfaSpeakingPage />} />
            <Route path="/speaking-ifa/drill" element={<IfaSpeakingDrillPage />} />
            <Route path="/listening-ifa" element={<IfaListeningPage />} />
            <Route path="/reading-ifa" element={<IfaTestListPage skill="reading" />} />
            <Route path="/reading-ifa/:paperId" element={<IfaReadingPage />} />
            <Route path="/writing-ifa" element={<IfaTestListPage skill="writing" />} />
            <Route path="/writing-ifa/:paperId" element={<IfaWritingPage />} />
            <Route path="/vocab-ifa" element={<IfaVocabPage />} />
            <Route path="/grammar-ifa" element={<IfaGrammarPage />} />
            <Route path="/final-ifa/speaking" element={<IfaFinalSpeakingPage />} />
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
