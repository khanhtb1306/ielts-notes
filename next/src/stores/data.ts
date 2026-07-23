import { docs, meta, notesAudio, ipa, finalPacket } from "@/data/notes"
import { topicsIndex, topicLabels, speakingQuestions, practicePresets } from "@/data/topics"
import { dailyIndex } from "@/data/daily-index"
import { loadLesson } from "@/data/daily-loader"

export const useData = () => ({
  docs,
  meta,
  notesAudio,
  ipa,
  finalPacket,
  topicsIndex,
  topicLabels,
  speakingQuestions,
  practicePresets,
  dailyIndex,
  loadLesson,
})

export type AppData = ReturnType<typeof useData>
