/**
 * Extra hand-authored IFA practice papers (Reading + Writing), modelled on the
 * teacher's sample. Topics stay within the course: Shopping, Sports, Learning,
 * Transport, Health, Relationships, Work, Films, Friendship, Travelling.
 *
 * Fill answers are taken verbatim from the passages so the auto-grader matches.
 */
import type { IfaTestPaper } from "./ifa-reading"

// ─────────────────────────────────────────────────────────────────────────────
// READING PAPERS
// ─────────────────────────────────────────────────────────────────────────────

const readingShopping: IfaTestPaper = {
  id: "reading-shopping",
  title: "READING 1 — Shopping & Markets",
  subtitle: "IELTS Foundation A · luyện tập",
  reading: {
    timeAllowed: "30 phút",
    totalQuestions: 14,
    passages: [
      {
        id: "p1",
        label: "Reading passage 1",
        title: "Shopping habits today",
        paragraphs: [
          "Shopping is a part of everyday life. In the past, most people bought things from small local shops or busy street markets. Today, they can also shop online from home. Both ways of shopping have advantages, and many people use a mix of the two depending on what they need to buy.",
          "Online shopping has become very popular because it is convenient. People can order products at any time of the day and have them delivered to their homes. They can also compare prices easily and read reviews written by other customers before they decide. This helps shoppers find the best deals without leaving the house.",
          "However, some people still prefer to shop in stores. They like to see and touch products before buying them, especially clothes and food. Shopping in a store is also a social activity, as people can go with friends or family. In addition, if there is a problem with a product, it is often easier to return it to a local shop.",
          "Whichever way people choose, spending wisely is important. Experts advise making a list before shopping and setting a budget to avoid buying things they do not really need. By planning carefully, shoppers can save money and still enjoy the experience.",
        ],
      },
      {
        id: "p2",
        label: "Reading passage 2",
        title: "The return of local markets",
        paragraphs: [
          "In many cities, traditional markets are becoming popular again. These markets sell fresh fruit, vegetables, and local products directly from the people who grow or make them. Shoppers enjoy the friendly atmosphere and the chance to talk to the sellers.",
          "One reason for this change is that people care more about where their food comes from. Products at local markets are often fresher than those in large supermarkets because they do not travel long distances. Many shoppers also believe that buying locally helps support small farmers and reduces waste.",
          "Prices at markets can be lower too, as there are fewer costs for transport and packaging. Some sellers are even willing to lower the price a little if customers buy a large amount. This makes markets a good choice for families who want to save money.",
          "Of course, markets are not perfect. They are usually open only on certain days, and the choice of products may be smaller than in a supermarket. Even so, for many people the fresh food and the sense of community make the visit worthwhile.",
        ],
      },
    ],
    sections: [
      {
        group: "Questions 1-3",
        instruction: "Complete the sentences below. Write NO MORE THAN TWO WORDS from the text for each answer.",
        passageId: "p1",
        questions: [
          { n: 1, kind: "fill", prompt: "Online shopping is popular mainly because it is ______.", answers: ["convenient"] },
          { n: 2, kind: "fill", prompt: "Before buying, online shoppers can read ______ written by other customers.", answers: ["reviews"] },
          { n: 3, kind: "fill", prompt: "Experts advise setting a ______ to avoid overspending.", answers: ["budget"] },
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
            prompt: "Why do some people still prefer shopping in stores?",
            options: [
              { id: "A", text: "It is always cheaper" },
              { id: "B", text: "They can see and touch products" },
              { id: "C", text: "Stores never close" },
              { id: "D", text: "Delivery is faster" },
            ],
            answer: "B",
          },
          {
            n: 5,
            kind: "choice",
            prompt: "What makes shopping in a store a social activity?",
            options: [
              { id: "A", text: "People can go with friends or family" },
              { id: "B", text: "Stores play music" },
              { id: "C", text: "Prices can be compared online" },
              { id: "D", text: "Products are delivered home" },
            ],
            answer: "A",
          },
          {
            n: 6,
            kind: "choice",
            prompt: "According to the passage, returning a product is often easier when you buy from",
            options: [
              { id: "A", text: "a foreign website" },
              { id: "B", text: "a large supermarket" },
              { id: "C", text: "a local shop" },
              { id: "D", text: "a street seller" },
            ],
            answer: "C",
          },
          {
            n: 7,
            kind: "choice",
            prompt: "What does the writer suggest doing before shopping?",
            options: [
              { id: "A", text: "Borrowing money" },
              { id: "B", text: "Making a list" },
              { id: "C", text: "Visiting many cities" },
              { id: "D", text: "Buying in large amounts" },
            ],
            answer: "B",
          },
        ],
      },
      {
        group: "Questions 8-10",
        instruction: "Answer the questions below. Choose NO MORE THAN TWO WORDS from the text for each answer.",
        passageId: "p2",
        questions: [
          { n: 8, kind: "fill", prompt: "What kind of products do local markets sell directly from producers?", answers: ["local products", "fresh fruit"] },
          { n: 9, kind: "fill", prompt: "Buying locally helps support small ______.", answers: ["farmers"] },
          { n: 10, kind: "fill", prompt: "Market prices can be lower partly because of fewer costs for transport and ______.", answers: ["packaging"] },
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
            prompt: "Why are traditional markets becoming popular again?",
            options: [
              { id: "A", text: "People care more about where food comes from" },
              { id: "B", text: "Supermarkets have closed" },
              { id: "C", text: "They are open every day" },
              { id: "D", text: "They sell electronics" },
            ],
            answer: "A",
          },
          {
            n: 12,
            kind: "choice",
            prompt: "Why is food at local markets often fresher?",
            options: [
              { id: "A", text: "It is frozen" },
              { id: "B", text: "It does not travel long distances" },
              { id: "C", text: "It is imported" },
              { id: "D", text: "It is cooked" },
            ],
            answer: "B",
          },
          {
            n: 13,
            kind: "choice",
            prompt: "When might a seller lower the price?",
            options: [
              { id: "A", text: "When the market is empty" },
              { id: "B", text: "When it rains" },
              { id: "C", text: "When customers buy a large amount" },
              { id: "D", text: "When products are old" },
            ],
            answer: "C",
          },
          {
            n: 14,
            kind: "choice",
            prompt: "What is one disadvantage of markets mentioned in the passage?",
            options: [
              { id: "A", text: "The food is never fresh" },
              { id: "B", text: "They are open only on certain days" },
              { id: "C", text: "Prices are always high" },
              { id: "D", text: "Sellers are unfriendly" },
            ],
            answer: "B",
          },
        ],
      },
    ],
  },
  writing: { timeAllowed: "30 phút", exercises: [] },
}

const readingSports: IfaTestPaper = {
  id: "reading-sports",
  title: "READING 2 — Sports & Exercise",
  subtitle: "IELTS Foundation A · luyện tập",
  reading: {
    timeAllowed: "30 phút",
    totalQuestions: 14,
    passages: [
      {
        id: "p1",
        label: "Reading passage 1",
        title: "Why we play sports",
        paragraphs: [
          "People all over the world play sports for many different reasons. Some play to stay healthy, while others play simply because it is fun. Sports can be enjoyed alone, like running or swimming, or in teams, like football and basketball. Whatever the type, playing sports brings many benefits.",
          "The most obvious benefit is better physical health. Regular exercise makes the heart stronger and helps people control their weight. It also builds muscles and improves flexibility. Doctors often advise people to be active for at least thirty minutes a day to stay fit.",
          "Sports are also good for the mind. When people exercise, their bodies release chemicals that make them feel happier and reduce stress. Many people say that after a game or a run, they feel more relaxed and can think more clearly. For this reason, sport is sometimes used to help people who feel worried or sad.",
          "Finally, team sports teach important social skills. Players learn to work together, to follow rules, and to respect others. Winning and losing also teach people how to deal with success and disappointment. These lessons are useful not only in sport but also in everyday life.",
        ],
      },
      {
        id: "p2",
        label: "Reading passage 2",
        title: "Making time to exercise",
        paragraphs: [
          "Many people know that exercise is good for them, but they say they are too busy to do it. With work, study, and family duties, finding time can be difficult. However, experts believe that almost everyone can fit some activity into their day if they plan well.",
          "One simple idea is to make exercise part of daily routines. People can walk or cycle to work instead of driving, or take the stairs instead of the lift. These small changes add up and can make a real difference over time without needing a gym.",
          "Another tip is to choose an activity you enjoy. If exercise feels boring, people quickly give up. But if they pick a sport or a class they like, such as dancing or swimming, they are far more likely to continue. Doing it with a friend can also make it more fun and help people stay motivated.",
          "Experts also warn against doing too much too soon. Starting slowly and increasing the effort step by step helps prevent injuries. The most important thing is to be active regularly, even if only for a short time each day.",
        ],
      },
    ],
    sections: [
      {
        group: "Questions 1-3",
        instruction: "Complete the sentences below. Write NO MORE THAN TWO WORDS from the text for each answer.",
        passageId: "p1",
        questions: [
          { n: 1, kind: "fill", prompt: "Regular exercise makes the ______ stronger.", answers: ["heart"] },
          { n: 2, kind: "fill", prompt: "Doctors advise being active for at least ______ minutes a day.", answers: ["thirty", "30"] },
          { n: 3, kind: "fill", prompt: "After exercising, chemicals in the body help reduce ______.", answers: ["stress"] },
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
            prompt: "Which of these is an example of a team sport in the passage?",
            options: [
              { id: "A", text: "Running" },
              { id: "B", text: "Swimming" },
              { id: "C", text: "Football" },
              { id: "D", text: "Cycling" },
            ],
            answer: "C",
          },
          {
            n: 5,
            kind: "choice",
            prompt: "According to the passage, how do sports help the mind?",
            options: [
              { id: "A", text: "They make people feel happier and less stressed" },
              { id: "B", text: "They help people earn money" },
              { id: "C", text: "They make people sleep less" },
              { id: "D", text: "They improve eyesight" },
            ],
            answer: "A",
          },
          {
            n: 6,
            kind: "choice",
            prompt: "What do team sports teach players?",
            options: [
              { id: "A", text: "How to cook" },
              { id: "B", text: "How to work together and respect others" },
              { id: "C", text: "How to drive" },
              { id: "D", text: "How to save money" },
            ],
            answer: "B",
          },
          {
            n: 7,
            kind: "choice",
            prompt: "Why is sport sometimes used to help worried people?",
            options: [
              { id: "A", text: "It makes them tired" },
              { id: "B", text: "It helps them relax and think clearly" },
              { id: "C", text: "It keeps them indoors" },
              { id: "D", text: "It is expensive" },
            ],
            answer: "B",
          },
        ],
      },
      {
        group: "Questions 8-10",
        instruction: "Answer the questions below. Choose NO MORE THAN TWO WORDS from the text for each answer.",
        passageId: "p2",
        questions: [
          { n: 8, kind: "fill", prompt: "People can walk or ______ to work instead of driving.", answers: ["cycle"] },
          { n: 9, kind: "fill", prompt: "People are more likely to continue if they choose an activity they ______.", answers: ["enjoy", "like"] },
          { n: 10, kind: "fill", prompt: "Starting slowly helps prevent ______.", answers: ["injuries"] },
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
            prompt: "What reason do many people give for not exercising?",
            options: [
              { id: "A", text: "They are too busy" },
              { id: "B", text: "They have no shoes" },
              { id: "C", text: "They dislike all sport" },
              { id: "D", text: "They live far away" },
            ],
            answer: "A",
          },
          {
            n: 12,
            kind: "choice",
            prompt: "What simple change does the passage suggest?",
            options: [
              { id: "A", text: "Driving more often" },
              { id: "B", text: "Taking the stairs instead of the lift" },
              { id: "C", text: "Sleeping longer" },
              { id: "D", text: "Eating less" },
            ],
            answer: "B",
          },
          {
            n: 13,
            kind: "choice",
            prompt: "How can exercising with a friend help?",
            options: [
              { id: "A", text: "It makes it more fun and keeps people motivated" },
              { id: "B", text: "It saves electricity" },
              { id: "C", text: "It makes it cheaper" },
              { id: "D", text: "It is faster" },
            ],
            answer: "A",
          },
          {
            n: 14,
            kind: "choice",
            prompt: "What do experts warn against?",
            options: [
              { id: "A", text: "Exercising with friends" },
              { id: "B", text: "Doing too much too soon" },
              { id: "C", text: "Walking to work" },
              { id: "D", text: "Choosing a class you enjoy" },
            ],
            answer: "B",
          },
        ],
      },
    ],
  },
  writing: { timeAllowed: "30 phút", exercises: [] },
}

const readingLearning: IfaTestPaper = {
  id: "reading-learning",
  title: "READING 3 — Learning & Education",
  subtitle: "IELTS Foundation A · luyện tập",
  reading: {
    timeAllowed: "30 phút",
    totalQuestions: 14,
    passages: [
      {
        id: "p1",
        label: "Reading passage 1",
        title: "Learning a new language",
        paragraphs: [
          "Learning a new language is a popular goal for people of all ages. Some study a language for work, others for travel, and many simply enjoy the challenge. Although it takes time and effort, learning a language can open many doors and change the way people see the world.",
          "There are many ways to learn. Some people take classes with a teacher, while others study alone using books or mobile apps. Watching films and listening to music in the new language can also help, because it makes learning more natural and fun. The best method often depends on the learner.",
          "Experts agree that practice is the key to success. Using the language every day, even for a few minutes, is more useful than studying for hours only once a week. Speaking with other people, even if you make mistakes, helps you improve quickly and build confidence.",
          "Learning a language also brings other benefits. Studies show that it can improve memory and help the brain stay healthy. People who speak more than one language often find it easier to understand other cultures and make new friends around the world.",
        ],
      },
      {
        id: "p2",
        label: "Reading passage 2",
        title: "Studying online",
        paragraphs: [
          "In recent years, more and more students have started to study online. Instead of going to a classroom, they use a computer or phone to join lessons from home. This way of learning has grown quickly and is now used by schools and universities all over the world.",
          "The biggest advantage of online study is flexibility. Students can learn at a time that suits them and often watch lessons again if they do not understand. This is very helpful for people who also have jobs or families. Online courses can also be cheaper because there are no travel costs.",
          "However, studying online is not easy for everyone. Some students miss the chance to meet classmates and teachers face to face. Others find it hard to stay motivated when they study alone at home. Technical problems, such as a weak internet connection, can also interrupt learning.",
          "To study online successfully, students need good habits. Making a timetable, finding a quiet place, and taking regular breaks all help. With the right planning, online study can be just as useful as learning in a classroom.",
        ],
      },
    ],
    sections: [
      {
        group: "Questions 1-3",
        instruction: "Complete the sentences below. Write NO MORE THAN TWO WORDS from the text for each answer.",
        passageId: "p1",
        questions: [
          { n: 1, kind: "fill", prompt: "Some people learn a language alone using books or mobile ______.", answers: ["apps"] },
          { n: 2, kind: "fill", prompt: "Experts agree that ______ is the key to success.", answers: ["practice"] },
          { n: 3, kind: "fill", prompt: "Speaking with others helps you improve and build ______.", answers: ["confidence"] },
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
            prompt: "Why do many people learn a language, according to the passage?",
            options: [
              { id: "A", text: "To become famous" },
              { id: "B", text: "For work, travel, or the challenge" },
              { id: "C", text: "To earn money quickly" },
              { id: "D", text: "To avoid exams" },
            ],
            answer: "B",
          },
          {
            n: 5,
            kind: "choice",
            prompt: "Why can watching films help language learning?",
            options: [
              { id: "A", text: "It makes learning more natural and fun" },
              { id: "B", text: "It replaces all classes" },
              { id: "C", text: "It is always free" },
              { id: "D", text: "It is very quick" },
            ],
            answer: "A",
          },
          {
            n: 6,
            kind: "choice",
            prompt: "What is more useful than studying for hours once a week?",
            options: [
              { id: "A", text: "Sleeping more" },
              { id: "B", text: "Using the language every day" },
              { id: "C", text: "Reading only" },
              { id: "D", text: "Travelling abroad" },
            ],
            answer: "B",
          },
          {
            n: 7,
            kind: "choice",
            prompt: "What extra benefit of learning a language is mentioned?",
            options: [
              { id: "A", text: "It improves memory" },
              { id: "B", text: "It makes people taller" },
              { id: "C", text: "It increases salaries" },
              { id: "D", text: "It saves electricity" },
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
          { n: 8, kind: "fill", prompt: "The biggest advantage of online study is ______.", answers: ["flexibility"] },
          { n: 9, kind: "fill", prompt: "Online courses can be cheaper because there are no ______ costs.", answers: ["travel"] },
          { n: 10, kind: "fill", prompt: "A weak internet ______ can interrupt learning.", answers: ["connection"] },
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
            prompt: "How do students join online lessons?",
            options: [
              { id: "A", text: "By going to a classroom" },
              { id: "B", text: "By using a computer or phone from home" },
              { id: "C", text: "By sending letters" },
              { id: "D", text: "By reading newspapers" },
            ],
            answer: "B",
          },
          {
            n: 12,
            kind: "choice",
            prompt: "Why is flexibility helpful for some students?",
            options: [
              { id: "A", text: "They can learn at a time that suits them" },
              { id: "B", text: "They never have exams" },
              { id: "C", text: "They can skip all lessons" },
              { id: "D", text: "They get free computers" },
            ],
            answer: "A",
          },
          {
            n: 13,
            kind: "choice",
            prompt: "What do some students miss when studying online?",
            options: [
              { id: "A", text: "Homework" },
              { id: "B", text: "Meeting classmates and teachers face to face" },
              { id: "C", text: "Examinations" },
              { id: "D", text: "Travelling" },
            ],
            answer: "B",
          },
          {
            n: 14,
            kind: "choice",
            prompt: "What helps students study online successfully?",
            options: [
              { id: "A", text: "Making a timetable and finding a quiet place" },
              { id: "B", text: "Studying only at night" },
              { id: "C", text: "Avoiding breaks" },
              { id: "D", text: "Turning off the internet" },
            ],
            answer: "A",
          },
        ],
      },
    ],
  },
  writing: { timeAllowed: "30 phút", exercises: [] },
}

const readingTransport: IfaTestPaper = {
  id: "reading-transport",
  title: "READING 4 — Transport & Cities",
  subtitle: "IELTS Foundation A · luyện tập",
  reading: {
    timeAllowed: "30 phút",
    totalQuestions: 14,
    passages: [
      {
        id: "p1",
        label: "Reading passage 1",
        title: "Getting around the city",
        paragraphs: [
          "Every day, millions of people travel around their cities to go to work, school, or the shops. They use many different kinds of transport, such as buses, trains, cars, bicycles, and motorbikes. The type of transport people choose often depends on cost, speed, and how far they need to go.",
          "Public transport, like buses and trains, is popular in big cities because it is usually cheap and can carry many people at once. It also helps reduce the number of cars on the road, which means less traffic. However, buses and trains can be crowded, especially in the morning and evening when most people travel.",
          "Many people still prefer to use private cars because they are comfortable and convenient. A car lets you travel directly from your home to your destination at any time. The problem is that cars are expensive to buy and run, and too many cars cause traffic jams and air pollution in city centres.",
          "In recent years, cycling has become more popular. It is cheap, good for health, and does not pollute the air. Some cities have built special cycle lanes to make riding safer. As cities grow, planners are looking for new ways to help people move around easily while keeping the air clean.",
        ],
      },
      {
        id: "p2",
        label: "Reading passage 2",
        title: "The future of transport",
        paragraphs: [
          "Transport is changing fast. In many countries, engineers are developing new vehicles that are cleaner and smarter than those we use today. These changes could make travel safer, cheaper, and better for the environment in the years to come.",
          "One of the biggest changes is the electric car. Unlike normal cars, electric cars do not burn petrol, so they produce no smoke and make very little noise. As more charging points are built, experts believe that electric cars will soon become common on our roads.",
          "Another exciting idea is the self-driving car. These cars use computers and sensors to drive themselves without a human driver. Supporters say they could reduce accidents caused by human mistakes. However, some people worry about safety and are not yet ready to trust a machine to drive.",
          "Cities are also improving public transport. Faster trains and better bus services can carry more people and reduce the need for cars. By combining clean vehicles with good public transport, cities hope to cut pollution and make travel easier for everyone.",
        ],
      },
    ],
    sections: [
      {
        group: "Questions 1-3",
        instruction: "Complete the sentences below. Write NO MORE THAN TWO WORDS from the text for each answer.",
        passageId: "p1",
        questions: [
          { n: 1, kind: "fill", prompt: "Public transport helps reduce the number of ______ on the road.", answers: ["cars"] },
          { n: 2, kind: "fill", prompt: "Buses and trains can be ______, especially in the morning and evening.", answers: ["crowded"] },
          { n: 3, kind: "fill", prompt: "Some cities have built special cycle ______ to make riding safer.", answers: ["lanes"] },
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
            prompt: "What often decides which transport people choose?",
            options: [
              { id: "A", text: "The weather only" },
              { id: "B", text: "Cost, speed, and distance" },
              { id: "C", text: "The colour of the vehicle" },
              { id: "D", text: "Their age" },
            ],
            answer: "B",
          },
          {
            n: 5,
            kind: "choice",
            prompt: "Why is public transport popular in big cities?",
            options: [
              { id: "A", text: "It is cheap and carries many people" },
              { id: "B", text: "It is never crowded" },
              { id: "C", text: "It is the fastest in all cases" },
              { id: "D", text: "It is free" },
            ],
            answer: "A",
          },
          {
            n: 6,
            kind: "choice",
            prompt: "What is a problem with using private cars?",
            options: [
              { id: "A", text: "They are too slow" },
              { id: "B", text: "They cannot reach homes" },
              { id: "C", text: "They cause traffic jams and pollution" },
              { id: "D", text: "They carry too many people" },
            ],
            answer: "C",
          },
          {
            n: 7,
            kind: "choice",
            prompt: "Why has cycling become more popular?",
            options: [
              { id: "A", text: "It is cheap and good for health" },
              { id: "B", text: "It is the fastest option" },
              { id: "C", text: "It needs no roads" },
              { id: "D", text: "It is very comfortable" },
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
          { n: 8, kind: "fill", prompt: "Electric cars do not burn ______.", answers: ["petrol"] },
          { n: 9, kind: "fill", prompt: "Self-driving cars use computers and ______ to drive themselves.", answers: ["sensors"] },
          { n: 10, kind: "fill", prompt: "Supporters say self-driving cars could reduce ______ caused by human mistakes.", answers: ["accidents"] },
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
            prompt: "What is one benefit of electric cars?",
            options: [
              { id: "A", text: "They produce no smoke and little noise" },
              { id: "B", text: "They are always free" },
              { id: "C", text: "They need no roads" },
              { id: "D", text: "They can fly" },
            ],
            answer: "A",
          },
          {
            n: 12,
            kind: "choice",
            prompt: "What will help electric cars become common?",
            options: [
              { id: "A", text: "More petrol stations" },
              { id: "B", text: "More charging points" },
              { id: "C", text: "Fewer roads" },
              { id: "D", text: "Higher prices" },
            ],
            answer: "B",
          },
          {
            n: 13,
            kind: "choice",
            prompt: "Why do some people worry about self-driving cars?",
            options: [
              { id: "A", text: "They are too cheap" },
              { id: "B", text: "They are worried about safety" },
              { id: "C", text: "They are too slow" },
              { id: "D", text: "They use petrol" },
            ],
            answer: "B",
          },
          {
            n: 14,
            kind: "choice",
            prompt: "How do cities hope to cut pollution?",
            options: [
              { id: "A", text: "By banning all transport" },
              { id: "B", text: "By combining clean vehicles with good public transport" },
              { id: "C", text: "By building more car parks" },
              { id: "D", text: "By removing trains" },
            ],
            answer: "B",
          },
        ],
      },
    ],
  },
  writing: { timeAllowed: "30 phút", exercises: [] },
}

const readingHealth: IfaTestPaper = {
  id: "reading-health",
  title: "READING 5 — Health & Lifestyle",
  subtitle: "IELTS Foundation A · luyện tập",
  reading: {
    timeAllowed: "30 phút",
    totalQuestions: 14,
    passages: [
      {
        id: "p1",
        label: "Reading passage 1",
        title: "Eating well",
        paragraphs: [
          "A healthy diet is one of the most important parts of a healthy life. The food we eat gives us energy and helps our bodies grow and repair. Eating the right kinds of food in the right amounts can help people stay fit and avoid many illnesses.",
          "Doctors say that a good diet should include plenty of fruit and vegetables. These foods contain vitamins that keep the body strong and help it fight disease. People are also advised to drink enough water every day, as water is needed for almost everything the body does.",
          "At the same time, experts warn against eating too much sugar and fat. Foods like sweets, cakes, and fast food taste good but can cause health problems if eaten too often. Eating these foods only sometimes, as a treat, is a better choice than eating them every day.",
          "Good eating habits often start when people are young. Children who learn to enjoy healthy food usually keep these habits as adults. Families can help by cooking fresh meals at home and eating together, which also gives everyone a chance to relax and talk.",
        ],
      },
      {
        id: "p2",
        label: "Reading passage 2",
        title: "Rest and the body",
        paragraphs: [
          "Sleep is just as important for health as food and exercise, yet many people do not get enough of it. During sleep, the body rests and repairs itself, and the brain stores the things we have learned during the day. Without enough sleep, people often feel tired and find it hard to concentrate.",
          "Experts say that most adults need about seven or eight hours of sleep each night. Children and teenagers usually need even more because their bodies are still growing. Getting enough rest helps people feel happier, think more clearly, and stay healthy.",
          "Many things can make sleep difficult. Using phones or computers late at night, drinking coffee in the evening, or worrying about problems can all keep people awake. Experts advise turning off screens before bed and keeping the bedroom quiet and dark.",
          "A regular routine can also help. Going to bed and waking up at the same time every day teaches the body when to sleep. With good habits, most people can enjoy better rest and wake up feeling fresh and ready for the day.",
        ],
      },
    ],
    sections: [
      {
        group: "Questions 1-3",
        instruction: "Complete the sentences below. Write NO MORE THAN TWO WORDS from the text for each answer.",
        passageId: "p1",
        questions: [
          { n: 1, kind: "fill", prompt: "A good diet should include plenty of fruit and ______.", answers: ["vegetables"] },
          { n: 2, kind: "fill", prompt: "Fruit and vegetables contain ______ that keep the body strong.", answers: ["vitamins"] },
          { n: 3, kind: "fill", prompt: "Experts warn against eating too much sugar and ______.", answers: ["fat"] },
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
            prompt: "What does the food we eat do for our bodies?",
            options: [
              { id: "A", text: "Makes us taller only" },
              { id: "B", text: "Gives energy and helps the body grow and repair" },
              { id: "C", text: "Helps us sleep less" },
              { id: "D", text: "Makes us run faster only" },
            ],
            answer: "B",
          },
          {
            n: 5,
            kind: "choice",
            prompt: "Why should people drink enough water?",
            options: [
              { id: "A", text: "Water is needed for almost everything the body does" },
              { id: "B", text: "Water makes food taste better" },
              { id: "C", text: "Water replaces sleep" },
              { id: "D", text: "Water is free" },
            ],
            answer: "A",
          },
          {
            n: 6,
            kind: "choice",
            prompt: "According to the passage, how often should people eat sweets and fast food?",
            options: [
              { id: "A", text: "Every day" },
              { id: "B", text: "Only sometimes, as a treat" },
              { id: "C", text: "Never" },
              { id: "D", text: "Only in the morning" },
            ],
            answer: "B",
          },
          {
            n: 7,
            kind: "choice",
            prompt: "How can families help build good eating habits?",
            options: [
              { id: "A", text: "By cooking fresh meals and eating together" },
              { id: "B", text: "By eating fast food together" },
              { id: "C", text: "By skipping meals" },
              { id: "D", text: "By eating alone" },
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
          { n: 8, kind: "fill", prompt: "During sleep, the brain stores the things we have ______ during the day.", answers: ["learned", "learnt"] },
          { n: 9, kind: "fill", prompt: "Most adults need about seven or ______ hours of sleep each night.", answers: ["eight"] },
          { n: 10, kind: "fill", prompt: "Experts advise turning off ______ before bed.", answers: ["screens"] },
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
            prompt: "What happens to the body during sleep?",
            options: [
              { id: "A", text: "It rests and repairs itself" },
              { id: "B", text: "It grows taller only" },
              { id: "C", text: "It uses more energy" },
              { id: "D", text: "It stops completely" },
            ],
            answer: "A",
          },
          {
            n: 12,
            kind: "choice",
            prompt: "Why do children and teenagers need more sleep?",
            options: [
              { id: "A", text: "They study less" },
              { id: "B", text: "Their bodies are still growing" },
              { id: "C", text: "They eat more" },
              { id: "D", text: "They wake up early" },
            ],
            answer: "B",
          },
          {
            n: 13,
            kind: "choice",
            prompt: "Which of these can make sleep difficult?",
            options: [
              { id: "A", text: "A quiet, dark bedroom" },
              { id: "B", text: "Drinking coffee in the evening" },
              { id: "C", text: "A regular routine" },
              { id: "D", text: "Turning off screens" },
            ],
            answer: "B",
          },
          {
            n: 14,
            kind: "choice",
            prompt: "How does a regular routine help sleep?",
            options: [
              { id: "A", text: "It teaches the body when to sleep" },
              { id: "B", text: "It makes people eat more" },
              { id: "C", text: "It removes the need for sleep" },
              { id: "D", text: "It keeps screens on" },
            ],
            answer: "A",
          },
        ],
      },
    ],
  },
  writing: { timeAllowed: "30 phút", exercises: [] },
}

const readingVietnam: IfaTestPaper = {
  id: "reading-vietnam",
  title: "FINAL TEST — Reading (VN)",
  subtitle: "IELTS Foundation A · luyện tập",
  hidden: true,
  reading: {
    timeAllowed: "30 phút",
    totalQuestions: 14,
    passages: [
      {
        id: "p1",
        label: "Reading passage 1",
        title: "Hung Kings' Commemoration Day in Vietnam",
        paragraphs: [
          "Hung Kings' Commemoration Day is an important national holiday in Vietnam. It is celebrated every year on the tenth day of the third lunar month. This special occasion honours the Hung Kings, who are believed to be the first rulers of the Vietnamese nation. According to legend, they founded the ancient state of Van Lang thousands of years ago. For many Vietnamese people, this day is a time to remember their roots and show respect to their ancestors.",
          "The main celebration takes place at the Hung Temple, which is located in Phu Tho Province in the north of the country. Every year, thousands of visitors travel there to take part in the ceremony. Government leaders, local residents, and tourists gather to burn incense and offer traditional food such as sticky rice and fruit. The atmosphere is serious as people express respect and gratitude for the contributions of the Hung Kings to the nation's history.",
          "In addition to the official ceremony, many cultural activities are organised during the festival. There are traditional music performances, folk games, and cooking competitions. One of the most famous performances is Xoan singing, a type of traditional folk music that originated in Phu Tho. These activities help younger generations understand more about their cultural heritage and feel proud of their national identity.",
          "Hung Kings' Commemoration Day is not only celebrated in Phu Tho Province. In many other cities and towns across Vietnam, people visit local temples to pray and remember their ancestors. Schools often organise activities to teach students about the legend of the Hung Kings and the early history of the country. Through these events, children learn about the importance of unity and respect for the past.",
          "In modern times, this holiday continues to play a significant role in Vietnamese society. It reminds people that despite regional differences, they share a common origin. The celebration strengthens national unity and encourages citizens to work together for the country's future development. For this reason, Hung Kings' Commemoration Day is not only a historical event but also a symbol of Vietnamese pride and solidarity.",
        ],
      },
      {
        id: "p2",
        label: "Reading passage 2",
        title: "Transport and delivery in Vietnam",
        paragraphs: [
          "Transport and delivery services play an important role in daily life in Vietnam. As the country develops quickly, the need for moving people and goods has increased. Today, both traditional and modern forms of transport are used across cities and rural areas.",
          "In big cities such as Hanoi and Ho Chi Minh City, motorbikes are the most common means of transport. Many people use motorbikes to go to work, school, or the market. They are convenient because they can move easily through heavy traffic. Buses are also popular, especially among students and workers who want to save money. In recent years, ride-hailing services have become more common. People can book a car or motorbike through a mobile app, which is fast and simple.",
          "For longer distances, trains, coaches, and airplanes are available. The railway system connects the north and the south of the country. Although trains are slower than planes, they are cheaper and safer for many passengers. Air travel has grown quickly because it saves time, especially for business travellers. Many airports have been improved to meet the rising number of passengers.",
          "Delivery services in Vietnam have also changed tremendously. In the past, people primarily sent letters and parcels through the post office. Now, many private delivery companies operate in cities and towns. With the growth of online shopping, the number of delivery orders has increased sharply. Customers can order clothes, food, or electronics online and receive them at home within one or two days.",
          "Motorbikes are again very important in delivery work. Delivery drivers use them to carry small packages and food. They can move quickly in busy streets and reach customers faster than larger vehicles. However, there are still some challenges. Traffic congestion, bad weather, and unclear addresses can cause delays. In rural areas, delivery may take longer because roads are narrow or in poor conditions.",
          "In general, transport and delivery systems in Vietnam are improving every year. New roads and bridges are being built, and technology is making services more efficient. Although there are still problems, the future of transport and delivery in Vietnam looks positive as the country continues to grow.",
        ],
      },
    ],
    sections: [
      {
        group: "Questions 1-3",
        instruction: "Answer the questions below. Write NO MORE THAN TWO WORDS from the passage for each answer.",
        passageId: "p1",
        questions: [
          { n: 1, kind: "fill", prompt: "On which day of the third lunar month is the holiday celebrated? ______", answers: ["tenth day", "tenth", "the tenth"] },
          { n: 2, kind: "fill", prompt: "What do people burn to show respect at the temple? ______", answers: ["burn incense", "incense"] },
          { n: 3, kind: "fill", prompt: "What type of contest is organised during the festival? ______", answers: ["cooking competitions", "cooking competition"] },
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
            prompt: "According to the second paragraph, who attends the Hung Temple during the main ceremony?",
            options: [
              { id: "A", text: "Only visitors" },
              { id: "B", text: "Soldiers and farmers" },
              { id: "C", text: "Leaders, residents, tourists" },
              { id: "D", text: "The Hung Kings" },
            ],
            answer: "C",
          },
          {
            n: 5,
            kind: "choice",
            prompt: "What is the origin of Xoan singing?",
            options: [
              { id: "A", text: "Hanoi" },
              { id: "B", text: "Phu Tho" },
              { id: "C", text: "Van Lang" },
              { id: "D", text: "The south" },
            ],
            answer: "B",
          },
          {
            n: 6,
            kind: "choice",
            prompt: "According to the fourth paragraph, what do schools set up to help students learn about the holiday?",
            options: [
              { id: "A", text: "Sports competitions" },
              { id: "B", text: "Music concerts" },
              { id: "C", text: "Travel programmes" },
              { id: "D", text: "Educational activities" },
            ],
            answer: "D",
          },
          {
            n: 7,
            kind: "choice",
            prompt: "In the last paragraph, what does the holiday promote in Vietnamese society?",
            options: [
              { id: "A", text: "Regional differences" },
              { id: "B", text: "Economic power" },
              { id: "C", text: "National solidarity" },
              { id: "D", text: "Foreign relations" },
            ],
            answer: "C",
          },
        ],
      },
      {
        group: "Questions 8-10",
        instruction: "Complete the sentences below. Write NO MORE THAN TWO WORDS from the passage for each answer.",
        passageId: "p2",
        questions: [
          { n: 8, kind: "fill", prompt: "______ are the most popular type of transport in major cities.", answers: ["motorbikes"] },
          { n: 9, kind: "fill", prompt: "People can use a ______ to book a ride.", answers: ["mobile app"] },
          { n: 10, kind: "fill", prompt: "Many airports have been renovated to meet the increasing number of ______.", answers: ["passengers"] },
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
            prompt: "Why do many passengers choose trains instead of planes?",
            options: [
              { id: "A", text: "Trains are more affordable and safer." },
              { id: "B", text: "Trains are more modern." },
              { id: "C", text: "Trains are faster." },
              { id: "D", text: "Trains have better service." },
            ],
            answer: "A",
          },
          {
            n: 12,
            kind: "choice",
            prompt: "How have delivery services changed compared to the past?",
            options: [
              { id: "A", text: "People now do not use the post office anymore." },
              { id: "B", text: "Private delivery companies now operate widely." },
              { id: "C", text: "Delivery is now available in a small number of towns." },
              { id: "D", text: "Online shopping has stabilised." },
            ],
            answer: "B",
          },
          {
            n: 13,
            kind: "choice",
            prompt: "Why are motorbikes important in delivery work?",
            options: [
              { id: "A", text: "They can carry very large vehicles." },
              { id: "B", text: "They move quickly and reach customers faster than larger vehicles." },
              { id: "C", text: "They are only used in rural areas." },
              { id: "D", text: "They never face any challenges." },
            ],
            answer: "B",
          },
          {
            n: 14,
            kind: "choice",
            prompt: "What does the writer say about the future of transport and delivery in Vietnam?",
            options: [
              { id: "A", text: "It looks positive as the country continues to grow." },
              { id: "B", text: "It will stop improving soon." },
              { id: "C", text: "It is getting worse every year." },
              { id: "D", text: "It no longer uses technology." },
            ],
            answer: "A",
          },
        ],
      },
    ],
  },
  writing: { timeAllowed: "30 phút", exercises: [] },
}

export const ifaReadingExtra: IfaTestPaper[] = [
  readingVietnam,
  readingShopping,
  readingSports,
  readingLearning,
  readingTransport,
  readingHealth,
]
