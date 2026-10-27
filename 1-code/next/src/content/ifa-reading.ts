/**
 * Hand-authored IFA Final Test practice set (Reading + Writing), digitised from
 * the teacher's paper. Lives in `src/content` (NOT `src/data`, which is
 * generated + gitignored) so it is version-controlled and editable by hand.
 *
 * Reading questions reuse the app's grading engine shapes (single_choice /
 * fill_blank) so the runner can call `gradeAll` unchanged.
 */

export interface ReadingChoiceQuestion {
  n: number
  kind: "choice"
  prompt: string
  options: { id: string; text: string }[]
  /** Correct option id (A/B/C/D). */
  answer: string
}

export interface ReadingFillQuestion {
  n: number
  kind: "fill"
  prompt: string
  /** Accepted answers (case-insensitive, trimmed). First is the model answer. */
  answers: string[]
}

export type ReadingQuestion = ReadingChoiceQuestion | ReadingFillQuestion

export interface ReadingPassage {
  id: string
  label: string
  title: string
  /** Paragraphs of the reading text. */
  paragraphs: string[]
}

export interface ReadingSection {
  /** Heading like "Questions 1-3". */
  group: string
  instruction: string
  passageId: string
  questions: ReadingQuestion[]
}

export interface WritingExercise {
  n: number
  points: number
  instruction: string
  /** Optional source paragraph (Exercise 1 completes tasks on a text). */
  passage?: { title: string; body: string }
  /** Prompt options the learner picks from (Exercise 2). */
  topics?: string[]
  notes?: string[]
}

export interface IfaTestPaper {
  id: string
  title: string
  subtitle: string
  reading: {
    timeAllowed: string
    totalQuestions: number
    passages: ReadingPassage[]
    sections: ReadingSection[]
  }
  writing: {
    timeAllowed: string
    exercises: WritingExercise[]
  }
}

const paperRetake1: IfaTestPaper = {
  id: "final-retake-1",
  title: "FINAL TEST — RETAKE",
  subtitle: "IELTS Foundation A · luyện tập",
  reading: {
    timeAllowed: "30 phút",
    totalQuestions: 14,
    passages: [
      {
        id: "p1",
        label: "Reading passage 1",
        title: "Studying overseas",
        paragraphs: [
          "Many students dream of studying abroad because it offers new experiences and opportunities. Universities in other countries may provide better education or courses that are not available at home. For some students, studying abroad is also a way to improve their language skills and become more confident when speaking with people from different backgrounds.",
          "This experience can be exciting but also challenging. When students move to another country, they must learn to live without their families and manage everything by themselves. They also have to adapt to a new culture, which may be very different from their own. Food, traditions, and social rules might surprise them at first, but these differences help students grow as individuals. Studying abroad also allows them to meet people from around the world and build international friendships.",
          "However, living overseas can be expensive. Tuition fees, accommodation, and daily expenses add up quickly, and not every student can afford them. Some students work part-time to support themselves, but this can make it harder to balance study and work. In addition, students sometimes feel homesick, especially during holidays or special family events. Being far from home can make them feel lonely, but staying in contact through video calls or social media can help reduce these homesick feelings.",
          "Despite these difficulties, many people believe that the experience is worth it because it teaches independence, cultural understanding, and important life skills. After completing their studies, students often find it easier to get jobs, as employers value international experience. In this way, studying abroad not only helps people learn academically but also prepares them for future success in an increasingly global world.",
        ],
      },
      {
        id: "p2",
        label: "Reading passage 2",
        title: "The Power of Advertisements",
        paragraphs: [
          "In today's world, advertisements are everywhere. They appear on television, the internet, billboards, and even inside mobile apps. Companies use them to introduce new products and persuade people to buy them. Advertising has become a key part of modern business because it helps brands reach large audiences quickly. Without advertising, many people would not know about the wide range of goods and services available to them.",
          "One of the main purposes of advertising is to make products look more appealing. Advertisers often use bright colours, catchy slogans, and famous people to attract attention. For example, a company selling sports shoes might use a popular athlete in its campaign to show that its shoes are connected with success and energy. These strategies can influence customers' emotions and make them believe that buying a certain product will improve their lifestyle.",
          "Advertising is not limited to selling material products. It is also used to promote ideas or raise awareness about social issues. Governments often create advertisements to encourage healthy habits, such as eating more vegetables or exercising regularly. Environmental organizations use advertising to educate people about problems like pollution and climate change. In these cases, advertisements are used not for profit but to inspire positive changes in society.",
          "However, some people believe that advertising can be misleading. Certain advertisements exaggerate the quality of a product or hide its disadvantages. For instance, fast food commercials often show meals that look fresh and delicious, but the real items may be much less attractive. This can create false customers, especially among young people. In addition, advertising can make consumers buy things they do not really need, leading to waste and overconsumption.",
          "In recent years, online advertising has grown rapidly. Social media platforms collect user data to show personalized ads based on people's interests and search history. While this makes ads more relevant, it also raises concerns about privacy. Some users feel uncomfortable knowing that companies track their behaviour online. As technology continues to develop, the debate about how advertising affects society is likely to become even more important.",
        ],
      },
    ],
    sections: [
      {
        group: "Questions 1-3",
        instruction: "Complete the sentences below. Write NO MORE THAN TWO WORDS from the text for each answer.",
        passageId: "p1",
        questions: [
          { n: 1, kind: "fill", prompt: "Some students study abroad to improve their ______.", answers: ["language skills", "language"] },
          { n: 2, kind: "fill", prompt: "Studying abroad means that students must learn to live without their ______.", answers: ["families", "family"] },
          { n: 3, kind: "fill", prompt: "Keeping in touch online can help reduce ______.", answers: ["homesick feelings", "homesickness"] },
        ],
      },
      {
        group: "Questions 4-7",
        instruction: "Choose the correct letter, A, B, C or D.",
        passageId: "p1",
        questions: [
          {
            n: 4,
            kind: "choice",
            prompt: "What helps students become more confident while studying abroad?",
            options: [
              { id: "A", text: "Attending more classes" },
              { id: "B", text: "Communicating with people from different backgrounds" },
              { id: "C", text: "Visiting tourist attractions" },
              { id: "D", text: "Living far from their beloved ones" },
            ],
            answer: "B",
          },
          {
            n: 5,
            kind: "choice",
            prompt: "What is one financial problem mentioned in the passage?",
            options: [
              { id: "A", text: "Buying food abroad is expensive" },
              { id: "B", text: "Rent is cheaper than expected" },
              { id: "C", text: "Students must pay extra for language courses" },
              { id: "D", text: "Tuition and living costs are high" },
            ],
            answer: "D",
          },
          {
            n: 6,
            kind: "choice",
            prompt: "How can students cope with feeling lonely?",
            options: [
              { id: "A", text: "By contacting their families online" },
              { id: "B", text: "By joining sports teams" },
              { id: "C", text: "By studying more hours" },
              { id: "D", text: "By returning home early" },
            ],
            answer: "A",
          },
          {
            n: 7,
            kind: "choice",
            prompt: "What advantage do students often gain after studying abroad?",
            options: [
              { id: "A", text: "Better job opportunities" },
              { id: "B", text: "Lower tuition fees" },
              { id: "C", text: "More free time" },
              { id: "D", text: "Shorter courses" },
            ],
            answer: "A",
          },
        ],
      },
      {
        group: "Questions 8-10",
        instruction: "Answer the questions below. Choose NO MORE THAN TWO WORDS from the text for each answer.",
        passageId: "p2",
        questions: [
          { n: 8, kind: "fill", prompt: "What do companies use advertisements to introduce?", answers: ["new products", "products"] },
          { n: 9, kind: "fill", prompt: "Who might appear in advertisements to make products more appealing?", answers: ["famous people", "a popular athlete", "popular athlete", "famous person"] },
          { n: 10, kind: "fill", prompt: "What do governments try to encourage through certain advertisements?", answers: ["healthy habits", "healthy"] },
        ],
      },
      {
        group: "Questions 11-14",
        instruction: "Choose the correct letter, A, B, C or D.",
        passageId: "p2",
        questions: [
          {
            n: 11,
            kind: "choice",
            prompt: "What is one main purpose of advertising?",
            options: [
              { id: "A", text: "To limit people's spending" },
              { id: "B", text: "To make products look attractive" },
              { id: "C", text: "To replace traditional shops" },
              { id: "D", text: "To reduce business competition" },
            ],
            answer: "B",
          },
          {
            n: 12,
            kind: "choice",
            prompt: "How do environmental organizations use advertising?",
            options: [
              { id: "A", text: "To increase their profits" },
              { id: "B", text: "To promote celebrity lifestyles" },
              { id: "C", text: "To educate people about pollution" },
              { id: "D", text: "To sell eco-friendly products" },
            ],
            answer: "C",
          },
          {
            n: 13,
            kind: "choice",
            prompt: "Why do some people criticize advertising?",
            options: [
              { id: "A", text: "It makes products too expensive" },
              { id: "B", text: "It sometimes gives false impressions" },
              { id: "C", text: "It misleads people to make better choices" },
              { id: "D", text: "It supports environmental programs" },
            ],
            answer: "B",
          },
          {
            n: 14,
            kind: "choice",
            prompt: "What problem is connected with personalized online ads?",
            options: [
              { id: "A", text: "They reduce shopping convenience" },
              { id: "B", text: "They cause internet errors" },
              { id: "C", text: "They raise privacy concerns" },
              { id: "D", text: "They show more irrelevant products" },
            ],
            answer: "C",
          },
        ],
      },
    ],
  },
  writing: {
    timeAllowed: "30 phút",
    exercises: [
      {
        n: 1,
        points: 2,
        instruction: "Read the paragraph and complete the tasks that follow.",
        passage: {
          title: "Reading books",
          body:
            "Reading books can have many benefits. One of them is improving knowledge. This means that people can learn new information about different topics such as history, science, or culture. As a result, readers can become more informed and develop better critical thinking skills. For example, someone who reads novels may improve their vocabulary and imagination. Another benefit is reducing stress. People who read regularly often feel more relaxed because reading helps them escape from daily problems and focus on the story. For instance, reading a few pages before bed can help someone sleep better at night. Reading books also strengthens concentration. This is because readers need to pay attention to the details of the story or the facts in the text. Spending time in nature is also very important for good health. These benefits show that reading books is a valuable and enjoyable activity for many people.",
        },
        notes: [
          "Tìm câu chủ đề (topic sentence) của đoạn.",
          "Gạch các câu nêu lợi ích (main ideas) và ví dụ (supporting ideas).",
          "Tìm 1 câu không liên quan đến chủ đề và loại bỏ.",
        ],
      },
      {
        n: 2,
        points: 8,
        instruction: "Pick one of the following topics to write a paragraph about (at least 7 sentences).",
        topics: [
          "The advantage(s) and disadvantage(s) of having a part-time job.",
          "The advantages of having a part-time job. (at least 2 main ideas)",
          "The disadvantages of having a part-time job. (at least 2 main ideas)",
        ],
        notes: [
          "Bài viết cần có đủ 1 câu chủ đề (topic sentence), ít nhất 2 luận điểm (main ideas) và ít nhất 1 luận cứ (supporting ideas) cho mỗi luận điểm.",
          "Trong bài viết cần có ít nhất 1 câu ghép và 1 câu phức.",
        ],
      },
    ],
  },
}

/**
 * All practice papers. Add a new paper object and push it here — the Reading
 * and Writing pages render the list automatically.
 */
export const ifaTestPapers: IfaTestPaper[] = [paperRetake1]

export function getPaper(id: string): IfaTestPaper | undefined {
  return ifaTestPapers.find((p) => p.id === id)
}

/** Short reading-topic summary for the list cards. */
export function paperTopics(p: IfaTestPaper): string[] {
  return p.reading.passages.map((pg) => pg.title)
}
