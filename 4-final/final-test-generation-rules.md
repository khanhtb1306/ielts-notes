# Final Grammar Test Generation Rules

This document defines the standard rules for generating additional Final Grammar Test papers for the Pre-IELTS/Foundation IELTS review app.

The rules are based on the two existing source papers:

- Paper 01: Lesson 19 Mock Test.
- Paper 02: Final Mock Test from the teacher-provided images.

The purpose is to generate 10 more practice papers that feel like the original tests, keep the same difficulty level, and include a complete answer key.

## Global Test Format

Each generated paper must follow these global rules:

| Item | Rule |
| --- | --- |
| Test title | `GRAMMAR TEST` |
| Total answer points | 50 |
| Time allowed | 45 minutes |
| Number of sections | 4 |
| Interface language | English |
| Learner level | Pre-IELTS / Foundation IELTS |
| English variety | British English where examples are self-written |
| Answer key | Required for every question |
| Explanations | Optional, but answers must be machine-checkable |

The generated papers must not look like random grammar drills. They must look like teacher-made mock tests with clear sections and stable instructions.

## Learner-Centric Rules

Every generated question must be designed for this learner and this course stage, not for a generic grammar app.

### Core Principle

Generated questions should recycle what the learner has already studied. A question is good only if it helps the learner recognise and fix a course-relevant grammar point.

| Rule | Requirement |
| --- | --- |
| Reuse grammar from previous lessons | Use only grammar from the Foundation grammar notes, Daily lessons, and Final Review packet. |
| Reuse teacher-slide vocabulary | Prefer words and topics from the speaking sheets, vocab bank, and final suggested vocab. |
| Reuse studied speaking topics | Put grammar questions inside familiar contexts such as job, family, appearance, house, weekend, trip, restaurant, hometown, and health. |
| Avoid unnecessary vocabulary | Do not introduce hard, academic, or unfamiliar words just to make the question look more advanced. |
| Reinforce common learner mistakes | Actively test the errors listed in the course review: `s/es`, `did + V0`, `many/much`, `a/an/the`, `in/on/at`, and modal form errors. |
| Keep current course difficulty | Stay at Pre-IELTS / A1-A2+ grammar control. Do not drift into intermediate IELTS grammar. |

### Course Knowledge Boundary

The generated tests must stay inside these content sources:

| Source | Allowed Use |
| --- | --- |
| Grammar notes `2-notes/grammar/*.md` | Main grammar rules, examples, and common traps. |
| Final Grammar Atlas `2-notes/grammar/10-final-grammar-atlas.md` | Canonical final-review grammar map. |
| Teacher final packet `4-final/google-doc-pre-course/tong-hop-kien-thuc-khoa-pre.md` | Highest-priority reference for what belongs in the final test. |
| Daily lessons `3-daily/lessons/lesson-01` to `lesson-16` | Primary source for familiar vocabulary, real learner-facing sentence patterns, reusable questions, and trusted answer keys. |
| Speaking notes `2-notes/speaking/*.md` | Familiar topics, situations, and vocabulary contexts. |
| `2-notes/enrich/meta.json` vocab bank | Preferred vocabulary for self-written questions. |

Lessons/topics in the final packet that extend beyond Lesson 16, such as adverbs, conjunctions, hometown, and health, are allowed only because they are explicitly included in the Final Review material. Do not add other new grammar areas.

### Grammar Coverage From The Course

Generated papers should recycle these grammar areas only:

| Course Area | Must Be Tested In | Typical Traps To Reinforce |
| --- | --- | --- |
| Word classes | Part I | confusing noun/verb/adjective/adverb by word form instead of sentence use |
| Nouns | Part II | plural forms, irregular plurals, singular countable nouns needing a determiner |
| Quantifiers | Part II | `much/many`, `a few/a little`, `some/any`, uncountable nouns |
| Pronouns | Part II | subject/object/possessive/reflexive pronouns, `it/they` agreement |
| Adjectives & adverbs | Part I, Part II | adjective vs adverb, `-ed` vs `-ing`, adjective position/order |
| Articles & determiners | Part II, Part III | first mention vs second mention, `a/an`, `the`, no article |
| Prepositions | Part II | `in/on/at` for time/place, no preposition with `next/last/yesterday/tomorrow` |
| Present simple | Part II, Part IV | he/she/it `s/es`, routines, facts, stative verbs |
| Present continuous | Part II, Part IV | actions now, temporary situations, future arrangements, `be + always + V-ing` |
| Past simple | Part II, Part IV | V2, irregular verbs, `did/didn't + V0` |
| Past continuous | Part II, Part IV | `was/were + V-ing`, `when/while`, interrupted actions |
| Future simple | Part II, Part IV | `will + V0`, prediction/opinion/instant decision |
| Be going to | Part II, Part IV | `am/is/are going to + V0`, future plan or evidence-based prediction |
| Modal verbs | Part II | `can/could/should/must/mustn't/have to`, no `to` after modal |
| Conjunctions | Part II | `and/but/or/so/because`, simple logical linking |

### Out-Of-Scope Grammar

Do not generate questions whose main answer depends on these areas:

| Banned Area | Reason |
| --- | --- |
| Present perfect / past perfect / future perfect | Not part of the core final grammar map. |
| Passive voice | Too advanced for this current final test. |
| Conditionals beyond simple `if` speaking frames | Not tested in the two source papers. |
| Relative clauses | Not needed for this stage. |
| Reported speech | Outside the current grammar scope. |
| Gerunds vs infinitives as a main grammar test | Too broad unless copied from daily source. |
| Comparatives/superlatives as the main target | Use only incidentally unless teacher source requires it. |
| Advanced IELTS academic vocabulary | The test should check grammar, not dictionary knowledge. |

### Preferred Speaking Topic Contexts

Use familiar learner contexts from the speaking notes and final speaking bank. This makes the grammar practice useful for both the grammar test and speaking review.

| Topic Context | Useful Vocabulary / Frames | Best Grammar To Recycle |
| --- | --- | --- |
| Self / name / age | name, spell, birthday, years old | present simple, prepositions of time |
| Work / study / job | student, dream job, teacher, work with kids, hard work, long hours | articles, nouns, present simple, `want to become` |
| Family | parents, younger brother, elder sister, siblings, nuclear family | nouns, pronouns, `there is/are`, present simple |
| Appearance | good-looking, average-looking, slim, well-built, straight hair, curly hair, glasses | adjectives, adjective order, possessive determiners |
| Personality | neat, organised, easy-going, sociable, generous, shy, serious | adjectives, adverbs, present simple |
| House / room | living room, kitchen, bedroom, wardrobe, next to, in the middle of | prepositions, articles, `there is/are` |
| Daily routine / time | get up, go to school, have breakfast, come home, go to bed | present simple, adverbs of frequency, `in/on/at` |
| Weekend / hobbies | go shopping, go to the cinema, go for coffee, work out, hang out with friends | present simple, adverbs, articles, conjunctions |
| Trip / travelling | travel, trip, sightseeing, local food, scenery, crowded, wonderful | past simple, past continuous, future `be going to` |
| Food / restaurant | seafood restaurant, main dish, dessert, tasty, book a table, service | articles, past simple, adjectives |
| Hometown | born and raised, peaceful, crowded, fresh air, safe place to live | present simple, articles, prepositions |
| Health / illness | healthy lifestyle, fruit and vegetables, exercise, headache, toothache, cold | modal `should`, present simple, quantifiers |
| Shopping | clothes shop, bookshop, shopping mall, reasonable price, tiring | articles, adjectives, present simple |

### Topic Rotation For Part III And Part IV

Part III and Part IV must not reuse the same generic context in every generated paper. Across the 10 generated papers, rotate familiar speaking topics so the learner reviews grammar and topic vocabulary at the same time.

| Generated Paper | Preferred Part III Context | Preferred Part IV Context |
|---|---|---|
| Mã đề 01 | Weekend / beach picnic | Daily routine + trip |
| Mã đề 02 | Hometown / park visit | House chores + supermarket dialogue |
| Mã đề 03 | Restaurant / family meal | Restaurant + past trip |
| Mã đề 04 | Shopping / cinema | Shopping + future plan |
| Mã đề 05 | Trip / museum or old city | Health + advice/future plan |
| Mã đề 06 | House / favourite room | Family routine + interrupted action |
| Mã đề 07 | School / class event | School timetable + homework dialogue |
| Mã đề 08 | Health / sports day | Health routine + doctor/pharmacy context |
| Mã đề 09 | Food / cooking at home | Cooking + restaurant arrangement |
| Mã đề 10 | Hometown / sightseeing | Hometown + future travel plan |

Rules for topic rotation:

- Reuse vocabulary from speaking notes, Daily lessons, and the meta vocab bank.
- Keep the grammar target more important than the story; the story is only the familiar context.
- Avoid using beach/museum/zoo in every paper unless the source daily item requires it.
- Part III should feel like a short speaking-topic paragraph with article blanks.
- Part IV should feel like realistic learner sentences or dialogues, not 13 unrelated tense drills.

### Vocabulary Control Rules

Use simple, familiar words unless the word is already in the notes, daily lesson, final packet, or speaking sheets.

Preferred vocabulary includes:

| Domain | Preferred Words / Phrases |
| --- | --- |
| Daily life | get up, have breakfast, go to school, come home, go to bed, phone a friend |
| Hobbies | films, books, music, games, sports, badminton, go shopping, go to the cinema |
| Family | parents, brother, sister, siblings, father, mother, family |
| House | bedroom, kitchen, living room, bathroom, wardrobe, wall, table, chair |
| Food | fruit, vegetables, seafood, main dish, dessert, soup, fresh, tasty |
| Travel | beach, trip, local food, sightseeing, car, bus, train, hotel |
| Health | headache, toothache, cold, fever, exercise, healthy diet, water |
| Appearance/personality | tall, short, slim, well-built, friendly, generous, shy, neat |

Avoid these unless copied from source data and necessary:

| Avoid | Better Choice |
| --- | --- |
| academic words like `phenomenon`, `infrastructure`, `sustainable` | simple daily nouns |
| rare animal/place names | zoo, beach, park, museum |
| business/legal/science vocabulary | school, job, family, house, restaurant contexts |
| idioms and slang | simple spoken phrases from the notes |

### Common Learner Mistake Targets

Each generated paper must include multiple questions that target the learner's recurring mistakes from the review notes.

| Mistake | Minimum Per Paper | Example Wrong Form | Correct Target |
| --- | --- | --- | --- |
| Missing `s/es` with he/she/it | 2 | `He walk to school.` | `He walks to school.` |
| Wrong verb after `did/didn't` | 1 | `Did you went?` | `Did you go?` |
| `many/much` confusion | 1 | `many money` | `much money` |
| `a few/a little` confusion | 1 | `a few water` | `a little water` |
| Wrong article | 3 | `I saw elephant.` | `I saw an elephant.` |
| Overusing article with plural/general nouns | 1 | `I like the cats.` for general cats | `I like cats.` |
| `in/on/at` confusion | 1 | `in Monday`, `on 7 o'clock` | `on Monday`, `at 7 o'clock` |
| Modal form error | 1 in every 2 papers | `she cans`, `can to go` | `she can`, `can go` |
| Adjective/adverb confusion | 1 | `He runs quick.` | `He runs quickly.` |

These mistake targets can appear in Part II or Part IV. Article mistakes should appear mainly in Part III.

### Source Reuse Policy

When writing a new question, choose the source in this order:

1. Search the Daily lesson questions first for familiar vocabulary, sentence patterns, and already-graded grammar items.
2. If a Daily question already matches the final-test grammar point, difficulty, and format, reuse it directly with its existing correct answer.
3. If a Daily question is useful but the format is not right, adapt only the surface format while keeping the same grammar target and answer logic.
4. Use a grammar pattern from `Final Grammar Atlas` or the teacher final packet to confirm that the item belongs in the final test.
5. Use vocabulary or topic frames from speaking notes when the Daily pool does not give enough natural contexts.
6. Generate a new sentence only after the grammar point, vocabulary domain, and target mistake are clear.

Do not generate a sentence first and then guess the grammar point afterwards.

### Daily Question Reuse Rules

Daily data is not just a backup pool. It is the best evidence of what vocabulary and grammar the learner has already seen.

| Daily Item Type | Reuse Rule |
| --- | --- |
| Existing grammar MCQ | Reuse directly in Part II if it has exactly one correct answer and four plausible options. |
| Existing fill-blank tense/article question | Reuse directly in Part III or IV if the blank answer is clear and machine-checkable. |
| Existing sentence with familiar vocabulary | Reuse as a sentence base, then rewrite minimally into the required Final Test format. |
| Existing wrong/correct submission | Treat as high-value review material because it reflects actual learner mistakes. |
| Existing answer key from Daily raw/submission data | Trust it as the canonical answer unless it conflicts with the Final Review grammar notes. |

When reusing from Daily, preserve the original answer if it is correct. Do not change a correct Daily answer just to make the question look different.

Daily reuse is especially recommended for:

- Nouns and quantifiers from Lessons 6-7.
- Pronouns from Lesson 8.
- Adjectives/adverbs from Lessons 9 and 16.
- Articles/determiners from Lesson 10.
- Prepositions from Lesson 11.
- Present tenses from Lesson 12.
- Past tenses from Lesson 13.
- Future forms from Lesson 14.
- Modal verbs from Lesson 15.

## Source Paper Analysis

The two source papers have the same four-section structure, but Part II and Part III have different lengths.

| Section | Paper 01 Count | Paper 02 Count | Stable? | Notes |
| --- | --- | --- | --- | --- |
| Part I: Word classes | 10 | 10 | Yes | Table with Noun / Verb / Adjective / Adverb |
| Part II: Choose the correct answer | 17 | 12 | No | Mixed grammar multiple choice |
| Part III: Articles | 10 blanks | 15 blanks | No | Continuous short story/context using A / AN / THE / NONE |
| Part IV: Verb tense | 13 blanks | 13 blanks | Yes | Fill in the correct verb form across 7-8 numbered items |
| Total | 50 answer points | 50 answer points | Yes | Every paper must remain exactly 50 answer points |

Because the source papers use two valid section-count patterns, generated papers should use two templates.

## Approved Paper Templates

### Template A: Paper 01 Style

Use this template for 5 of the 10 generated papers.

| Section | Count |
| --- | --- |
| Part I: Word classes | 10 |
| Part II: Choose the correct answer | 17 |
| Part III: Articles | 10 blanks / 2 numbered paragraph items |
| Part IV: Verb tense | 13 blanks / 7-8 numbered items |
| Total | 50 |

### Template B: Paper 02 Style

Use this template for 5 of the 10 generated papers.

| Section | Count |
| --- | --- |
| Part I: Word classes | 10 |
| Part II: Choose the correct answer | 12 |
| Part III: Articles | 15 blanks / 3 numbered paragraph items |
| Part IV: Verb tense | 13 blanks / 7-8 numbered items |
| Total | 50 |

### Distribution Across 10 New Papers

| New Paper | Template |
| --- | --- |
| Paper 03 | Template A |
| Paper 04 | Template B |
| Paper 05 | Template A |
| Paper 06 | Template B |
| Paper 07 | Template A |
| Paper 08 | Template B |
| Paper 09 | Template A |
| Paper 10 | Template B |
| Paper 11 | Template A |
| Paper 12 | Template B |

## Part I: Word Classes

### Instruction

Use this exact instruction:

`I - Define the word classes of the underlined words as they are used in the sentences below. Tick '✓' your answers. Only ONE '✓' for each word.`

### Format

Part I must be a table, not separate question cards.

| Column | Requirement |
| --- | --- |
| Sentences | One sentence per row. The tested word must be underlined. |
| Noun | Radio/tick option |
| Verb | Radio/tick option |
| Adjective | Radio/tick option |
| Adverb | Radio/tick option |

### Count

Exactly 10 questions in every paper.

### Required Answer Balance

Each Part I set should include:

| Word Class | Target Count | Allowed Range |
| --- | --- | --- |
| Noun | 2 | 2-3 |
| Verb | 3 | 2-3 |
| Adjective | 2 | 2-3 |
| Adverb | 3 | 2-3 |

### Question-Writing Rules

The answer must depend on how the word is used in the sentence, not only on the dictionary form.

Good examples:

| Sentence | Answer | Reason |
| --- | --- | --- |
| I go to <u>work</u> at 8 o'clock. | Noun | `work` names a place/activity here. |
| I usually <u>stream</u> films. | Verb | `stream` describes an action. |
| She is a <u>patient</u> woman. | Adjective | `patient` describes the noun `woman`. |
| He completed the task <u>quickly</u>. | Adverb | `quickly` describes the verb phrase. |

Avoid obscure words, advanced academic vocabulary, and ambiguous answers.

## Part II: Choose The Correct Answer

### Instruction

Use this exact instruction:

`II - Choose the correct answer.`

### Format

Each question must have 4 options labelled A-D.

Only one option can be correct.

Distractors must be plausible learner errors, not obviously silly choices.

### Count

| Template | Count |
| --- | --- |
| Template A | 17 |
| Template B | 12 |

### Topic Distribution For Template A

Template A follows Paper 01, which is broader and more mixed.

| Topic | Target Count | Allowed Range |
| --- | --- | --- |
| Nouns and quantifiers | 3 | 2-4 |
| Pronouns | 3 | 2-3 |
| Present tenses | 3 | 2-3 |
| Past tenses | 2 | 2-3 |
| Future forms | 2 | 1-2 |
| Articles and determiners | 1 | 1-2 |
| Prepositions | 1 | 1-2 |
| Conjunctions / sentence linking | 2 | 1-2 |
| Total | 17 | 17 |

### Topic Distribution For Template B

Template B follows Paper 02, which is shorter and focuses more on noun/pronoun/adjective control.

| Topic | Target Count | Allowed Range |
| --- | --- | --- |
| Nouns and quantifiers | 3 | 2-3 |
| Pronouns | 3 | 2-3 |
| Adjectives / adverbs | 3 | 2-3 |
| Present tenses | 1 | 1-2 |
| Past tenses | 2 | 1-2 |
| Articles / prepositions / conjunctions | 0 | 0-1 if needed |
| Total | 12 | 12 |

### Approved Grammar Points

Part II may test only grammar that appears in the Foundation grammar notes or the daily challenge data:

| Topic | Allowed Grammar Points |
| --- | --- |
| Nouns and quantifiers | countable/uncountable nouns, plural forms, much/many, some/any, a few/a little/few/little |
| Pronouns | subject/object pronouns, possessive adjectives, possessive pronouns, reflexive pronouns, `it/they` agreement |
| Adjectives / adverbs | adjective vs adverb, linking verbs, `-ed` vs `-ing` adjectives, adjective order |
| Articles and determiners | `a`, `an`, `the`, zero article, demonstratives if needed |
| Prepositions | time prepositions `in/on/at`, common place prepositions |
| Present tenses | present simple, present continuous, stative verbs, routines vs now |
| Past tenses | past simple, past continuous, interrupted action with `when/while` |
| Future forms | `will`, `be going to`, present continuous for arrangements |
| Conjunctions | `and`, `but`, `or`, `so`, `nor` where level-appropriate |
| Modal verbs | `can`, `could`, `should`, `must`, `mustn't`, `have to` if needed |

### Option-Writing Rules

Options should follow these patterns:

- Use short options when testing one word: `A. much`, `B. many`, `C. a few`, `D. any`.
- Use phrase options when testing verb forms: `A. was reading`, `B. read`, `C. reads`, `D. is reading`.
- Use paired options only when the sentence has two blanks: `A. did / called`, `B. was doing / called`.
- Avoid multiple correct answers.
- Avoid answers that are correct in American English only when a British English alternative is expected.

## Part III: Articles

### Instruction

Use this exact instruction:

`III - Complete the sentences with A / AN or THE. You can write NONE for a blank.`

### Format

Part III must read like connected paragraph items, not isolated random sentences. A numbered item may contain several blanks.

Each blank must accept one of:

- `a`
- `an`
- `the`
- `NONE`

The answer key may also accept an empty answer for `NONE` if the app supports it.

### Count

| Template | Answer-Point Count | Display Count |
| --- | --- | --- |
| Template A | 10 blanks | 2 numbered paragraph items |
| Template B | 15 blanks | 3 numbered paragraph items |

### Required Answer Balance For Template A

| Answer Type | Target Count | Allowed Range |
| --- | --- | --- |
| `a` | 4 | 3-4 |
| `an` | 0-1 | 0-2 |
| `the` | 5 | 4-6 |
| `NONE` | 1 | 1-2 |
| Total | 10 | 10 |

### Required Answer Balance For Template B

| Answer Type | Target Count | Allowed Range |
| --- | --- | --- |
| `a` | 6 | 5-6 |
| `an` | 2 | 1-3 |
| `the` | 5 | 4-6 |
| `NONE` | 2 | 1-2 |
| Total | 15 | 15 |

### Required Context Patterns

Each Part III passage should include at least 5 of these patterns:

| Pattern | Example | Expected Answer |
| --- | --- | --- |
| First mention singular countable noun | We saw \__\_ small cafe. | `a` |
| Vowel sound singular countable noun | She bought \__\_ umbrella. | `an` |
| Second mention | A cafe was near the station. \__\_ cafe was crowded. | `the` |
| Unique/specific place | We went to \__\_ only museum in town. | `the` |
| Musical instrument | He plays \__\_ piano. | `the` |
| Sea/world/superlative/ordinal | They travelled around \__\_ world. | `the` |
| Plural/general noun | We saw \__\_ lions. | `NONE` |
| Time phrase with no article | next \__\_ weekend | `NONE` |

### Writing Rules

Do not make Part III a list of unrelated sentences. It should be a mini-story, for example:

- A weekend trip.
- A visit to a zoo or museum.
- A family picnic.
- A school event.
- A short holiday.

The context must make `the` clear through previous mention or shared knowledge.

Do not split Part III into 10 or 15 separate numbered lines. The numbers in brackets `(1)`, `(2)`, etc. are blank numbers, not separate question items.

## Part IV: Verb Tenses

### Instruction

Use this exact instruction:

`IV - Change the verb in the brackets to the correct tense.`

### Format

Each numbered item is a short sentence, connected sentence pair, or mini-dialogue. A numbered item may contain one, two, or three blanks.

The input blank must stay inline in the sentence.

### Count

Exactly 13 blanks / answer points in every paper, displayed as 7-8 numbered items. Do not split every blank into a separate item.

### Required Topic Distribution

| Tense Area | Target Blank Count | Allowed Range |
| --- | --- | --- |
| Present simple | 3 | 2-4 |
| Present continuous | 4 | 3-5 |
| Past simple | 2 | 2-3 |
| Past continuous | 2 | 1-3 |
| Future forms | 2 | 1-3 |
| Total | 13 blanks | 13 blanks |

### Required Verb-Form Patterns

Each Part IV set must include:

| Pattern | Minimum Count | Examples |
| --- | --- | --- |
| Routine / habit | 1 | every morning, usually, often |
| Action happening now | 1 | right now, now, at the moment |
| Stative verb in present simple | 1 | know, need, remember, like, have |
| Interrupted past action | 1 | While I was reading, my friend called. |
| Past event sequence | 1 | Last summer, we travelled and visited... |
| Future prediction or plan | 1 | I think it will..., I am going to... |
| Negative form | 1 | do not know, does not like, did not go |
| Question form | 1 | Do you need...?, Where are you going? |

Each Part IV set must include at least:

- 2 numbered items with more than one blank.
- 1 `while` or `when` item showing an interrupted/background past action.
- 1 past sequence item with two past simple verbs.
- 1 present contrast item such as routine vs action happening now.
- 1 future item contrasting `will` and/or `be going to`.
- 1 mini-dialogue item using `A:` / `B:` if it fits naturally.

### Accepted Answer Rules

The answer key should include common contracted and full forms where appropriate.

Examples:

| Full Form | Accepted Contracted Form |
| --- | --- |
| `I am studying` | `I'm studying` |
| `He is sleeping` | `He's sleeping` |
| `They are playing` | `They're playing` |
| `do not know` | `don't know` |
| `does not like` | `doesn't like` |

For British English, prefer `travelled` and `practise` in self-written content. If the source daily data contains American spelling, keep source spelling as an accepted alternative only when needed.

## Difficulty Rules

The difficulty must match the two source papers.

| Level | Requirement |
| --- | --- |
| Too easy | Avoid using only one-word obvious clues in every question. |
| Correct level | Use clear Foundation grammar with familiar contexts. |
| Too hard | Avoid perfect tenses, conditionals, passive voice, relative clauses, reported speech, advanced inversion, or IELTS academic vocabulary unless already present in source data. |

The test should be challenging because learners must choose between close Foundation-level forms, not because the vocabulary is difficult.

## Source Priority For Generating Questions

When generating the 10 new papers, use this priority order:

1. Use the teacher Final Review packet and Final Grammar Atlas to decide which grammar points belong in the test.
2. Search Daily lesson questions for familiar vocabulary, real classroom sentence patterns, and reusable question-answer pairs.
3. Reuse suitable Daily grammar questions directly when they match the final-test format and level.
4. Adapt suitable Daily questions minimally when the grammar point and answer are good but the display format needs to match the final paper.
5. Reuse vocabulary and topic contexts from the speaking notes, speaking question bank, and meta vocab bank.
6. Reuse grammar patterns from the Foundation grammar notes.
7. Generate a new teacher-written question only when the source pool is not enough, and only after choosing the grammar point, topic context, and target learner mistake.

Do not copy long raw passages from daily lessons unless the passage naturally fits the Final Test format. Do not introduce a new topic or word just because the generated sentence sounds more interesting.

## Answer Key Format

Every generated paper must include a complete answer key.

### Part I Answer Key

Use one answer per question:

```text
1. Noun
2. Adjective
3. Verb
...
```

### Part II Answer Key

Use the full option label and text:

```text
1. C. much
2. B. are making
3. A. it
...
```

### Part III Answer Key

Use article answers only:

```text
1. the
2. a
3. NONE
...
```

### Part IV Answer Key

Include accepted alternatives separated by `/`:

```text
1. is going to rain / 's going to rain
2. travelled / traveled
3. was reading
...
```

## Quality Checklist Before Adding A Paper

Before a generated paper is accepted, check every item below:

| Check | Required |
| --- | --- |
| Total is exactly 50 questions | Yes |
| Time is 45 minutes | Yes |
| Part I has exactly 10 rows | Yes |
| Part I uses Noun / Verb / Adjective / Adverb only | Yes |
| Part II has exactly 17 questions for Template A or 12 for Template B | Yes |
| Part II has exactly 4 options per question | Yes |
| Part II has only one correct answer per question | Yes |
| Part III has exactly 10 blanks for Template A or 15 for Template B | Yes |
| Part III reads like connected text | Yes |
| Part III answer key uses only `a`, `an`, `the`, `NONE` | Yes |
| Part IV has exactly 13 blanks | Yes |
| Part IV answer key includes contractions where natural | Yes |
| No answer is shown before submission in the test UI | Yes |
| Inputs remain inline in Part III and Part IV | Yes |
| British English is used for self-written examples | Yes |

## Generation Policy For The Next 10 Papers

Generate exactly 10 additional papers: Paper 03 to Paper 12.

Each paper must be stored as a fixed paper, not a random session, so the learner can practise and review the same paper again.

The generated papers must include:

- The full question content.
- The section title and instruction.
- The correct answer key.
- Accepted alternative answers for fill-in-the-blank questions.
- Topic tags for later filtering and review.

The 10 generated papers should not repeat the exact same question from Paper 01 or Paper 02 unless it comes from official daily source data and is intentionally reused for review.
