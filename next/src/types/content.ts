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
