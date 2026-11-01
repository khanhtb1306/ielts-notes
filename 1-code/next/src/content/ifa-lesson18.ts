import type { IfaTestPaper } from "./ifa-reading"

/** Lesson 18 Practice Test, transcribed from the LangGo Reading/Writing handouts. */
export const lesson18Paper: IfaTestPaper = {
  id: "lesson-18-practice",
  title: "LESSON 18 — PRACTICE TEST",
  subtitle: "Reading · Listening · Writing",
  reading: {
    timeAllowed: "30 phút",
    totalQuestions: 14,
    passages: [
      {
        id: "p1",
        label: "Reading passage 1",
        title: "The benefits and drawbacks of electric cars",
        paragraphs: [
          "Electric cars (EVs) have become a significant topic of discussion in recent years, as countries strive to reduce their carbon footprints and combat climate change. Unlike traditional vehicles powered by internal combustion engines, EVs run on electricity stored in batteries. This innovation has transformed the automotive industry, offering both environmental benefits and new challenges.",
          "One of the most significant advantages of electric cars is their contribution to reducing greenhouse gas emissions. Traditional cars release harmful pollutants into the atmosphere, while EVs produce zero emissions during operation. This makes them a cleaner alternative, particularly when paired with renewable energy sources like solar or wind power. Additionally, electric cars are quieter than their gas-powered counterparts, contributing to less noise pollution in urban areas.",
          "However, electric cars have their drawbacks. A common concern is the limited battery range, which often requires frequent charging for long-distance travel. Charging infrastructure is also unevenly distributed, making it difficult for EV owners in remote areas to access charging stations. Furthermore, the production and disposal of EV batteries have their environmental impacts, as mining for raw materials like lithium can harm ecosystems.",
          "The cost of electric cars has historically been higher than that of traditional vehicles, but this gap is narrowing as technology advances and production scales up. Governments in many countries are encouraging the transition to EVs by offering subsidies, tax incentives, and grants to consumers. These measures aim to make EVs more affordable and accessible while supporting the development of cleaner transportation systems.",
          "In the future, electric cars are expected to dominate the automotive market as battery technology continues to improve. Innovations such as faster charging, longer battery life, and more sustainable production processes are key to overcoming current challenges. As more consumers adopt electric vehicles, the shift toward greener transportation is set to accelerate.",
        ],
      },
      {
        id: "p2",
        label: "Reading passage 2",
        title: "How online learning is reshaping education",
        paragraphs: [
          "In today's fast-paced world, online learning has emerged as a transformative force in education. With just a computer or a smartphone, students from around the globe can access a wide range of courses and materials at any time. This shift has redefined the traditional classroom, making education more accessible, flexible, and personalized.",
          "One significant aspect of online learning is its ability to break geographical barriers. A student in a rural village can now attend a lecture delivered by a professor from a top university, an opportunity that was almost impossible a decade ago. Online platforms like Khan Academy and Coursera provide high-quality education to millions, regardless of their location or financial situation.",
          "Another feature of online learning is the use of advanced technology to create interactive and engaging content. Video tutorials, gamified lessons, and virtual simulations allow learners to experience concepts in ways that traditional textbooks cannot. Artificial intelligence (AI) further enhances the experience by adapting content to individual needs, ensuring that every student learns at their own pace.",
          "However, online learning is not just for formal education. Professionals looking to upgrade their skills often turn to platforms like LinkedIn Learning or Udemy. These platforms offer a wide variety of courses ranging from coding and design to communication skills, helping individuals remain competitive in the workforce.",
          "The rise of online learning has also led to the emergence of hybrid education models. Many schools and universities now combine online and offline methods to offer a more comprehensive learning experience. While online tools allow for flexibility and innovation, in-person classes provide social interaction and hands-on practice, striking a balance between convenience and connection.",
          "As online learning continues to evolve, it promises to make education more inclusive and tailored to the needs of a global audience. With the integration of virtual reality (VR) and augmented reality (AR), the future of education may include fully immersive environments, where students can \"visit\" ancient Rome or explore the human body in 3D. The possibilities are endless.",
        ],
      },
    ],
    sections: [
      {
        group: "Questions 1-3",
        passageId: "p1",
        instruction: "Complete the sentences below. Write NO MORE THAN TWO WORDS from the text for each answer.",
        questions: [
          { n: 1, kind: "fill", prompt: "Electric cars produce ______ during operation, making them more environmentally friendly.", answers: ["zero emissions"] },
          { n: 2, kind: "fill", prompt: "Limited ______ is a major concern for electric car owners travelling long distances.", answers: ["battery range"] },
          { n: 3, kind: "fill", prompt: "Governments are encouraging the use of EVs through ______ and financial incentives.", answers: ["subsidies", "offering subsidies"] },
        ],
      },
      {
        group: "Questions 4-7",
        passageId: "p1",
        instruction: "Choose the correct letter, A, B, C or D.",
        questions: [
          { n: 4, kind: "choice", prompt: "What is one way electric cars help reduce noise pollution?", options: [{ id: "A", text: "They are quieter than traditional vehicles." }, { id: "B", text: "They produce less vibration in the engine." }, { id: "C", text: "They use renewable energy sources." }, { id: "D", text: "They have soundproof cabins." }], answer: "A" },
          { n: 5, kind: "choice", prompt: "Why are some people hesitant to switch to electric cars?", options: [{ id: "A", text: "They are unsure about the safety of EVs." }, { id: "B", text: "They think EV batteries are difficult to replace." }, { id: "C", text: "They worry about battery production's environmental impact." }, { id: "D", text: "They prefer traditional vehicles' faster speeds." }], answer: "C" },
          { n: 6, kind: "choice", prompt: "What future innovation is expected to increase the popularity of electric vehicles?", options: [{ id: "A", text: "More powerful combustion engines" }, { id: "B", text: "Faster and more sustainable charging methods" }, { id: "C", text: "Reduced manufacturing times for traditional cars" }, { id: "D", text: "Expanding highways for EVs" }], answer: "B" },
          { n: 7, kind: "choice", prompt: "What is expected to help electric cars become more common in the future?", options: [{ id: "A", text: "Lower prices of traditional cars" }, { id: "B", text: "Reduced government support for EVs" }, { id: "C", text: "Increasing demand for fuel" }, { id: "D", text: "Faster and more efficient charging technology" }], answer: "D" },
        ],
      },
      {
        group: "Questions 8-10",
        passageId: "p2",
        instruction: "Answer the questions below. Choose NO MORE THAN THREE WORDS from the text for each answer.",
        questions: [
          { n: 8, kind: "fill", prompt: "Which tools are mentioned as offering high-quality education globally? ______", answers: ["online platforms"] },
          { n: 9, kind: "fill", prompt: "Which technology adapts content to suit individual learning needs? ______", answers: ["AI", "artificial intelligence"] },
          { n: 10, kind: "fill", prompt: "What approach mixes online and traditional learning methods? ______", answers: ["hybrid education", "hybrid education models"] },
        ],
      },
      {
        group: "Questions 11-14",
        passageId: "p2",
        instruction: "Choose the correct letter, A, B, C or D.",
        questions: [
          { n: 11, kind: "choice", prompt: "According to the passage, how has online learning transformed education?", options: [{ id: "A", text: "By requiring students to use only smartphones for learning" }, { id: "B", text: "By replacing traditional subjects with modern ones" }, { id: "C", text: "By reducing the amount of homework given to students" }, { id: "D", text: "By allowing students to study at any time and from anywhere" }], answer: "D" },
          { n: 12, kind: "choice", prompt: "How does AI enhance the learning experience in online education?", options: [{ id: "A", text: "By providing video tutorials for all courses" }, { id: "B", text: "By personalizing content based on students' needs" }, { id: "C", text: "By offering live discussions with instructors" }, { id: "D", text: "By tailoring interactive quizzes to each student" }], answer: "B" },
          { n: 13, kind: "choice", prompt: "Why do professionals use platforms like LinkedIn Learning?", options: [{ id: "A", text: "To earn university degrees" }, { id: "B", text: "To prepare for traditional exams" }, { id: "C", text: "To stay ahead in their professional fields" }, { id: "D", text: "To find jobs in rural areas" }], answer: "C" },
          { n: 14, kind: "choice", prompt: "What future technology could make online learning more immersive?", options: [{ id: "A", text: "Virtual and augmented reality" }, { id: "B", text: "Digital textbooks" }, { id: "C", text: "Artificial intelligence grading" }, { id: "D", text: "Video tutorials" }], answer: "A" },
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
          title: "e-Readers",
          body: "For many students, e-readers are better than paper books. First, e-books are better for students' bodies. Before e-readers, students had to carry several heavy books with them each day. However, e-readers are very light and usually weigh less than a pound, so there is less stress on students' bodies. Second, e-readers are more convenient than regular books. Students can take all their textbooks with them anywhere they want. They are easy to hold and are clear even in bright sunlight. In addition, reading an e-reader is just like reading a paper book, but they are more convenient because it is not necessary to turn the pages. My friend has an e-reader, and she convinced me to buy one. Finally, buying a new e-book often costs less than buying a traditional paper book, so students may spend less if they buy e-books.",
        },
        checks: [
          { prompt: "What is the topic sentence in the paragraph?", answer: "For many students, e-readers are better than paper books." },
          { prompt: "Find the sentence not related to the topic.", answer: "My friend has an e-reader, and she convinced me to buy one." },
        ],
        notes: ["Make 1 complex sentence and 1 compound sentence about \"Reading\". (1 pt)"],
      },
      {
        n: 2,
        points: 8,
        instruction: "Based on the ideas you've prepared in class, choose some appropriate transitional signals and write 2 paragraphs about: What are the advantages and disadvantages of studying an online course? (at least 100 words/paragraph)",
        notes: ["Write one paragraph about advantages and one about disadvantages.", "Use appropriate transitional signals; write at least 100 words in each paragraph."],
        minWordsPerParagraph: 100,
      },
    ],
  },
}
