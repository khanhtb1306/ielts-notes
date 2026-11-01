import type { ReadingQuestion } from "./ifa-reading"
import { similarListeningPapers } from "./ifa-listening-similar"

export interface ListeningMultiQuestion {
  kind: "multi"
  n: number
  end: number
  prompt: string
  options: { id: string; text: string }[]
  answers: string[]
}

export type ListeningQuestion = ReadingQuestion | ListeningMultiQuestion

export interface ListeningGroup {
  title: string
  instruction: string
  context?: string
  notes?: {
    title: string
    sections: { heading?: string; rows: { before: string; question?: number; after?: string; secondQuestion?: number; ending?: string }[] }[]
  }
  questions: ListeningQuestion[]
}

export interface ListeningPaper {
  id: string
  title: string
  hidden: boolean
  source?: string
  sections: {
    title: string
    audio?: string
    groups: ListeningGroup[]
  }[]
}

const lesson18: ListeningPaper = {
  id: "lesson-18-practice",
  title: "LESSON 18 — PRACTICE TEST",
  hidden: false,
  sections: [
    {
      title: "Section 1",
      audio: "audio/daily/ifa/lesson-18/section-1.mp3",
      groups: [
        {
          title: "Questions 1-2",
          instruction: "Choose the correct letter, A, B or C.",
          questions: [
            { n: 1, kind: "choice", prompt: "In the lobby of the library George saw", options: [{ id: "A", text: "a group playing music." }, { id: "B", text: "a display of instruments." }, { id: "C", text: "a video about the festival." }], answer: "C" },
            { n: 2, kind: "choice", prompt: "George wants to sit at the back so they can", options: [{ id: "A", text: "see well." }, { id: "B", text: "hear clearly." }, { id: "C", text: "pay less." }], answer: "B" },
          ],
        },
        {
          title: "Questions 3-10",
          instruction: "Complete the booking form. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
          context: "SUMMER MUSIC FESTIVAL — Booking form · Name: George O'Neill",
          questions: [
            { n: 3, kind: "fill", prompt: "Address: ______, Westsea", answers: ["48 North Avenue"] },
            { n: 4, kind: "fill", prompt: "Postcode: ______", answers: ["WS62YH", "WS6 2YH"] },
            { n: 5, kind: "fill", prompt: "Telephone: ______", answers: ["01674553242"] },
            { n: 6, kind: "fill", prompt: "Singer (price includes ______ in the garden)", answers: ["drink", "refreshment", "drinks", "refreshments", "free drinks", "free refreshments", "free drink", "free refreshment"] },
            { n: 7, kind: "fill", prompt: "22 June: ______ (Anna Ventura)", answers: ["a pianist", "the pianist", "pianist", "piano player"] },
            { n: 8, kind: "fill", prompt: "23 June: Spanish Dance & Guitar Concert — £______ per ticket", answers: ["10.50"] },
            { n: 9, kind: "fill", prompt: "23 June: number of tickets ______", answers: ["4", "four"] },
            { n: 10, kind: "fill", prompt: "Children, students and senior citizens have a ______ discount.", answers: ["50%", "50 percent", "50 per cent"] },
          ],
        },
      ],
    },
    {
      title: "Section 2",
      audio: "audio/daily/ifa/lesson-18/section-2.mp3",
      groups: [
        {
          title: "Questions 11-15 · The Dinosaur Museum",
          instruction: "Complete the sentences. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
          questions: [
            { n: 11, kind: "fill", prompt: "The museum closes at ______ p.m. on Mondays.", answers: ["1.30", "1:30"] },
            { n: 12, kind: "fill", prompt: "The museum is not open on ______.", answers: ["25 December", "25th December", "December 25", "Christmas Day"] },
            { n: 13, kind: "fill", prompt: "School groups are met by tour guides in the ______.", answers: ["car park", "parking lot"] },
            { n: 14, kind: "fill", prompt: "The visit includes ______ minutes for the guided tour.", answers: ["45"] },
            { n: 15, kind: "fill", prompt: "There are ______ behind the museum where students can have lunch.", answers: ["tables", "some tables"] },
          ],
        },
        {
          title: "Questions 16-18",
          instruction: "Choose THREE letters, A-G.",
          questions: [{ n: 16, end: 18, kind: "multi", prompt: "Which THREE things can students have with them in the museum?", options: [{ id: "A", text: "food" }, { id: "B", text: "water" }, { id: "C", text: "cameras" }, { id: "D", text: "books" }, { id: "E", text: "bags" }, { id: "F", text: "pens" }, { id: "G", text: "worksheets" }], answers: ["C", "F", "G"] }],
        },
        {
          title: "Questions 19-20",
          instruction: "Choose TWO letters, A-E.",
          questions: [{ n: 19, end: 20, kind: "multi", prompt: "Which TWO activities can students do after the tour at present?", options: [{ id: "A", text: "build model dinosaurs" }, { id: "B", text: "watch films" }, { id: "C", text: "draw dinosaurs" }, { id: "D", text: "find dinosaur eggs" }, { id: "E", text: "play computer games" }], answers: ["B", "E"] }],
        },
      ],
    },
  ],
}

const mock: ListeningPaper = {
  id: "mock-listening",
  title: "MOCK TEST — Listening",
  hidden: false,
  sections: [
    {
      title: "Section 1 · Home Repair Form",
      // The LangGo mock publishes the questions but no recording/audio URL.
      groups: [{
        title: "Questions 1-10",
        instruction: "Complete the notes. Write ONE WORD AND/OR A NUMBER for each answer.",
        notes: {
          title: "Home Repair Form",
          sections: [
            { heading: "Client Details", rows: [{ before: "Address: 42 Greenway Close" }, { before: "Name: Emma ", question: 1 }, { before: "Phone number: ", question: 2 }] },
            { heading: "Living Room", rows: [{ before: "Add wooden shelves" }, { before: "Replace the old carpet with a new ", question: 3 }] },
            { heading: "Kitchen", rows: [{ before: "Add more ", question: 4, after: " to the ceiling" }, { before: "Replace broken sink" }] },
            { heading: "Bedroom", rows: [{ before: "Replace the ", question: 5 }] },
            { heading: "Bathroom", rows: [{ before: "Remove bathtub and set up a walk-in ", question: 6 }] },
            { heading: "Garden", rows: [{ before: "Replace the ", question: 7, after: " (too low and difficult to ", secondQuestion: 8, ending: ")" }] },
            { heading: "Work Details", rows: [{ before: "Start date: ", question: 9 }, { before: "Alarm code: ", question: 10 }] },
          ],
        },
        questions: [
          { n: 1, kind: "fill", prompt: "Name: Emma ______", answers: ["HARRINGTON"] },
          { n: 2, kind: "fill", prompt: "Phone number: ______", answers: ["07934482156"] },
          { n: 3, kind: "fill", prompt: "Replace the old carpet with a new ______.", answers: ["floor"] },
          { n: 4, kind: "fill", prompt: "Add more ______ to the kitchen ceiling.", answers: ["lights", "light"] },
          { n: 5, kind: "fill", prompt: "Bedroom: replace the ______.", answers: ["window"] },
          { n: 6, kind: "fill", prompt: "Bathroom: set up a walk-in ______.", answers: ["shower"] },
          { n: 7, kind: "fill", prompt: "Garden: replace the ______ (too low).", answers: ["gate"] },
          { n: 8, kind: "fill", prompt: "The garden gate is difficult to ______.", answers: ["open"] },
          { n: 9, kind: "fill", prompt: "Work start date: ______", answers: ["July 4th", "July 4", "4th July", "4 July"] },
          { n: 10, kind: "fill", prompt: "Alarm code: ______", answers: ["BQ3098"] },
        ],
      }],
    },
    {
      title: "Section 2 · Marenga Volunteering Programme",
      groups: [
        {
          title: "Questions 11-15",
          instruction: "Choose the correct letter, A, B or C.",
          context: "Marenga Volunteering Programme",
          questions: [
            { n: 11, kind: "choice", prompt: "What is the main purpose of the programme?", options: [{ id: "A", text: "To provide a cheap holiday" }, { id: "B", text: "To protect cultural heritage" }, { id: "C", text: "To do volunteering only" }], answer: "B" },
            { n: 12, kind: "choice", prompt: "When will volunteers usually work?", options: [{ id: "A", text: "In the morning" }, { id: "B", text: "In the afternoon" }, { id: "C", text: "At noon" }], answer: "A" },
            { n: 13, kind: "choice", prompt: "Where will volunteers stay?", options: [{ id: "A", text: "In big hotels" }, { id: "B", text: "In guesthouses shared with others" }, { id: "C", text: "With host families" }], answer: "B" },
            { n: 14, kind: "choice", prompt: "What is NOT included in the participation fee?", options: [{ id: "A", text: "Accommodation" }, { id: "B", text: "Transportation within the area" }, { id: "C", text: "Overseas flights" }], answer: "C" },
            { n: 15, kind: "choice", prompt: "Who must provide a medical certificate?", options: [{ id: "A", text: "Individuals under 20" }, { id: "B", text: "Individuals over 60" }, { id: "C", text: "All participants" }], answer: "B" },
          ],
        },
        {
          title: "Questions 16-20 · Programme Activities",
          instruction: "Complete the sentences. Write ONE WORD OR A NUMBER for each answer.",
          notes: {
            title: "Programme Activities",
            sections: [{ rows: [
              { before: "The first meeting is held at the local cultural ", question: 16 },
              { before: "The volunteer work begins on day ", question: 17 },
              { before: "Safety ", question: 18, after: " will always be provided during repair work." },
              { before: "On day six, participants will have a ", question: 19, after: " on the beach." },
              { before: "On the last evening, there will be a farewell ", question: 20 },
            ] }],
          },
          questions: [
            { n: 16, kind: "fill", prompt: "The first meeting is held at the local cultural ______.", answers: ["center", "centre"] },
            { n: 17, kind: "fill", prompt: "The volunteer work begins on day ______.", answers: ["three", "3"] },
            { n: 18, kind: "fill", prompt: "Safety ______ will always be provided during repair work.", answers: ["equipment"] },
            { n: 19, kind: "fill", prompt: "On day six, participants will have a ______ on the beach.", answers: ["picnic"] },
            { n: 20, kind: "fill", prompt: "On the last evening, there will be a farewell ______.", answers: ["dinner"] },
          ],
        },
      ],
    },
  ],
}

export const ifaListeningPapers = [lesson18, mock, ...similarListeningPapers]
export const getListeningPaper = (id: string) => ifaListeningPapers.find((paper) => paper.id === id)
