import type { ListeningPaper } from "./ifa-listening"

/**
 * Extra practice papers that mirror the IFA Mock structure exactly:
 *   Section 1 — 10 note/form gaps (fill)
 *   Section 2 — Q11-15 multiple choice (A/B/C) + Q16-20 sentence/notes (fill)
 * Topics are chosen from the IFA course (Transport, Health). Questions are
 * adapted to the Mock layout; answers stay faithful to the cited recording.
 */
export const similarListeningPapers: ListeningPaper[] = [
  {
    id: "cambridge-12-test-1",
    title: "CAMBRIDGE 12 · TEST 1 — Luyện nghe tương tự",
    hidden: false,
    source: "https://simplyielts.com/cambridge-ielts-12-listening-test-1-answers-explanation/",
    sections: [
      {
        title: "Section 1 · Family Excursions (du lịch / đi lại)",
        audio: "audio/daily/ifa/cambridge-12-test-1/part-1.mp3",
        groups: [{
          title: "Questions 1-10",
          instruction: "Complete the notes. Write ONE WORD AND/OR A NUMBER for each answer.",
          notes: {
            title: "Family Excursions",
            sections: [
              { heading: "Cruise on a lake", rows: [
                { before: "Can take photos of the ", question: 1, after: " that surround the lake" },
              ] },
              { heading: "Farm visit", rows: [
                { before: "A 40-minute ride on a ", question: 2 },
                { before: "Walk in the farm's ", question: 3, after: " by the lake" },
                { before: "At extra cost: ", question: 4 },
              ] },
              { heading: "Cycling trips", rows: [
                { before: "A ", question: 5, after: " is provided" },
                { before: "Only for cyclists with some ", question: 6 },
                { before: "Bikes hired from ", question: 7, after: " near the terminal" },
                { before: "Cyclists also need a ", question: 8, after: " (can be hired)" },
                { before: "There are no ", question: 9, after: " or accommodation in the area" },
              ] },
              { heading: "Cost", rows: [
                { before: "Total for the whole family: $", question: 10 },
              ] },
            ],
          },
          questions: [
            { n: 1, kind: "fill", prompt: "Photos of the ______ around the lake.", answers: ["mountains"] },
            { n: 2, kind: "fill", prompt: "A 40-minute ride on a ______.", answers: ["horse"] },
            { n: 3, kind: "fill", prompt: "Walk in the farm's ______.", answers: ["gardens", "garden"] },
            { n: 4, kind: "fill", prompt: "At extra cost: ______.", answers: ["lunch"] },
            { n: 5, kind: "fill", prompt: "A ______ is provided.", answers: ["map"] },
            { n: 6, kind: "fill", prompt: "Cyclists need some ______.", answers: ["experience"] },
            { n: 7, kind: "fill", prompt: "Bikes hired from ______.", answers: ["Ratchesons"] },
            { n: 8, kind: "fill", prompt: "Also need a ______.", answers: ["helmet"] },
            { n: 9, kind: "fill", prompt: "No ______ in the area.", answers: ["shops"] },
            { n: 10, kind: "fill", prompt: "Total for the family: $______.", answers: ["267"] },
          ],
        }],
      },
      {
        title: "Section 2 · Restaurant Staff Induction (công việc)",
        audio: "audio/daily/ifa/cambridge-12-test-1/part-2.mp3",
        groups: [
          {
            title: "Questions 11-15",
            instruction: "Choose the correct letter, A, B or C.",
            context: "Talk to new kitchen assistants",
            questions: [
              { n: 11, kind: "choice", prompt: "What do most people like about the job of kitchen assistant?", options: [{ id: "A", text: "the variety of work" }, { id: "B", text: "the friendly atmosphere" }, { id: "C", text: "the opportunities for promotion" }], answer: "A" },
              { n: 12, kind: "choice", prompt: "The manager is concerned about some of the new staff's", options: [{ id: "A", text: "jewellery." }, { id: "B", text: "hair styles." }, { id: "C", text: "shoes." }], answer: "A" },
              { n: 13, kind: "choice", prompt: "The day is likely to be busy because", options: [{ id: "A", text: "it is a public holiday." }, { id: "B", text: "the head chef is absent." }, { id: "C", text: "the restaurant is almost fully booked." }], answer: "C" },
              { n: 14, kind: "choice", prompt: "Only staff aged 18 or older may use", options: [{ id: "A", text: "the waste disposal unit." }, { id: "B", text: "the electric mixer." }, { id: "C", text: "the meat slicer." }], answer: "C" },
              { n: 15, kind: "choice", prompt: "Which thing can make the job stressful?", options: [{ id: "A", text: "following orders immediately" }, { id: "B", text: "the kitchen getting very hot" }, { id: "C", text: "doing overtime" }], answer: "A" },
            ],
          },
          {
            title: "Questions 16-20 · Staff responsibilities",
            instruction: "Complete the sentences. Write ONE OR TWO WORDS for each answer.",
            notes: {
              title: "Staff Responsibilities",
              sections: [{ rows: [
                { before: "Another stressful part of the job is the ", question: 16, after: " demands." },
                { before: "Joy Parkins is responsible for ", question: 17 },
                { before: "David Field is responsible for ", question: 18 },
                { before: "Dexter Wills is responsible for ", question: 19 },
                { before: "Mike Smith is responsible for ", question: 20 },
              ] }],
            },
            questions: [
              { n: 16, kind: "fill", prompt: "The job is also ______ demanding.", answers: ["physically", "physical"] },
              { n: 17, kind: "fill", prompt: "Joy Parkins is responsible for ______.", answers: ["timetables", "timetable"] },
              { n: 18, kind: "fill", prompt: "David Field is responsible for ______.", answers: ["first aid"] },
              { n: 19, kind: "fill", prompt: "Dexter Wills is responsible for ______.", answers: ["breakages", "breakage"] },
              { n: 20, kind: "fill", prompt: "Mike Smith is responsible for ______.", answers: ["food stocks", "food stock"] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "cambridge-10-test-2",
    title: "CAMBRIDGE 10 · TEST 2 — Luyện nghe tương tự",
    hidden: false,
    source: "https://simplyielts.com/cambridge-ielts-10-listening-test-2-answers-explanation/",
    sections: [
      {
        title: "Section 1 · Town Centre Survey (thành phố / đi lại)",
        audio: "audio/daily/ifa/cambridge-10-test-2/part-1.mp3",
        groups: [{
          title: "Questions 1-10",
          instruction: "Complete the notes. Write ONE WORD AND/OR A NUMBER for each answer.",
          notes: {
            title: "Transport Survey",
            sections: [
              { heading: "Personal Details", rows: [
                { before: "Name: Luisa ", question: 1 },
                { before: "Address: ", question: 2, after: " White Stone Rd (Bradfield)" },
                { before: "Postcode: ", question: 3 },
                { before: "Occupation: ", question: 4 },
                { before: "Reason for visit: to go to the ", question: 5 },
              ] },
              { heading: "Suggestions for improvement", rows: [
                { before: "Better ", question: 6 },
                { before: "More frequent ", question: 7 },
              ] },
              { heading: "To encourage cycling to work", rows: [
                { before: "Have ", question: 8, after: " parking places for bicycles" },
                { before: "Being able to use a ", question: 9, after: " at work" },
                { before: "Cycling ", question: 10, after: " on busy roads" },
              ] },
            ],
          },
          questions: [
            { n: 1, kind: "fill", prompt: "Name: Luisa ______.", answers: ["Hardie"] },
            { n: 2, kind: "fill", prompt: "Address: ______ White Stone Rd.", answers: ["19"] },
            { n: 3, kind: "fill", prompt: "Postcode: ______.", answers: ["GT8 2LC", "GT82LC"] },
            { n: 4, kind: "fill", prompt: "Occupation: ______.", answers: ["hairdresser"] },
            { n: 5, kind: "fill", prompt: "Reason for visit: the ______.", answers: ["dentist", "dentist's"] },
            { n: 6, kind: "fill", prompt: "Better ______.", answers: ["lighting"] },
            { n: 7, kind: "fill", prompt: "More frequent ______.", answers: ["trains"] },
            { n: 8, kind: "fill", prompt: "Have ______ parking for bikes.", answers: ["safe"] },
            { n: 9, kind: "fill", prompt: "Use a ______ at work.", answers: ["shower"] },
            { n: 10, kind: "fill", prompt: "Cycling ______ on busy roads.", answers: ["training"] },
          ],
        }],
      },
      {
        title: "Section 2 · City Centre Developments (thành phố)",
        audio: "audio/daily/ifa/cambridge-10-test-2/part-2.mp3",
        groups: [
          {
            title: "Questions 11-15",
            instruction: "Choose the correct letter, A, B or C.",
            context: "New city developments",
            questions: [
              { n: 11, kind: "choice", prompt: "The idea for the two new developments came from", options: [{ id: "A", text: "local people." }, { id: "B", text: "the City Council." }, { id: "C", text: "the SWRDC." }], answer: "A" },
              { n: 12, kind: "choice", prompt: "What is unusual about Brackenside pool?", options: [{ id: "A", text: "its architectural style" }, { id: "B", text: "its heating system" }, { id: "C", text: "its method of water treatment" }], answer: "C" },
              { n: 13, kind: "choice", prompt: "Local newspapers have raised worries about", options: [{ id: "A", text: "the late opening date." }, { id: "B", text: "the cost of the project." }, { id: "C", text: "the size of the facilities." }], answer: "C" },
              { n: 14, kind: "choice", prompt: "What decision has not yet been made about the pool?", options: [{ id: "A", text: "whose statue will be at the door" }, { id: "B", text: "the exact opening times" }, { id: "C", text: "who will open it" }], answer: "A" },
              { n: 15, kind: "choice", prompt: "In the playground, which feature represents Asia?", options: [{ id: "A", text: "local animals" }, { id: "B", text: "mountains" }, { id: "C", text: "jewels" }], answer: "A" },
            ],
          },
          {
            title: "Questions 16-20 · Playground features",
            instruction: "Complete the sentences. Write ONE OR TWO WORDS for each answer.",
            notes: {
              title: "Playground: areas of the world",
              sections: [{ rows: [
                { before: "Antarctica is represented by ", question: 16 },
                { before: "South America is represented by ", question: 17 },
                { before: "North America is represented by ", question: 18 },
                { before: "Europe is represented by ancient ", question: 19 },
                { before: "Africa is represented by ", question: 20 },
              ] }],
            },
            questions: [
              { n: 16, kind: "fill", prompt: "Antarctica: ______.", answers: ["mountains"] },
              { n: 17, kind: "fill", prompt: "South America: ______.", answers: ["jewels"] },
              { n: 18, kind: "fill", prompt: "North America: ______.", answers: ["space travel"] },
              { n: 19, kind: "fill", prompt: "Europe: ancient ______.", answers: ["forts", "fort"] },
              { n: 20, kind: "fill", prompt: "Africa: ______.", answers: ["waterways", "waterway"] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "cambridge-10-test-4",
    title: "CAMBRIDGE 10 · TEST 4 — Luyện nghe tương tự",
    hidden: false,
    source: "https://simplyielts.com/cambridge-ielts-10-listening-test-4-answers-explanation/",
    sections: [
      {
        title: "Section 1 · Ordering from a Builder (mua sắm / đặt hàng)",
        audio: "audio/daily/ifa/cambridge-10-test-4/part-1.mp3",
        groups: [{
          title: "Questions 1-10",
          instruction: "Complete the notes. Write ONE WORD ONLY for each answer.",
          notes: {
            title: "Thorndyke's Builders",
            sections: [
              { heading: "Customer Details", rows: [
                { before: "Name: Edith ", question: 1 },
                { before: "Address: Flat 4, ", question: 2, after: " Park Flats" },
                { before: "Behind the ", question: 3 },
                { before: "Best time to contact: during the ", question: 4 },
                { before: "Park opposite the entrance next to the ", question: 5 },
                { before: "Needs a full quote with jobs and the ", question: 6 },
              ] },
              { heading: "Work to be done", rows: [
                { before: "Kitchen: replace the ", question: 7, after: " in the door" },
                { before: "Paint the wall above the ", question: 8 },
                { before: "Strip paint about one ", question: 9, after: " in advance" },
                { before: "Garden: one ", question: 10, after: " needs replacing" },
              ] },
            ],
          },
          questions: [
            { n: 1, kind: "fill", prompt: "Name: Edith ______.", answers: ["Pargetter"] },
            { n: 2, kind: "fill", prompt: "Flat 4, ______ Park Flats.", answers: ["East"] },
            { n: 3, kind: "fill", prompt: "Behind the ______.", answers: ["library"] },
            { n: 4, kind: "fill", prompt: "Contact during the ______.", answers: ["morning", "mornings"] },
            { n: 5, kind: "fill", prompt: "Park next to the ______.", answers: ["postbox"] },
            { n: 6, kind: "fill", prompt: "Quote with jobs and the ______.", answers: ["prices", "price"] },
            { n: 7, kind: "fill", prompt: "Replace the ______ in the door.", answers: ["glass"] },
            { n: 8, kind: "fill", prompt: "Paint wall above the ______.", answers: ["cooker"] },
            { n: 9, kind: "fill", prompt: "Strip paint one ______ in advance.", answers: ["week"] },
            { n: 10, kind: "fill", prompt: "Garden: one ______ needs replacing.", answers: ["fence"] },
          ],
        }],
      },
      {
        title: "Section 2 · Manham Port (địa phương / du lịch)",
        audio: "audio/daily/ifa/cambridge-10-test-4/part-2.mp3",
        groups: [
          {
            title: "Questions 11-15",
            instruction: "Choose the correct letter, A, B or C.",
            context: "Manham Port",
            questions: [
              { n: 11, kind: "choice", prompt: "Why did a port originally develop at Manham?", options: [{ id: "A", text: "It was safe from enemy attack." }, { id: "B", text: "It was convenient for river transport." }, { id: "C", text: "It had a good position on the sea coast." }], answer: "B" },
              { n: 12, kind: "choice", prompt: "What caused Manham's sudden expansion during the Industrial Revolution?", options: [{ id: "A", text: "the improvement in mining techniques" }, { id: "B", text: "the increase in demand for metals" }, { id: "C", text: "the discovery of tin in the area" }], answer: "B" },
              { n: 13, kind: "choice", prompt: "Why were rocks sent away from Manham to be processed?", options: [{ id: "A", text: "shortage of fuel" }, { id: "B", text: "poor transport systems" }, { id: "C", text: "lack of local skills" }], answer: "A" },
              { n: 14, kind: "choice", prompt: "What happened when the port declined?", options: [{ id: "A", text: "The workers went away." }, { id: "B", text: "Traditional skills were lost." }, { id: "C", text: "Buildings were used for new purposes." }], answer: "A" },
              { n: 15, kind: "choice", prompt: "What did the Manham Trust hope to do?", options: [{ id: "A", text: "discover the original port's location" }, { id: "B", text: "provide jobs for the unemployed" }, { id: "C", text: "rebuild the port complex" }], answer: "C" },
            ],
          },
          {
            title: "Questions 16-20 · Tourist attractions",
            instruction: "Complete the sentences. Write NO MORE THAN TWO WORDS for each answer.",
            notes: {
              title: "Tourist Attractions in Manham",
              sections: [{ rows: [
                { before: "Copper mine: special miners' ", question: 16, after: " take visitors inside." },
                { before: "The mine is ", question: 17, after: " and enclosed." },
                { before: "Village school: exhibition of old ", question: 18 },
                { before: "A ", question: 19, after: " of the school is recommended." },
                { before: "On 'The George', children should not use the ", question: 20 },
              ] }],
            },
            questions: [
              { n: 16, kind: "fill", prompt: "Miners' ______ take visitors inside.", answers: ["trains", "train"] },
              { n: 17, kind: "fill", prompt: "The mine is ______ and enclosed.", answers: ["dark"] },
              { n: 18, kind: "fill", prompt: "Exhibition of old ______.", answers: ["games", "game"] },
              { n: 19, kind: "fill", prompt: "A ______ is recommended.", answers: ["guided tour"] },
              { n: 20, kind: "fill", prompt: "Children should not use the ______.", answers: ["ladder", "ladders"] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "cambridge-15-test-1",
    title: "CAMBRIDGE 15 · TEST 1 — Luyện nghe tương tự",
    hidden: false,
    source: "https://simplyielts.com/cambridge-ielts-15-listening-test-1-answers-explanation/",
    sections: [
      {
        title: "Section 1 · Recruitment Agency (công việc)",
        audio: "audio/daily/ifa/cambridge-15-test-1/part-1.mp3",
        groups: [{
          title: "Questions 1-10",
          instruction: "Complete the notes. Write ONE WORD AND/OR A NUMBER for each answer.",
          notes: {
            title: "Bankside Recruitment Agency",
            sections: [
              { heading: "Agent", rows: [
                { before: "Name of agent: Becky ", question: 1 },
                { before: "Best to call her in the ", question: 2 },
              ] },
              { heading: "Typical jobs", rows: [
                { before: "Must have good ", question: 3, after: " skills" },
                { before: "Jobs usually for at least one ", question: 4 },
                { before: "Pay is usually £", question: 5, after: " per hour" },
              ] },
              { heading: "Registration", rows: [
                { before: "Wear a ", question: 6, after: " to the interview" },
                { before: "Bring your ", question: 7, after: " to the interview" },
                { before: "They ask about each applicant's ", question: 8 },
              ] },
              { heading: "Advantages", rows: [
                { before: "The ", question: 9, after: " at interview will benefit you" },
                { before: "Less ", question: 10, after: " is involved in applying" },
              ] },
            ],
          },
          questions: [
            { n: 1, kind: "fill", prompt: "Agent: Becky ______.", answers: ["Jamieson"] },
            { n: 2, kind: "fill", prompt: "Call her in the ______.", answers: ["afternoon"] },
            { n: 3, kind: "fill", prompt: "Good ______ skills.", answers: ["communication"] },
            { n: 4, kind: "fill", prompt: "Jobs for at least one ______.", answers: ["week"] },
            { n: 5, kind: "fill", prompt: "Pay £______ per hour.", answers: ["10", "ten"] },
            { n: 6, kind: "fill", prompt: "Wear a ______.", answers: ["suit"] },
            { n: 7, kind: "fill", prompt: "Bring your ______.", answers: ["passport"] },
            { n: 8, kind: "fill", prompt: "They ask about your ______.", answers: ["personality"] },
            { n: 9, kind: "fill", prompt: "The ______ at interview helps.", answers: ["feedback"] },
            { n: 10, kind: "fill", prompt: "Less ______ is involved.", answers: ["time"] },
          ],
        }],
      },
      {
        title: "Section 2 · Island Holidays (đi lại / du lịch)",
        audio: "audio/daily/ifa/cambridge-15-test-1/part-2.mp3",
        groups: [
          {
            title: "Questions 11-15",
            instruction: "Choose the correct letter, A, B or C.",
            context: "Matthews Island Holidays",
            questions: [
              { n: 11, kind: "choice", prompt: "According to the speaker, the company", options: [{ id: "A", text: "has been in business longer than most competitors." }, { id: "B", text: "arranges holidays to more destinations than competitors." }, { id: "C", text: "has more customers than its competitors." }], answer: "A" },
              { n: 12, kind: "choice", prompt: "Where can customers meet the tour manager before travelling?", options: [{ id: "A", text: "Liverpool" }, { id: "B", text: "Heysham" }, { id: "C", text: "Luton" }], answer: "B" },
              { n: 13, kind: "choice", prompt: "How many lunches are included in the price?", options: [{ id: "A", text: "three" }, { id: "B", text: "four" }, { id: "C", text: "five" }], answer: "A" },
              { n: 14, kind: "choice", prompt: "Customers have to pay extra for", options: [{ id: "A", text: "guaranteeing a larger room." }, { id: "B", text: "booking at short notice." }, { id: "C", text: "transferring to another date." }], answer: "C" },
              { n: 15, kind: "choice", prompt: "On Day 1, the hotel dining room has a view of the", options: [{ id: "A", text: "river" }, { id: "B", text: "mountains" }, { id: "C", text: "harbour" }], answer: "A" },
            ],
          },
          {
            title: "Questions 16-20 · Holiday timetable",
            instruction: "Complete the sentences. Write ONE WORD AND/OR A NUMBER for each answer.",
            notes: {
              title: "Isle of Man Timetable",
              sections: [{ rows: [
                { before: "Tynwald may have been founded in ", question: 16, after: ", not 979." },
                { before: "On Day 3, take a train to the ", question: 17, after: " of Snaefell." },
                { before: "On the free day, the company provides a ", question: 18, after: " for transport and sites." },
                { before: "On Day 5, take the ", question: 19, after: " railway to Port Erin." },
                { before: "Castletown is the former ", question: 20, after: " and has an old castle." },
              ] }],
            },
            questions: [
              { n: 16, kind: "fill", prompt: "Tynwald founded in ______, not 979.", answers: ["1422"] },
              { n: 17, kind: "fill", prompt: "Train to the ______ of Snaefell.", answers: ["top"] },
              { n: 18, kind: "fill", prompt: "Company provides a ______.", answers: ["pass"] },
              { n: 19, kind: "fill", prompt: "Take the ______ railway.", answers: ["steam"] },
              { n: 20, kind: "fill", prompt: "Castletown is the former ______.", answers: ["capital"] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "cambridge-10-test-1",
    title: "CAMBRIDGE 10 · TEST 1 — Luyện nghe tương tự",
    hidden: false,
    source: "https://simplyielts.com/cambridge-ielts-10-listening-test-1-answers-explanation/",
    sections: [
      {
        title: "Section 1 · Self-Drive Tours (đi lại / du lịch)",
        audio: "audio/daily/ifa/cambridge-10-test-1/part-1.mp3",
        groups: [{
          title: "Questions 1-10",
          instruction: "Complete the notes. Write ONE WORD AND/OR A NUMBER for each answer.",
          notes: {
            title: "Self-Drive Tours in the USA",
            sections: [
              { heading: "Customer Details", rows: [
                { before: "Name: Andrea Brown" },
                { before: "Address: 24 ", question: 1, after: " Road" },
                { before: "Heard about the company from a ", question: 2 },
              ] },
              { heading: "Trip One", rows: [
                { before: "In Los Angeles, wants to visit some ", question: 3, after: " parks with the children" },
                { before: "In Yosemite Park, wants to stay in a lodge, not a ", question: 4 },
              ] },
              { heading: "Trip Two", rows: [
                { before: "Wants to see the ", question: 5, after: " on the way to Cambria" },
                { before: "At San Diego, wants to spend time on the ", question: 6 },
              ] },
              { heading: "Trip Details", rows: [
                { before: "Trip One distance: ", question: 7, after: " km" },
                { before: "Trip One includes accommodation, car and one ", question: 8 },
                { before: "Trip Two price per person: £", question: 9 },
                { before: "Trip Two includes accommodation, car and ", question: 10 },
              ] },
            ],
          },
          questions: [
            { n: 1, kind: "fill", prompt: "Address: 24 ______ Road.", answers: ["Ardleigh"] },
            { n: 2, kind: "fill", prompt: "Heard about the company from a ______.", answers: ["newspaper"] },
            { n: 3, kind: "fill", prompt: "Wants to visit some ______ parks.", answers: ["theme"] },
            { n: 4, kind: "fill", prompt: "In Yosemite, a lodge not a ______.", answers: ["tent"] },
            { n: 5, kind: "fill", prompt: "Wants to see the ______ on the way to Cambria.", answers: ["castle"] },
            { n: 6, kind: "fill", prompt: "At San Diego, time on the ______.", answers: ["beach", "beaches"] },
            { n: 7, kind: "fill", prompt: "Trip One distance: ______ km.", answers: ["2020"] },
            { n: 8, kind: "fill", prompt: "Trip One includes one ______.", answers: ["flight"] },
            { n: 9, kind: "fill", prompt: "Trip Two price: £______.", answers: ["429"] },
            { n: 10, kind: "fill", prompt: "Trip Two includes ______.", answers: ["dinner"] },
          ],
        }],
      },
      {
        title: "Section 2 · Leisure Club (sức khỏe / thể thao)",
        audio: "audio/daily/ifa/cambridge-10-test-1/part-2.mp3",
        groups: [
          {
            title: "Questions 11-15",
            instruction: "Choose the correct letter, A, B or C.",
            context: "LP Leisure Club",
            questions: [
              { n: 11, kind: "choice", prompt: "Which facility has recently been improved?", options: [{ id: "A", text: "the gym" }, { id: "B", text: "the outdoor pool" }, { id: "C", text: "the tennis courts" }], answer: "A" },
              { n: 12, kind: "choice", prompt: "Which other facility has recently been improved?", options: [{ id: "A", text: "the outdoor pool" }, { id: "B", text: "the indoor pool" }, { id: "C", text: "the car park" }], answer: "B" },
              { n: 13, kind: "choice", prompt: "Before using the equipment, what will be explained to new members?", options: [{ id: "A", text: "the safety rules" }, { id: "B", text: "the opening hours" }, { id: "C", text: "the price list" }], answer: "A" },
              { n: 14, kind: "choice", prompt: "What are Gold members given?", options: [{ id: "A", text: "a free personal trainer" }, { id: "B", text: "free entry to all LP clubs" }, { id: "C", text: "a discount on food" }], answer: "B" },
              { n: 15, kind: "choice", prompt: "When do Premier members get priority?", options: [{ id: "A", text: "at the weekend" }, { id: "B", text: "during peak hours" }, { id: "C", text: "on public holidays" }], answer: "B" },
            ],
          },
          {
            title: "Questions 16-20 · Joining the club",
            instruction: "Complete the sentences. Write NO MORE THAN TWO WORDS for each answer.",
            notes: {
              title: "Joining the Leisure Club",
              sections: [{ rows: [
                { before: "New members should describe any ", question: 16, after: " they have." },
                { before: "Every new member receives a six-week ", question: 17 },
                { before: "There is a compulsory £90 ", question: 18, after: " fee." },
                { before: "Premier members can bring some ", question: 19, after: " each month." },
                { before: "Members should always take their ", question: 20, after: " with them." },
              ] }],
            },
            questions: [
              { n: 16, kind: "fill", prompt: "New members should describe any ______ they have.", answers: ["health problems", "health problem"] },
              { n: 17, kind: "fill", prompt: "Every new member receives a six-week ______.", answers: ["plan"] },
              { n: 18, kind: "fill", prompt: "There is a compulsory £90 ______ fee.", answers: ["joining"] },
              { n: 19, kind: "fill", prompt: "Premier members can bring some ______ each month.", answers: ["guests", "guest"] },
              { n: 20, kind: "fill", prompt: "Members should always take their ______ with them.", answers: ["photo card", "photo cards"] },
            ],
          },
        ],
      },
    ],
  },
]
