export type QuestionKind =
  | "single_choice"
  | "multi_select"
  | "fill_blank"
  | "matching"
  | "open_or_video"
  | "info"
  | "unknown"

export type TopicRole = "core" | "review" | "preview"

export interface TopicTag {
  key: string
  role: TopicRole
}

export interface AudioRef {
  url: string | null
  localFile: string | null
  script: string | null
  translation: string | null
  text: string | null
  source: string | null
}

export interface ImageRef {
  url: string | null
  localFile: string | null
  alt: string | null
}

export interface QuestionOption {
  id: string | number
  text: string
  html: string
}

export interface Blank {
  key: string
  answers: string[]
  userAnswer: string | null
  explanationHtml: string
}

export interface MatchingPair {
  leftId: string
  left: string
  rightId: string
  right: string
}

export interface Question {
  id: string
  sourceQuestionId: string | number | null
  challengeNumber: number | null
  challengeId: number | null
  title: string | null
  kind: QuestionKind
  prompt: string
  promptHtml: string
  bodyHtml: string
  explanationHtml: string
  options: QuestionOption[]
  correctAnswer: (string | number)[]
  userAnswer: unknown
  blanks: Blank[] | null
  pairs: MatchingPair[] | null
  correct: boolean | null
  audioRefs: AudioRef[]
  imageRefs: ImageRef[]
  topics: TopicTag[]
  /** true = câu do AI sinh thêm để đủ số lượng đề (hiển thị màu khác). */
  generated?: boolean
}

export interface ContentBlock {
  id: string
  sourceId: number | null
  challengeId: number | null
  challengeNumber: number | null
  challengeNote: string
  type: string | null
  title: string | null
  text: string
  html: string
  audioRefs: AudioRef[]
  imageRefs: ImageRef[]
  topics: TopicTag[]
}

export interface ExerciseGroup {
  id: string
  challengeId: number | null
  challengeNumber: number | null
  title: string
  note: string
  introHtml: string
  questions: Question[]
}

export interface ChallengeSummary {
  number: number | null
  title: string
  note: string
  totalQuestion: number | null
}

export interface AudioItem {
  id: string
  challengeId: number | null
  localFile: string | null
  url: string | null
  script: string | null
  translation: string | null
  needsScriptReview: boolean
  note: string | null
}

export interface VocabPair {
  term: string
  meaning: string
}

export interface SubmissionSummary {
  totalQuestion: number
  totalCorrect: number
  correctRate: number | null
  commentText: string | null
}

export interface Lesson {
  key: string
  number: number | null
  title: string
  challenges: ChallengeSummary[]
  contentBlocks: ContentBlock[]
  exerciseGroups: ExerciseGroup[]
  scriptsRaw: unknown
  audio: AudioItem[]
  vocabPairs: VocabPair[]
  submissionSummary: SubmissionSummary
}

export interface LessonSummary {
  key: string
  number: number | null
  label: string
  challenges: { number: number | null; title: string; note: string }[]
  totalQuestion: number
  totalCorrect: number
  correctRate: number | null
  hasAudio: boolean
  numContentBlocks: number
  numQuestions: number
}

export type TopicSkill =
  | "grammar"
  | "pronunciation"
  | "vocabulary"
  | "speaking"
  | "listening"
  | "misc"

export interface TopicLabel {
  label: string
  viLabel?: string
  skill: TopicSkill
  needsNotes?: boolean
}

export type TopicRefKind = "block" | "question" | "audio"

export interface TopicRef {
  lessonKey: string
  kind: TopicRefKind
  itemId: string
  role: TopicRole
  qkind?: QuestionKind
}

export interface TopicIndexEntry {
  label: string
  viLabel?: string
  skill: TopicSkill
  refs: TopicRef[]
}

export interface TopicsIndex {
  topics: Record<string, TopicIndexEntry>
  order: string[]
}

export interface SpeakingQuestion {
  q: string
  subQuestions?: string[]
  audioFile?: string
  answerFrames?: string[]
  tip?: string
  sampleAnswer?: string
  sampleAnswerIpa?: string[]
}

export interface PracticePreset {
  id: string
  label: string
  skill?: string
  totalQuestions: number
  mix: { topic: string; percent: number }[]
  questionTypes: QuestionKind[]
}

export interface NoteDoc {
  id: string
  type: "pronunciation" | "grammar" | "speaking"
  title: string
  vi: string
  lesson: string
  priority: string
  file: string
  markdown: string
}

export interface NotesAudio {
  num: number
  title: string
  file: string
}

export interface FinalSpeakingSheet {
  topic: string
  file: string
  localPath: string
  sourceHref?: string
  focus?: string
}

export interface FinalPacket {
  title: string
  sourceFile: string
  markdown: string
  speakingSheets: FinalSpeakingSheet[]
}

/** A question reference used to build a fixed final-test paper (resolved lazily by the runner). */
export interface FinalTestRef {
  lessonKey: string
  kind: "question"
  itemId: string
  role: TopicRole
  qkind: QuestionKind
  topic: string
}

/** The authentic mock test extracted from lesson-19. */
export interface FinalRealMock {
  id: string
  label: string
  note: string
  total: number
  questions: FinalTestRef[]
}

/** A fixed practice paper recipe; built deterministically from the grammar pool via a stable seed. */
export interface FinalTestSet {
  id: string
  label: string
  seed: number
  total: number
  note?: string
  source?: "real" | "generated"
  questions?: FinalTestRef[]
}

export interface FinalTestBlueprintSection {
  id: string
  label: string
  instruction: string
  total: number
  questionTypes: QuestionKind[]
  mix: { topic: string; percent: number }[]
}

export interface FinalTestBlueprint {
  total: number
  timeMinutes: number
  sections: FinalTestBlueprintSection[]
}

export interface FinalTests {
  poolKey: string
  poolTotal: number
  generatedCount: number
  blueprint: FinalTestBlueprint
  realMock: FinalRealMock | null
  sets: FinalTestSet[]
}

export interface IpaEntry {
  ipa: string
  word: string
  vi?: string
  voiced?: boolean
}

export interface IpaData {
  monophthongs?: IpaEntry[]
  diphthongs?: IpaEntry[]
  consonants?: IpaEntry[]
}

export interface MetaLesson {
  n: number
  title: string
  focus: string
  note: string
  source: string
}

export interface MetaPrinciple {
  title: string
  text: string
}

/* -------------------- IFA Speaking (guided answer builder) -------------------- */

export interface IfaPhrase {
  en: string
  ipa: string
  vi: string
  /** Present only when a group-2 option depends on this group-1 choice. */
  places?: IfaPhrase[]
}

export interface IfaGroup {
  name: string
  vi: string
  items: IfaPhrase[]
}

export type IfaStructPart =
  | { type: "text"; text: string }
  | { type: "slot"; slot: number }

export interface IfaStructure {
  parts: IfaStructPart[]
  vi: string
  example: string
}

export interface IfaScenario {
  name: string
  vi: string
  labels: { g1: string; g2: string; g3: string }
  g2DependsOnG1: boolean
  g2Prompt: string
  structs: IfaStructure[]
  g1: IfaPhrase[]
  g2groups: IfaGroup[]
  g3groups: IfaGroup[]
}

export interface IfaVocab {
  term: string
  pos: string
  vi: string
  ipa: string
}

export interface IfaSpeakingQuestion {
  title: string
  vi: string
  scenarios: IfaScenario[]
  vocab: IfaVocab[]
}

export interface IfaHandout {
  id: string
  lesson: number | null
  /** Display-ready topic, e.g. "Shopping". Never re-parse this in the UI. */
  topicLabel: string
  /** Audience variant id when a lesson is split by learner type, else null. */
  audience: "highschool" | "university" | "working" | string | null
  audienceLabel: string | null
  /** Grammar focus of the lesson, e.g. "Present Simple + Past Simple". May be empty. */
  grammarFocus: string
  rawTopic: string
  rawLabel: string
  questions: IfaSpeakingQuestion[]
}

export interface IfaDrillItem {
  topic: string
  text: string
}

export interface IfaDrillVariant {
  audience: string | null
  items: IfaDrillItem[]
}

export interface IfaDrillLesson {
  id: string
  lesson: number | null
  title: string
  variants: IfaDrillVariant[]
}

export interface MetaData {
  stageTitle?: string
  stageIntro?: string
  stageSub?: string
  courseIntro?: string
  courseSub?: string
  pronSub?: string
  grammarSub?: string
  speakingSub?: string
  reviewSub?: string
  reviewTitle?: string
  reviewIntro?: string
  goals?: string[]
  principles?: MetaPrinciple[]
  lessons?: MetaLesson[]
  readGuide?: { topic: string; text: string; stress: string; grammar: string }[]
  vocab?: Record<string, string[]>
}
