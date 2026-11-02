/**
 * Extra hand-authored IFA Writing practice papers, modelled on the teacher's
 * sample (Exercise 1: analyse a paragraph; Exercise 2: write a paragraph).
 * Each Exercise 1 passage hides one off-topic sentence for the learner to find.
 */
import type { IfaTestPaper } from "./ifa-reading"

/**
 * Exercise 1 self-check questions (topic sentence + off-topic sentence), with
 * the two fixed answers taken verbatim from the paragraph, like the Final Test.
 */
const writingChecksEx1 = (topicSentence: string, offTopic: string) => [
  { prompt: "What is the topic sentence in the paragraph?", answer: topicSentence },
  { prompt: "Find the sentence not related to the topic.", answer: offTopic },
]

/** Exercise 1 note: the complex + compound sentence task (1 pt). */
const writingNotesEx1 = (topic: string) => [
  `Make 1 complex sentence and 1 compound sentence about "${topic}". (1 pt)`,
]

const WRITING_NOTES_EX2 = [
  "Bài viết cần có đủ 1 câu chủ đề (topic sentence), ít nhất 2 luận điểm (main ideas) và ít nhất 1 luận cứ (supporting ideas) cho mỗi luận điểm.",
  "Trong bài viết cần có ít nhất 1 câu ghép và 1 câu phức.",
]

const writingSports: IfaTestPaper = {
  id: "writing-sports",
  title: "WRITING 1 — Playing Sports",
  subtitle: "IELTS Foundation A · luyện tập",
  reading: { timeAllowed: "30 phút", totalQuestions: 0, passages: [], sections: [] },
  writing: {
    timeAllowed: "30 phút",
    exercises: [
      {
        n: 1,
        points: 2,
        instruction: "Read the paragraph and complete the tasks that follow.",
        passage: {
          title: "Playing sports",
          body:
            "Playing sports brings many benefits to young people. One of them is better physical health. This means that players become stronger and can control their weight more easily. For example, children who play football every week often have more energy than those who do not exercise. Another benefit is making friends. When people join a team, they meet others who enjoy the same activity, and they learn to work together. Playing sports also teaches important life skills such as patience and discipline. My favourite colour is blue. For these reasons, playing sports is a valuable activity for everyone.",
        },
        checks: writingChecksEx1("Playing sports brings many benefits to young people.", "My favourite colour is blue."),
        notes: writingNotesEx1("Playing Sports"),
      },
      {
        n: 2,
        points: 8,
        instruction: "Pick one of the following topics to write a paragraph about (at least 7 sentences).",
        topics: [
          "The advantages of playing sports regularly. (at least 2 main ideas)",
          "The advantages and disadvantages of playing team sports.",
          "Why some people prefer individual sports to team sports. (at least 2 main ideas)",
        ],
        notes: WRITING_NOTES_EX2,
      },
    ],
  },
}

const writingRelationships: IfaTestPaper = {
  id: "writing-relationships",
  title: "WRITING 2 — Family & Friends",
  subtitle: "IELTS Foundation A · luyện tập",
  reading: { timeAllowed: "30 phút", totalQuestions: 0, passages: [], sections: [] },
  writing: {
    timeAllowed: "30 phút",
    exercises: [
      {
        n: 1,
        points: 2,
        instruction: "Read the paragraph and complete the tasks that follow.",
        passage: {
          title: "Spending time with family",
          body:
            "Spending time with family is important for everyone. One reason is that it makes relationships stronger. This means that family members understand and trust each other more. For example, having dinner together every evening gives people a chance to share their news and feelings. Another reason is that family time reduces stress. After a difficult day, talking with people who love us can help us feel calm and happy. The fastest animal in the world is the cheetah. Because of these reasons, families should try to spend time together as often as they can.",
        },
        checks: writingChecksEx1("Spending time with family is important for everyone.", "The fastest animal in the world is the cheetah."),
        notes: writingNotesEx1("Family & Friends"),
      },
      {
        n: 2,
        points: 8,
        instruction: "Pick one of the following topics to write a paragraph about (at least 7 sentences).",
        topics: [
          "The benefits of making new friends. (at least 2 main ideas)",
          "The advantages and disadvantages of making new friends online.",
          "Ways to make new friends at school or work. (at least 2 main ideas)",
        ],
        notes: WRITING_NOTES_EX2,
      },
    ],
  },
}

const writingWork: IfaTestPaper = {
  id: "writing-work",
  title: "WRITING 3 — Work & Part-time Jobs",
  subtitle: "IELTS Foundation A · luyện tập",
  reading: { timeAllowed: "30 phút", totalQuestions: 0, passages: [], sections: [] },
  writing: {
    timeAllowed: "30 phút",
    exercises: [
      {
        n: 1,
        points: 2,
        instruction: "Read the paragraph and complete the tasks that follow.",
        passage: {
          title: "Having a part-time job",
          body:
            "Having a part-time job can be very useful for students. The first benefit is earning money. This means that students can pay for their own books, clothes, or hobbies without asking their parents. For instance, a student who works at a café on weekends can save money for a new laptop. Another benefit is gaining experience. Students learn how to work with others, manage their time, and solve problems, which will help them in their future careers. The moon is much smaller than the Earth. Therefore, a part-time job can teach students skills that school cannot.",
        },
        checks: writingChecksEx1("Having a part-time job can be very useful for students.", "The moon is much smaller than the Earth."),
        notes: writingNotesEx1("Part-time Jobs"),
      },
      {
        n: 2,
        points: 8,
        instruction: "Pick one of the following topics to write a paragraph about (at least 7 sentences).",
        topics: [
          "The advantages of having a part-time job while studying. (at least 2 main ideas)",
          "The disadvantages of having a part-time job while studying. (at least 2 main ideas)",
          "The advantages and disadvantages of working from home.",
        ],
        notes: WRITING_NOTES_EX2,
      },
    ],
  },
}

const writingFilms: IfaTestPaper = {
  id: "writing-films",
  title: "WRITING 4 — Films & Entertainment",
  subtitle: "IELTS Foundation A · luyện tập",
  reading: { timeAllowed: "30 phút", totalQuestions: 0, passages: [], sections: [] },
  writing: {
    timeAllowed: "30 phút",
    exercises: [
      {
        n: 1,
        points: 2,
        instruction: "Read the paragraph and complete the tasks that follow.",
        passage: {
          title: "Watching films",
          body:
            "Watching films is a popular way to relax. One advantage is that films can reduce stress. This means that after a long day, people can enjoy a good story and forget their problems for a while. For example, watching a funny film with friends can make everyone laugh and feel happier. Another advantage is learning about other cultures. Films from different countries show how people live, eat, and celebrate around the world. Oranges are a good source of vitamin C. For these reasons, watching films is both enjoyable and useful.",
        },
        checks: writingChecksEx1("Watching films is a popular way to relax.", "Oranges are a good source of vitamin C."),
        notes: writingNotesEx1("Films & Entertainment"),
      },
      {
        n: 2,
        points: 8,
        instruction: "Pick one of the following topics to write a paragraph about (at least 7 sentences).",
        topics: [
          "The advantages of watching films. (at least 2 main ideas)",
          "The advantages and disadvantages of watching films at the cinema instead of at home.",
          "Why people enjoy watching films in their free time. (at least 2 main ideas)",
        ],
        notes: WRITING_NOTES_EX2,
      },
    ],
  },
}

const writingTravelling: IfaTestPaper = {
  id: "writing-travelling",
  title: "WRITING 5 — Travelling",
  subtitle: "IELTS Foundation A · luyện tập",
  reading: { timeAllowed: "30 phút", totalQuestions: 0, passages: [], sections: [] },
  writing: {
    timeAllowed: "30 phút",
    exercises: [
      {
        n: 1,
        points: 2,
        instruction: "Read the paragraph and complete the tasks that follow.",
        passage: {
          title: "Travelling to new places",
          body:
            "Travelling to new places is an exciting experience. One benefit is learning about other cultures. This means that travellers can see how people in other countries live and discover new food and traditions. For example, a trip to another country can teach you a few words of a new language. Another benefit is relaxing and having fun. After months of hard work or study, a holiday helps people rest and enjoy themselves. Computers were invented in the twentieth century. Because of these reasons, travelling is a wonderful way to learn and relax.",
        },
        checks: writingChecksEx1("Travelling to new places is an exciting experience.", "Computers were invented in the twentieth century."),
        notes: writingNotesEx1("Travelling"),
      },
      {
        n: 2,
        points: 8,
        instruction: "Pick one of the following topics to write a paragraph about (at least 7 sentences).",
        topics: [
          "The advantages of travelling to new places. (at least 2 main ideas)",
          "The advantages and disadvantages of travelling alone.",
          "Why many people enjoy travelling during their holidays. (at least 2 main ideas)",
        ],
        notes: WRITING_NOTES_EX2,
      },
    ],
  },
}

const writingOnlineShopping: IfaTestPaper = {
  id: "writing-online-shopping",
  title: "WRITING 6 — Online Shopping",
  subtitle: "IELTS Foundation A · luyện tập",
  reading: { timeAllowed: "30 phút", totalQuestions: 0, passages: [], sections: [] },
  writing: {
    timeAllowed: "30 phút",
    exercises: [
      {
        n: 1,
        points: 2,
        instruction: "Read the paragraph and complete the tasks that follow.",
        passage: {
          title: "Shopping online",
          body:
            "Shopping online has both advantages and disadvantages. One advantage is convenience because people can order things from home at any time. For example, a busy student can buy books in the evening without going to a shop. Online shops also offer a wide range of products, so customers can compare prices before they buy. However, shoppers cannot check the quality or size of a product in person. A piece of clothing may look different when it arrives, and returning it can take time. Deliveries can also be delayed, especially during busy holidays. My neighbour plays the guitar every weekend. Overall, online shopping can save time, but customers should read product details carefully before ordering.",
        },
        checks: writingChecksEx1("Shopping online has both advantages and disadvantages.", "My neighbour plays the guitar every weekend."),
        notes: writingNotesEx1("Online Shopping"),
      },
      {
        n: 2,
        points: 8,
        instruction: "Pick one of the following topics to write a paragraph about (at least 7 sentences).",
        topics: [
          "The advantages and disadvantages of shopping online. (at least 2 main ideas)",
          "The benefits of shopping online. (at least 2 main ideas)",
          "The disadvantages of shopping online. (at least 2 main ideas)",
        ],
        notes: WRITING_NOTES_EX2,
      },
    ],
  },
}

export const ifaWritingExtra: IfaTestPaper[] = [
  writingSports,
  writingRelationships,
  writingWork,
  writingFilms,
  writingTravelling,
  writingOnlineShopping,
]
