// Supplemented Final questions, authored in the SAME shape as lesson handouts
// (IfaSpeakingQuestion) so they render with the exact same SpeakingQuestionCard
// UI and interactivity. Keyed by final-speaking question id.
//
// Authored topic by topic. Each either-or / yes-no question becomes two
// scenarios (the card's scenario buttons), each with slot phrases + a frame.

import type { IfaSpeakingQuestion } from "@/types/content"

export const ifaSpeakingSupplements: Record<string, IfaSpeakingQuestion> = {
  // ── Shopping ───────────────────────────────────────────────
  "shopping-02": {
    title: "Do you prefer shopping online or going to the mall?",
    vi: "Bạn thích mua trực tuyến hay đến trung tâm thương mại?",
    vocab: [
      { term: "compare prices", pos: "v", vi: "so sánh giá", ipa: "kəmˈpeə ˈpraɪsɪz" },
      { term: "try things on", pos: "v", vi: "thử đồ", ipa: "traɪ θɪŋz ɒn" },
      { term: "convenient", pos: "adj", vi: "tiện lợi", ipa: "kənˈviːniənt" },
    ],
    scenarios: [
      {
        name: "Mua online",
        vi: "Thích mua online",
        labels: { g1: "Lựa chọn", g2: "Lý do", g3: "Chi tiết" },
        g2DependsOnG1: false,
        g2Prompt: "",
        g1: [
          { en: "I prefer shopping online", vi: "Tôi thích mua sắm online hơn", ipa: "aɪ prɪˈfɜː ˈʃɒpɪŋ ˈɒnlaɪn" },
          { en: "I'd rather shop online", vi: "Tôi thích mua online hơn", ipa: "aɪd ˈrɑːðə ʃɒp ˈɒnlaɪn" },
        ],
        g2groups: [
          {
            name: "", vi: "",
            items: [
              { en: "it saves me a lot of time", vi: "nó tiết kiệm nhiều thời gian", ipa: "ɪt seɪvz miː ə lɒt əv taɪm" },
              { en: "it's really convenient", vi: "rất tiện lợi", ipa: "ɪts ˈrɪəli kənˈviːniənt" },
              { en: "I can shop from home", vi: "tôi có thể mua ngay tại nhà", ipa: "aɪ kən ʃɒp frəm həʊm" },
            ],
          },
        ],
        g3groups: [
          {
            name: "", vi: "",
            items: [
              { en: "I can compare prices easily", vi: "tôi so sánh giá dễ dàng", ipa: "aɪ kən kəmˈpeə ˈpraɪsɪz ˈiːzəli" },
              { en: "there are lots of discounts", vi: "có nhiều ưu đãi", ipa: "ðeə ɑː lɒts əv ˈdɪskaʊnts" },
              { en: "the items are delivered to my door", vi: "hàng được giao tận cửa", ipa: "ðiː ˈaɪtəmz ɑː dɪˈlɪvəd tə maɪ dɔː" },
            ],
          },
        ],
        structs: [
          {
            parts: [
              { type: "slot", slot: 1 },
              { type: "text", text: " because " },
              { type: "slot", slot: 2 },
              { type: "text", text: ". For example, " },
              { type: "slot", slot: 3 },
              { type: "text", text: "." },
            ],
            vi: "Tôi thích … vì …. Ví dụ, ….",
            example: "I prefer shopping online because it saves me a lot of time. For example, I can compare prices easily.",
          },
        ],
      },
      {
        name: "Ra trung tâm",
        vi: "Thích ra trung tâm thương mại",
        labels: { g1: "Lựa chọn", g2: "Lý do", g3: "Chi tiết" },
        g2DependsOnG1: false,
        g2Prompt: "",
        g1: [
          { en: "I prefer going to the mall", vi: "Tôi thích ra trung tâm thương mại hơn", ipa: "aɪ prɪˈfɜː ˈɡəʊɪŋ tə ðə mɔːl" },
          { en: "I'd rather shop at the mall", vi: "Tôi thích mua ở trung tâm hơn", ipa: "aɪd ˈrɑːðə ʃɒp ət ðə mɔːl" },
        ],
        g2groups: [
          {
            name: "", vi: "",
            items: [
              { en: "I can try things on", vi: "tôi có thể thử đồ", ipa: "aɪ kən traɪ θɪŋz ɒn" },
              { en: "I can check the quality", vi: "tôi có thể kiểm tra chất lượng", ipa: "aɪ kən tʃek ðə ˈkwɒləti" },
              { en: "it's a nice way to relax", vi: "đó là cách thư giãn dễ chịu", ipa: "ɪts ə naɪs weɪ tə rɪˈlæks" },
            ],
          },
        ],
        g3groups: [
          {
            name: "", vi: "",
            items: [
              { en: "I can see the products in person", vi: "tôi xem được sản phẩm tận mắt", ipa: "aɪ kən siː ðə ˈprɒdʌkts ɪn ˈpɜːsn" },
              { en: "I can get help from the staff", vi: "tôi được nhân viên tư vấn", ipa: "aɪ kən ɡet help frəm ðə stɑːf" },
              { en: "I enjoy walking around with friends", vi: "tôi thích đi dạo cùng bạn bè", ipa: "aɪ ɪnˈdʒɔɪ ˈwɔːkɪŋ əˈraʊnd wɪð frendz" },
            ],
          },
        ],
        structs: [
          {
            parts: [
              { type: "slot", slot: 1 },
              { type: "text", text: " because " },
              { type: "slot", slot: 2 },
              { type: "text", text: ". For example, " },
              { type: "slot", slot: 3 },
              { type: "text", text: "." },
            ],
            vi: "Tôi thích … vì …. Ví dụ, ….",
            example: "I prefer going to the mall because I can try things on. For example, I can check the quality.",
          },
        ],
      },
    ],
  },

  "shopping-05": {
    title: "Do you have any favourite stores?",
    vi: "Bạn có cửa hàng yêu thích không?",
    vocab: [
      { term: "reasonable prices", pos: "n", vi: "giá cả hợp lý", ipa: "ˈriːznəbl ˈpraɪsɪz" },
      { term: "good value for money", pos: "phrase", vi: "đáng đồng tiền", ipa: "ɡʊd ˈvæljuː fə ˈmʌni" },
    ],
    scenarios: [
      {
        name: "Có (Yes)",
        vi: "Có cửa hàng yêu thích",
        labels: { g1: "Trả lời", g2: "Lý do", g3: "Chi tiết" },
        g2DependsOnG1: false,
        g2Prompt: "",
        g1: [
          { en: "Yes, my favourite store is Uniqlo", vi: "Có, cửa hàng tôi thích là Uniqlo", ipa: "jes maɪ ˈfeɪvərɪt stɔː ɪz ˈjuːnɪkləʊ" },
          { en: "Yes, I really like shopping at Uniqlo", vi: "Có, tôi rất thích mua ở Uniqlo", ipa: "jes aɪ ˈrɪəli laɪk ˈʃɒpɪŋ ət ˈjuːnɪkləʊ" },
        ],
        g2groups: [
          {
            name: "", vi: "",
            items: [
              { en: "its clothes are simple and comfortable", vi: "quần áo đơn giản và thoải mái", ipa: "ɪts kləʊðz ɑː ˈsɪmpl ənd ˈkʌmftəbl" },
              { en: "the prices are reasonable", vi: "giá cả hợp lý", ipa: "ðə ˈpraɪsɪz ɑː ˈriːznəbl" },
              { en: "the quality is good", vi: "chất lượng tốt", ipa: "ðə ˈkwɒləti ɪz ɡʊd" },
            ],
          },
        ],
        g3groups: [
          {
            name: "", vi: "",
            items: [
              { en: "I often go there for basic clothes", vi: "tôi hay tới mua đồ cơ bản", ipa: "aɪ ˈɒfn ɡəʊ ðeə fə ˈbeɪsɪk kləʊðz" },
              { en: "it offers good value for money", vi: "rất đáng đồng tiền", ipa: "ɪt ˈɒfəz ɡʊd ˈvæljuː fə ˈmʌni" },
              { en: "the staff are friendly", vi: "nhân viên thân thiện", ipa: "ðə stɑːf ɑː ˈfrendli" },
            ],
          },
        ],
        structs: [
          {
            parts: [
              { type: "slot", slot: 1 },
              { type: "text", text: " because " },
              { type: "slot", slot: 2 },
              { type: "text", text: ". " },
              { type: "slot", slot: 3 },
              { type: "text", text: "." },
            ],
            vi: "Có, … vì …. ….",
            example: "Yes, my favourite store is Uniqlo because its clothes are simple and comfortable. I often go there for basic clothes.",
          },
        ],
      },
      {
        name: "Không hẳn (No)",
        vi: "Không có cửa hàng cố định",
        labels: { g1: "Trả lời", g2: "Lý do", g3: "Chi tiết" },
        g2DependsOnG1: false,
        g2Prompt: "",
        g1: [
          { en: "Not really, I don't have a favourite store", vi: "Không hẳn, tôi không có cửa hàng yêu thích", ipa: "nɒt ˈrɪəli aɪ dəʊnt hæv ə ˈfeɪvərɪt stɔː" },
        ],
        g2groups: [
          {
            name: "", vi: "",
            items: [
              { en: "I just buy wherever is convenient", vi: "tôi mua ở đâu tiện là được", ipa: "aɪ dʒʌst baɪ weərˈevər ɪz kənˈviːniənt" },
              { en: "I don't shop very often", vi: "tôi không mua sắm thường xuyên", ipa: "aɪ dəʊnt ʃɒp ˈveri ˈɒfn" },
            ],
          },
        ],
        g3groups: [
          {
            name: "", vi: "",
            items: [
              { en: "I usually compare prices first", vi: "tôi thường so sánh giá trước", ipa: "aɪ ˈjuːʒuəli kəmˈpeə ˈpraɪsɪz fɜːst" },
              { en: "I care more about price than brand", vi: "tôi quan tâm giá hơn thương hiệu", ipa: "aɪ keə mɔː əˈbaʊt praɪs ðən brænd" },
            ],
          },
        ],
        structs: [
          {
            parts: [
              { type: "slot", slot: 1 },
              { type: "text", text: ", and " },
              { type: "slot", slot: 2 },
              { type: "text", text: ". " },
              { type: "slot", slot: 3 },
              { type: "text", text: "." },
            ],
            vi: "Không hẳn, … và …. ….",
            example: "Not really, I don't have a favourite store, and I just buy wherever is convenient. I usually compare prices first.",
          },
        ],
      },
    ],
  },

  // ── Sports ─────────────────────────────────────────────────
  "sports-01": {
    title: "Do you like playing sports?",
    vi: "Bạn có thích chơi thể thao không?",
    vocab: [
      { term: "keep fit", pos: "v", vi: "giữ dáng, khỏe mạnh", ipa: "kiːp fɪt" },
      { term: "relieve stress", pos: "v", vi: "giảm căng thẳng", ipa: "rɪˈliːv stres" },
    ],
    scenarios: [
      {
        name: "Có (Yes)", vi: "Thích chơi thể thao",
        labels: { g1: "Trả lời", g2: "Lý do", g3: "Chi tiết" }, g2DependsOnG1: false, g2Prompt: "",
        g1: [
          { en: "Yes, I really like playing sports", vi: "Có, tôi rất thích chơi thể thao", ipa: "jes aɪ ˈrɪəli laɪk ˈpleɪɪŋ spɔːts" },
          { en: "Yes, I'm quite keen on sports", vi: "Có, tôi khá mê thể thao", ipa: "jes aɪm kwaɪt kiːn ɒn spɔːts" },
        ],
        g2groups: [{ name: "", vi: "", items: [
          { en: "it helps me keep fit", vi: "nó giúp tôi giữ dáng", ipa: "ɪt helps miː kiːp fɪt" },
          { en: "it's a great way to relieve stress", vi: "là cách giảm căng thẳng rất tốt", ipa: "ɪts ə ɡreɪt weɪ tə rɪˈliːv stres" },
          { en: "I can spend time with my friends", vi: "tôi được dành thời gian với bạn bè", ipa: "aɪ kən spend taɪm wɪð maɪ frendz" },
        ] }],
        g3groups: [{ name: "", vi: "", items: [
          { en: "I usually play badminton after work", vi: "tôi hay chơi cầu lông sau giờ làm", ipa: "aɪ ˈjuːʒuəli pleɪ ˈbædmɪntən ˈɑːftə wɜːk" },
          { en: "I feel more energetic afterwards", vi: "sau đó tôi thấy tràn năng lượng", ipa: "aɪ fiːl mɔːr ˌenəˈdʒetɪk ˈɑːftəwədz" },
          { en: "it keeps me healthy", vi: "nó giữ tôi khỏe mạnh", ipa: "ɪt kiːps miː ˈhelθi" },
        ] }],
        structs: [{
          parts: [{ type: "slot", slot: 1 }, { type: "text", text: " because " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
          vi: "Có, … vì …. ….",
          example: "Yes, I really like playing sports because it helps me keep fit. I usually play badminton after work.",
        }],
      },
      {
        name: "Không (No)", vi: "Không thích chơi thể thao",
        labels: { g1: "Trả lời", g2: "Lý do", g3: "Chi tiết" }, g2DependsOnG1: false, g2Prompt: "",
        g1: [
          { en: "Not really, I'm not very keen on sports", vi: "Không hẳn, tôi không mê thể thao lắm", ipa: "nɒt ˈrɪəli aɪm nɒt ˈveri kiːn ɒn spɔːts" },
        ],
        g2groups: [{ name: "", vi: "", items: [
          { en: "I don't have much free time", vi: "tôi không có nhiều thời gian rảnh", ipa: "aɪ dəʊnt hæv mʌtʃ friː taɪm" },
          { en: "I prefer other hobbies", vi: "tôi thích những sở thích khác hơn", ipa: "aɪ prɪˈfɜːr ˈʌðə ˈhɒbiz" },
        ] }],
        g3groups: [{ name: "", vi: "", items: [
          { en: "I'd rather watch films at home", vi: "tôi thích xem phim ở nhà hơn", ipa: "aɪd ˈrɑːðə wɒtʃ fɪlmz ət həʊm" },
          { en: "I usually relax by listening to music", vi: "tôi thường thư giãn bằng nghe nhạc", ipa: "aɪ ˈjuːʒuəli rɪˈlæks baɪ ˈlɪsnɪŋ tə ˈmjuːzɪk" },
        ] }],
        structs: [{
          parts: [{ type: "slot", slot: 1 }, { type: "text", text: " because " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
          vi: "Không hẳn, … vì …. ….",
          example: "Not really, I'm not very keen on sports because I don't have much free time. I'd rather watch films at home.",
        }],
      },
    ],
  },

  // ── Studying ───────────────────────────────────────────────
  "studying-01": {
    title: "Where are you studying?",
    vi: "Bạn đang học ở đâu?",
    vocab: [{ term: "language centre", pos: "n", vi: "trung tâm ngoại ngữ", ipa: "ˈlæŋɡwɪdʒ ˈsentə" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Học gì", g2: "Ở đâu", g3: "Lý do" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "I'm currently studying English", vi: "Hiện tôi đang học tiếng Anh", ipa: "aɪm ˈkʌrəntli ˈstʌdiɪŋ ˈɪŋɡlɪʃ" },
        { en: "I'm taking an English course", vi: "Tôi đang theo một khóa tiếng Anh", ipa: "aɪm ˈteɪkɪŋ ən ˈɪŋɡlɪʃ kɔːs" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "at a language centre in Hanoi", vi: "tại một trung tâm ngoại ngữ ở Hà Nội", ipa: "ət ə ˈlæŋɡwɪdʒ ˈsentər ɪn hɑːˈnɔɪ" },
        { en: "at university", vi: "ở trường đại học", ipa: "ət ˌjuːnɪˈvɜːsəti" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "because English is important for my job", vi: "vì tiếng Anh quan trọng với công việc của tôi", ipa: "bɪˈkɒz ˈɪŋɡlɪʃ ɪz ɪmˈpɔːtənt fə maɪ dʒɒb" },
        { en: "to get better job opportunities", vi: "để có cơ hội việc làm tốt hơn", ipa: "tə ɡet ˈbetə dʒɒb ˌɒpəˈtjuːnətiz" },
        { en: "to improve my communication skills", vi: "để cải thiện kỹ năng giao tiếp", ipa: "tə ɪmˈpruːv maɪ kəˌmjuːnɪˈkeɪʃn skɪlz" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: " " }, { type: "slot", slot: 2 }, { type: "text", text: ", " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "Hiện tôi đang học … …, …",
        example: "I'm currently studying English at a language centre in Hanoi, because English is important for my job.",
      }],
    }],
  },
  "studying-02": {
    title: "What is your major? / What is your favourite subject?",
    vi: "Chuyên ngành / môn học yêu thích của bạn là gì?",
    vocab: [{ term: "be interested in", pos: "v", vi: "hứng thú với", ipa: "bi ˈɪntrəstɪd ɪn" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Ngành/môn", g2: "Lý do", g3: "Chi tiết" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "My major is Software Engineering", vi: "Chuyên ngành của tôi là Kỹ thuật phần mềm", ipa: "maɪ ˈmeɪdʒər ɪz ˈsɒftweər ˌendʒɪˈnɪərɪŋ" },
        { en: "My favourite subject is English", vi: "Môn tôi thích nhất là tiếng Anh", ipa: "maɪ ˈfeɪvərɪt ˈsʌbdʒɪkt ɪz ˈɪŋɡlɪʃ" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "because I'm interested in technology", vi: "vì tôi hứng thú với công nghệ", ipa: "bɪˈkɒz aɪm ˈɪntrəstɪd ɪn tekˈnɒlədʒi" },
        { en: "because it's useful for my career", vi: "vì nó có ích cho sự nghiệp", ipa: "bɪˈkɒz ɪts ˈjuːsfl fə maɪ kəˈrɪə" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "I really enjoy solving problems", vi: "tôi rất thích giải quyết vấn đề", ipa: "aɪ ˈrɪəli ɪnˈdʒɔɪ ˈsɒlvɪŋ ˈprɒbləmz" },
        { en: "I like developing software", vi: "tôi thích phát triển phần mềm", ipa: "aɪ laɪk dɪˈveləpɪŋ ˈsɒftweə" },
        { en: "I find it fun to learn", vi: "tôi thấy học nó thú vị", ipa: "aɪ faɪnd ɪt fʌn tə lɜːn" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: " " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "… …. ….",
        example: "My major is Software Engineering because I'm interested in technology. I really enjoy solving problems.",
      }],
    }],
  },
  "studying-03": {
    title: "Is there anything you don't like about your school?",
    vi: "Có điều gì bạn không thích ở trường không?",
    vocab: [{ term: "heavy workload", pos: "n", vi: "khối lượng bài vở nặng", ipa: "ˈhevi ˈwɜːkləʊd" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Điều không thích", g2: "Vì sao", g3: "Ảnh hưởng" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "One thing I don't like is the heavy workload", vi: "Điều tôi không thích là bài vở quá nặng", ipa: "wʌn θɪŋ aɪ dəʊnt laɪk ɪz ðə ˈhevi ˈwɜːkləʊd" },
        { en: "I'm not keen on the crowded classrooms", vi: "Tôi không thích lớp học đông đúc", ipa: "aɪm nɒt kiːn ɒn ðə ˈkraʊdɪd ˈklɑːsruːmz" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "I often have a lot of homework", vi: "tôi thường có nhiều bài tập", ipa: "aɪ ˈɒfn hæv ə lɒt əv ˈhəʊmwɜːk" },
        { en: "the lessons can be quite stressful", vi: "các buổi học khá áp lực", ipa: "ðə ˈlesnz kən bi kwaɪt ˈstresfl" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "it's hard to balance work and study", vi: "khó cân bằng công việc và học", ipa: "ɪts hɑːd tə ˈbæləns wɜːk ænd ˈstʌdi" },
        { en: "I sometimes feel tired after a long day", vi: "đôi khi tôi mệt sau ngày dài", ipa: "aɪ ˈsʌmtaɪmz fiːl ˈtaɪəd ˈɑːftər ə lɒŋ deɪ" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: " because " }, { type: "slot", slot: 2 }, { type: "text", text: ", so " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "Điều tôi không thích là … vì …, nên ….",
        example: "One thing I don't like is the heavy workload because I often have a lot of homework, so it's hard to balance work and study.",
      }],
    }],
  },
  "studying-04": {
    title: "Do you think that you're a good student?",
    vi: "Bạn có nghĩ mình là học sinh/sinh viên giỏi không?",
    vocab: [{ term: "pay attention", pos: "v", vi: "chú ý", ipa: "peɪ əˈtenʃn" }],
    scenarios: [
      {
        name: "Có (Yes)", vi: "", labels: { g1: "Trả lời", g2: "Thói quen", g3: "Chi tiết" }, g2DependsOnG1: false, g2Prompt: "",
        g1: [{ en: "Yes, I think I'm quite a good student", vi: "Có, tôi nghĩ mình khá giỏi", ipa: "jes aɪ θɪŋk aɪm kwaɪt ə ɡʊd ˈstjuːdnt" }],
        g2groups: [{ name: "", vi: "", items: [
          { en: "I always pay attention in class", vi: "tôi luôn chú ý trong lớp", ipa: "aɪ ˈɔːlweɪz peɪ əˈtenʃn ɪn klɑːs" },
          { en: "I complete my homework on time", vi: "tôi hoàn thành bài đúng hạn", ipa: "aɪ kəmˈpliːt maɪ ˈhəʊmwɜːk ɒn taɪm" },
        ] }],
        g3groups: [{ name: "", vi: "", items: [
          { en: "I review my lessons in my free time", vi: "tôi ôn bài lúc rảnh", ipa: "aɪ rɪˈvjuː maɪ ˈlesnz ɪn maɪ friː taɪm" },
          { en: "I try hard to improve", vi: "tôi cố gắng tiến bộ", ipa: "aɪ traɪ hɑːd tu ɪmˈpruːv" },
        ] }],
        structs: [{
          parts: [{ type: "slot", slot: 1 }, { type: "text", text: " because " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
          vi: "Có, … vì …. ….",
          example: "Yes, I think I'm quite a good student because I always pay attention in class. I review my lessons in my free time.",
        }],
      },
      {
        name: "Chưa hẳn (Not quite)", vi: "", labels: { g1: "Trả lời", g2: "Lý do", g3: "Cố gắng" }, g2DependsOnG1: false, g2Prompt: "",
        g1: [{ en: "Not really, I still need to try harder", vi: "Chưa hẳn, tôi vẫn cần cố gắng hơn", ipa: "nɒt ˈrɪəli aɪ stɪl niːd tə traɪ ˈhɑːdə" }],
        g2groups: [{ name: "", vi: "", items: [
          { en: "I sometimes forget my homework", vi: "đôi khi tôi quên làm bài", ipa: "aɪ ˈsʌmtaɪmz fəˈɡet maɪ ˈhəʊmwɜːk" },
          { en: "I get distracted easily", vi: "tôi dễ bị xao nhãng", ipa: "aɪ ɡet dɪˈstræktɪd ˈiːzəli" },
        ] }],
        g3groups: [{ name: "", vi: "", items: [
          { en: "but I'm trying to study more regularly", vi: "nhưng tôi đang cố học đều hơn", ipa: "bət aɪm ˈtraɪɪŋ tə ˈstʌdi mɔː ˈreɡjələli" },
          { en: "I want to manage my time better", vi: "tôi muốn quản lý thời gian tốt hơn", ipa: "aɪ wɒnt tə ˈmænɪdʒ maɪ taɪm ˈbetə" },
        ] }],
        structs: [{
          parts: [{ type: "slot", slot: 1 }, { type: "text", text: " because " }, { type: "slot", slot: 2 }, { type: "text", text: ", " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
          vi: "Chưa hẳn, … vì …, ….",
          example: "Not really, I still need to try harder because I sometimes forget my homework, but I'm trying to study more regularly.",
        }],
      },
    ],
  },
  "studying-05": {
    title: "Do you prefer to study alone or with others? Why?",
    vi: "Bạn thích học một mình hay cùng người khác? Vì sao?",
    vocab: [{ term: "concentrate", pos: "v", vi: "tập trung", ipa: "ˈkɒnsntreɪt" }],
    scenarios: [
      {
        name: "Một mình", vi: "", labels: { g1: "Trả lời", g2: "Lý do", g3: "Chi tiết" }, g2DependsOnG1: false, g2Prompt: "",
        g1: [{ en: "I prefer studying alone", vi: "Tôi thích học một mình hơn", ipa: "aɪ prɪˈfɜː ˈstʌdiɪŋ əˈləʊn" }],
        g2groups: [{ name: "", vi: "", items: [
          { en: "I can concentrate better", vi: "tôi tập trung tốt hơn", ipa: "aɪ kən ˈkɒnsntreɪt ˈbetə" },
          { en: "I can study at my own pace", vi: "tôi học theo nhịp của mình", ipa: "aɪ kən ˈstʌdi ət maɪ əʊn peɪs" },
        ] }],
        g3groups: [{ name: "", vi: "", items: [
          { en: "I can spend more time on hard lessons", vi: "tôi dành thêm thời gian cho bài khó", ipa: "aɪ kən spend mɔː taɪm ɒn hɑːd ˈlesnz" },
          { en: "there are fewer distractions", vi: "ít bị xao nhãng hơn", ipa: "ðeər ɑː ˈfjuːə dɪˈstrækʃnz" },
        ] }],
        structs: [{
          parts: [{ type: "slot", slot: 1 }, { type: "text", text: " because " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
          vi: "Tôi thích … vì …. ….",
          example: "I prefer studying alone because I can concentrate better. I can study at my own pace.",
        }],
      },
      {
        name: "Cùng người khác", vi: "", labels: { g1: "Trả lời", g2: "Lý do", g3: "Chi tiết" }, g2DependsOnG1: false, g2Prompt: "",
        g1: [{ en: "I prefer studying with others", vi: "Tôi thích học cùng người khác hơn", ipa: "aɪ prɪˈfɜː ˈstʌdiɪŋ wɪð ˈʌðəz" }],
        g2groups: [{ name: "", vi: "", items: [
          { en: "we can share ideas", vi: "chúng tôi có thể chia sẻ ý tưởng", ipa: "wi kən ʃeər aɪˈdɪəz" },
          { en: "we can help each other", vi: "chúng tôi giúp đỡ nhau", ipa: "wi kən help iːtʃ ˈʌðə" },
        ] }],
        g3groups: [{ name: "", vi: "", items: [
          { en: "it keeps me motivated", vi: "nó giúp tôi có động lực", ipa: "ɪt kiːps miː ˈməʊtɪveɪtɪd" },
          { en: "studying becomes more fun", vi: "việc học trở nên vui hơn", ipa: "ˈstʌdiɪŋ bɪˈkʌmz mɔː fʌn" },
        ] }],
        structs: [{
          parts: [{ type: "slot", slot: 1 }, { type: "text", text: " because " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
          vi: "Tôi thích … vì …. ….",
          example: "I prefer studying with others because we can share ideas. It keeps me motivated.",
        }],
      },
    ],
  },
  "studying-06": {
    title: "How often do you play truant?",
    vi: "Bạn trốn học bao lâu một lần?",
    vocab: [{ term: "play truant", pos: "v", vi: "trốn học", ipa: "pleɪ ˈtruːənt" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Tần suất", g2: "Lý do", g3: "Khi lỡ" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [{ en: "I never play truant", vi: "Tôi không bao giờ trốn học", ipa: "aɪ ˈnevə pleɪ ˈtruːənt" }],
      g2groups: [{ name: "", vi: "", items: [
        { en: "studying is important to me", vi: "học quan trọng với tôi", ipa: "ˈstʌdiɪŋ ɪz ɪmˈpɔːtənt tə miː" },
        { en: "I always try to attend all my classes", vi: "tôi luôn cố đi học đầy đủ", ipa: "aɪ ˈɔːlweɪz traɪ tu əˈtend ɔːl maɪ ˈklɑːsɪz" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "if I miss a class, I catch up on the lessons", vi: "nếu lỡ buổi, tôi học bù", ipa: "ɪf aɪ mɪs ə klɑːs aɪ kætʃ ʌp ɒn ðə ˈlesnz" },
        { en: "I ask my friends for notes", vi: "tôi xin vở bạn bè", ipa: "aɪ ɑːsk maɪ frendz fə nəʊts" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: " because " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "Tôi … vì …. ….",
        example: "I never play truant because studying is important to me. If I miss a class, I catch up on the lessons.",
      }],
    }],
  },
  "studying-07": {
    title: "Are you a quick learner?",
    vi: "Bạn có tiếp thu nhanh không?",
    vocab: [{ term: "pick up", pos: "v", vi: "học/nắm bắt nhanh", ipa: "pɪk ʌp" }],
    scenarios: [
      {
        name: "Có (Yes)", vi: "", labels: { g1: "Trả lời", g2: "Lĩnh vực", g3: "Chi tiết" }, g2DependsOnG1: false, g2Prompt: "",
        g1: [{ en: "Yes, I think I'm a quick learner", vi: "Có, tôi nghĩ mình tiếp thu nhanh", ipa: "jes aɪ θɪŋk aɪm ə kwɪk ˈlɜːnə" }],
        g2groups: [{ name: "", vi: "", items: [
          { en: "I can pick up new skills quickly", vi: "tôi nắm kỹ năng mới nhanh", ipa: "aɪ kən pɪk ʌp njuː skɪlz ˈkwɪkli" },
          { en: "especially in technology", vi: "nhất là về công nghệ", ipa: "ɪˈspeʃəli ɪn tekˈnɒlədʒi" },
        ] }],
        g3groups: [{ name: "", vi: "", items: [
          { en: "I use AI tools to learn new things", vi: "tôi dùng công cụ AI để học cái mới", ipa: "aɪ juːz ˌeɪˈaɪ tuːlz tə lɜːn njuː θɪŋz" },
          { en: "I enjoy solving problems", vi: "tôi thích giải quyết vấn đề", ipa: "aɪ ɪnˈdʒɔɪ ˈsɒlvɪŋ ˈprɒbləmz" },
        ] }],
        structs: [{
          parts: [{ type: "slot", slot: 1 }, { type: "text", text: " because " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
          vi: "Có, … vì …. ….",
          example: "Yes, I think I'm a quick learner because I can pick up new skills quickly. I use AI tools to learn new things.",
        }],
      },
      {
        name: "Tùy (It depends)", vi: "", labels: { g1: "Trả lời", g2: "Lý do", g3: "Cách khắc phục" }, g2DependsOnG1: false, g2Prompt: "",
        g1: [{ en: "It depends on the subject", vi: "Còn tùy môn học", ipa: "ɪt dɪˈpendz ɒn ðə ˈsʌbdʒɪkt" }],
        g2groups: [{ name: "", vi: "", items: [
          { en: "I learn practical things quickly", vi: "tôi học cái thực tế thì nhanh", ipa: "aɪ lɜːn ˈpræktɪkl θɪŋz ˈkwɪkli" },
          { en: "but theory takes me more time", vi: "nhưng lý thuyết thì lâu hơn", ipa: "bət ˈθɪəri teɪks miː mɔː taɪm" },
        ] }],
        g3groups: [{ name: "", vi: "", items: [
          { en: "I just need to practise more", vi: "tôi chỉ cần luyện nhiều hơn", ipa: "aɪ dʒʌst niːd tə ˈpræktɪs mɔː" },
          { en: "I review regularly to remember", vi: "tôi ôn đều để nhớ", ipa: "aɪ rɪˈvjuː ˈreɡjələli tə rɪˈmembə" },
        ] }],
        structs: [{
          parts: [{ type: "slot", slot: 1 }, { type: "text", text: ". " }, { type: "slot", slot: 2 }, { type: "text", text: ", so " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
          vi: "Còn tùy. …, nên ….",
          example: "It depends on the subject. I learn practical things quickly, but theory takes me more time, so I just need to practise more.",
        }],
      },
    ],
  },

  // ── Working ────────────────────────────────────────────────
  "working-02": {
    title: "Is there anything you don't like about that job?",
    vi: "Có điều gì bạn không thích ở công việc đó không?",
    vocab: [{ term: "work-life balance", pos: "n", vi: "cân bằng công việc – cuộc sống", ipa: "ˈwɜːk laɪf ˈbæləns" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Điều không thích", g2: "Vì sao", g3: "Ảnh hưởng" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "Sometimes I have a heavy workload", vi: "Đôi khi khối lượng công việc khá nặng", ipa: "ˈsʌmtaɪmz aɪ hæv ə ˈhevi ˈwɜːkləʊd" },
        { en: "The thing I don't like is the pressure", vi: "Điều tôi không thích là áp lực", ipa: "ðə θɪŋ aɪ dəʊnt laɪk ɪz ðə ˈpreʃə" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "I have to work under pressure", vi: "tôi phải làm việc dưới áp lực", ipa: "aɪ hæv tə wɜːk ˈʌndə ˈpreʃə" },
        { en: "I sometimes work overtime to meet deadlines", vi: "đôi khi tôi tăng ca để kịp hạn", ipa: "aɪ ˈsʌmtaɪmz wɜːk ˈəʊvətaɪm tə miːt ˈdedlaɪnz" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "it's hard to keep a good work-life balance", vi: "khó giữ cân bằng công việc – cuộc sống", ipa: "ɪts hɑːd tə kiːp ə ɡʊd ˈwɜːk laɪf ˈbæləns" },
        { en: "I sometimes feel tired after a long day", vi: "đôi khi tôi mệt sau ngày dài", ipa: "aɪ ˈsʌmtaɪmz fiːl ˈtaɪəd ˈɑːftər ə lɒŋ deɪ" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: " because " }, { type: "slot", slot: 2 }, { type: "text", text: ", so " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "… vì …, nên ….",
        example: "Sometimes I have a heavy workload because I have to work under pressure, so it's hard to keep a good work-life balance.",
      }],
    }],
  },
  "working-03": {
    title: "Do you think you can work well under pressure?",
    vi: "Bạn có nghĩ mình làm việc tốt dưới áp lực không?",
    vocab: [{ term: "prioritise tasks", pos: "v", vi: "ưu tiên công việc", ipa: "praɪˈɒrɪtaɪz tɑːsks" }],
    scenarios: [
      {
        name: "Có (Yes)", vi: "", labels: { g1: "Trả lời", g2: "Cách làm", g3: "Kết quả" }, g2DependsOnG1: false, g2Prompt: "",
        g1: [{ en: "Yes, I think I can work well under pressure", vi: "Có, tôi nghĩ mình làm tốt dưới áp lực", ipa: "jes aɪ θɪŋk aɪ kən wɜːk wel ˈʌndə ˈpreʃə" }],
        g2groups: [{ name: "", vi: "", items: [
          { en: "I usually make a plan", vi: "tôi thường lập kế hoạch", ipa: "aɪ ˈjuːʒuəli meɪk ə plæn" },
          { en: "I prioritise important tasks", vi: "tôi ưu tiên việc quan trọng", ipa: "aɪ praɪˈɒrɪtaɪz ɪmˈpɔːtənt tɑːsks" },
        ] }],
        g3groups: [{ name: "", vi: "", items: [
          { en: "so I can meet deadlines", vi: "nên tôi kịp hạn", ipa: "səʊ aɪ kən miːt ˈdedlaɪnz" },
          { en: "I try to stay calm and focused", vi: "tôi cố giữ bình tĩnh và tập trung", ipa: "aɪ traɪ tə steɪ kɑːm ænd ˈfəʊkəst" },
        ] }],
        structs: [{
          parts: [{ type: "slot", slot: 1 }, { type: "text", text: " because " }, { type: "slot", slot: 2 }, { type: "text", text: ", " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
          vi: "Có, … vì …, ….",
          example: "Yes, I think I can work well under pressure because I usually make a plan, so I can meet deadlines.",
        }],
      },
      {
        name: "Khá áp lực (Honestly)", vi: "", labels: { g1: "Trả lời", g2: "Cách xử lý", g3: "Kết quả" }, g2DependsOnG1: false, g2Prompt: "",
        g1: [{ en: "Honestly, it can be stressful at first", vi: "Thật ra lúc đầu khá căng thẳng", ipa: "ˈɒnɪstli ɪt kən bi ˈstresfl ət fɜːst" }],
        g2groups: [{ name: "", vi: "", items: [
          { en: "but I try to stay calm", vi: "nhưng tôi cố giữ bình tĩnh", ipa: "bət aɪ traɪ tə steɪ kɑːm" },
          { en: "I break big tasks into small steps", vi: "tôi chia việc lớn thành bước nhỏ", ipa: "aɪ breɪk bɪɡ tɑːsks ˈɪntə smɔːl steps" },
        ] }],
        g3groups: [{ name: "", vi: "", items: [
          { en: "then I can handle the deadline", vi: "rồi tôi xử lý được hạn chót", ipa: "ðen aɪ kən ˈhændl ðə ˈdedlaɪn" },
          { en: "so I don't feel overwhelmed", vi: "nên tôi không thấy quá tải", ipa: "səʊ aɪ dəʊnt fiːl ˌəʊvəˈwelmd" },
        ] }],
        structs: [{
          parts: [{ type: "slot", slot: 1 }, { type: "text", text: ", " }, { type: "slot", slot: 2 }, { type: "text", text: ", " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
          vi: "Thật ra …, …, ….",
          example: "Honestly, it can be stressful at first, but I try to stay calm, then I can handle the deadline.",
        }],
      },
    ],
  },

  // ── Hometown ───────────────────────────────────────────────
  "hometown-01": {
    title: "Where do you come from?",
    vi: "Bạn đến từ đâu?",
    vocab: [{ term: "be known for", pos: "v", vi: "nổi tiếng về", ipa: "bi nəʊn fɔː" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Quê", g2: "Vùng", g3: "Đặc trưng" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "I come from Nga Son", vi: "Tôi đến từ Nga Sơn", ipa: "aɪ kʌm frəm ˈŋɑː sɒn" },
        { en: "I was born and raised in Nga Son", vi: "Tôi sinh ra và lớn lên ở Nga Sơn", ipa: "aɪ wəz bɔːn ænd reɪzd ɪn ˈŋɑː sɒn" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "which is in Thanh Hoa Province", vi: "thuộc tỉnh Thanh Hóa", ipa: "wɪtʃ ɪz ɪn θæn hwɑː ˈprɒvɪns" },
        { en: "in the north-central part of Vietnam", vi: "ở khu vực Bắc Trung Bộ", ipa: "ɪn ðə nɔːθ ˈsentrəl pɑːt əv ˌvjetˈnɑːm" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "It's known for Tu Thuc Cave", vi: "Nơi đây nổi tiếng với động Từ Thức", ipa: "ɪts nəʊn fə tuː θʊk keɪv" },
        { en: "It's a peaceful place with friendly people", vi: "Đó là nơi yên bình, người dân thân thiện", ipa: "ɪts ə ˈpiːsfl pleɪs wɪð ˈfrendli ˈpiːpl" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: ", " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "Tôi đến từ …, …. ….",
        example: "I come from Nga Son, which is in Thanh Hoa Province. It's known for Tu Thuc Cave.",
      }],
    }],
  },
  "hometown-02": {
    title: "What do you like the most about your hometown?",
    vi: "Bạn thích nhất điều gì ở quê mình?",
    vocab: [{ term: "peaceful atmosphere", pos: "n", vi: "không khí yên bình", ipa: "ˈpiːsfl ˈætməsfɪə" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Điều thích nhất", g2: "Lợi ích", g3: "Chi tiết" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "What I like most is the peaceful atmosphere", vi: "Tôi thích nhất không khí yên bình", ipa: "wɒt aɪ laɪk məʊst ɪz ðə ˈpiːsfl ˈætməsfɪə" },
        { en: "My favourite thing is the fresh air", vi: "Điều tôi thích nhất là không khí trong lành", ipa: "maɪ ˈfeɪvərɪt θɪŋ ɪz ðə freʃ eə" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "I can relax and relieve stress", vi: "tôi được thư giãn, giảm căng thẳng", ipa: "aɪ kən rɪˈlæks ænd rɪˈliːv stres" },
        { en: "life there is slow and calm", vi: "cuộc sống chậm rãi, bình yên", ipa: "laɪf ðeər ɪz sləʊ ænd kɑːm" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "I can spend time with my family", vi: "tôi có thời gian bên gia đình", ipa: "aɪ kən spend taɪm wɪð maɪ ˈfæməli" },
        { en: "the food is delicious and cheap", vi: "đồ ăn ngon và rẻ", ipa: "ðə fuːd ɪz dɪˈlɪʃəs ænd tʃiːp" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: " because " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "Tôi thích nhất … vì …. ….",
        example: "What I like most is the peaceful atmosphere because I can relax and relieve stress. I can spend time with my family.",
      }],
    }],
  },
  "hometown-03": {
    title: "Is there anything you don't like about your hometown?",
    vi: "Có điều gì bạn không thích ở quê mình không?",
    vocab: [{ term: "job opportunities", pos: "n", vi: "cơ hội việc làm", ipa: "dʒɒb ˌɒpəˈtjuːnətiz" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Điều không thích", g2: "Chi tiết", g3: "Hệ quả" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "There aren't many job opportunities", vi: "Không có nhiều cơ hội việc làm", ipa: "ðeər ɑːnt ˈmeni dʒɒb ˌɒpəˈtjuːnətiz" },
        { en: "One thing I don't like is the lack of jobs", vi: "Điều tôi không thích là thiếu việc làm", ipa: "wʌn θɪŋ aɪ dəʊnt laɪk ɪz ðə læk əv dʒɒbz" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "especially in IT", vi: "nhất là trong ngành IT", ipa: "ɪˈspeʃəli ɪn ˌaɪˈtiː" },
        { en: "there are fewer entertainment facilities", vi: "ít tiện ích giải trí hơn", ipa: "ðeər ɑː ˈfjuːər ˌentəˈteɪnmənt fəˈsɪlətiz" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "that's why I moved to Hanoi to work", vi: "nên tôi chuyển ra Hà Nội làm việc", ipa: "ðæts waɪ aɪ muːvd tə hɑːˈnɔɪ tə wɜːk" },
        { en: "so many young people leave for big cities", vi: "nên nhiều người trẻ lên thành phố lớn", ipa: "səʊ ˈmeni jʌŋ ˈpiːpl liːv fə bɪɡ ˈsɪtiz" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: ", " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "…, …. ….",
        example: "There aren't many job opportunities, especially in IT. That's why I moved to Hanoi to work.",
      }],
    }],
  },
  "hometown-04": {
    title: "Where do young people in your town meet their friends?",
    vi: "Người trẻ ở quê bạn thường gặp bạn bè ở đâu?",
    vocab: [{ term: "hang out", pos: "v", vi: "đi chơi, tụ tập", ipa: "hæŋ aʊt" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Địa điểm", g2: "Hoạt động", g3: "Thêm" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "Young people often hang out at coffee shops", vi: "Người trẻ hay tụ tập ở quán cà phê", ipa: "jʌŋ ˈpiːpl ˈɒfn hæŋ aʊt ət ˈkɒfi ʃɒps" },
        { en: "They usually meet at local cafés", vi: "Họ thường gặp nhau ở quán cà phê gần đó", ipa: "ðeɪ ˈjuːʒuəli miːt ət ˈləʊkl ˈkæfeɪz" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "they drink coffee and chat", vi: "họ uống cà phê và trò chuyện", ipa: "ðeɪ drɪŋk ˈkɒfi ænd tʃæt" },
        { en: "they talk about their daily lives", vi: "họ nói về cuộc sống hằng ngày", ipa: "ðeɪ tɔːk əˈbaʊt ðeə ˈdeɪli laɪvz" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "some of them play sports together", vi: "một số chơi thể thao cùng nhau", ipa: "sʌm əv ðəm pleɪ spɔːts təˈɡeðə" },
        { en: "others go to local parks", vi: "số khác ra công viên gần nhà", ipa: "ˈʌðəz ɡəʊ tə ˈləʊkl pɑːks" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: ". " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "…. …. ….",
        example: "Young people often hang out at coffee shops. They drink coffee and chat. Some of them play sports together.",
      }],
    }],
  },

  // ── Transport ──────────────────────────────────────────────
  "transport-01": {
    title: "What is the traffic like in your city/hometown?",
    vi: "Giao thông ở thành phố/quê bạn thế nào?",
    vocab: [{ term: "rush hour", pos: "n", vi: "giờ cao điểm", ipa: "rʌʃ aʊə" }, { term: "traffic jam", pos: "n", vi: "tắc đường", ipa: "ˈtræfɪk dʒæm" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Tình hình", g2: "Khi nào", g3: "Hệ quả" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "The traffic in Hanoi is very heavy", vi: "Giao thông Hà Nội rất đông", ipa: "ðə ˈtræfɪk ɪn hɑːˈnɔɪ ɪz ˈveri ˈhevi" },
        { en: "Traffic here is quite busy", vi: "Giao thông ở đây khá đông", ipa: "ˈtræfɪk hɪər ɪz kwaɪt ˈbɪzi" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "especially during rush hour", vi: "nhất là vào giờ cao điểm", ipa: "ɪˈspeʃəli ˈdjʊərɪŋ rʌʃ aʊə" },
        { en: "people often get stuck in traffic jams", vi: "mọi người hay bị tắc đường", ipa: "ˈpiːpl ˈɒfn ɡet stʌk ɪn ˈtræfɪk dʒæmz" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "it wastes a lot of time", vi: "nó tốn nhiều thời gian", ipa: "ɪt weɪsts ə lɒt əv taɪm" },
        { en: "it also causes air pollution", vi: "và gây ô nhiễm không khí", ipa: "ɪt ˈɔːlsəʊ ˈkɔːzɪz eə pəˈluːʃn" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: ", " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "…, …. ….",
        example: "The traffic in Hanoi is very heavy, especially during rush hour. It wastes a lot of time.",
      }],
    }],
  },
  "transport-02": {
    title: "What is your favourite mode of transport?",
    vi: "Phương tiện bạn thích nhất là gì?",
    vocab: [{ term: "commute", pos: "v", vi: "đi lại (đi làm)", ipa: "kəˈmjuːt" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Phương tiện", g2: "Lý do", g3: "Chi tiết" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "My favourite mode of transport is the motorbike", vi: "Phương tiện tôi thích nhất là xe máy", ipa: "maɪ ˈfeɪvərɪt məʊd əv ˈtrænspɔːt ɪz ðə ˈməʊtəbaɪk" },
        { en: "I like travelling by motorbike", vi: "Tôi thích đi lại bằng xe máy", ipa: "aɪ laɪk ˈtrævlɪŋ baɪ ˈməʊtəbaɪk" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "because it's convenient", vi: "vì nó tiện lợi", ipa: "bɪˈkɒz ɪts kənˈviːniənt" },
        { en: "because it's fast and flexible", vi: "vì nhanh và linh hoạt", ipa: "bɪˈkɒz ɪts fɑːst ænd ˈfleksəbl" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "I use it to commute to work", vi: "tôi dùng nó để đi làm", ipa: "aɪ juːz ɪt tə kəˈmjuːt tə wɜːk" },
        { en: "I can move through narrow streets easily", vi: "tôi luồn qua đường nhỏ dễ dàng", ipa: "aɪ kən muːv θruː ˈnærəʊ striːts ˈiːzəli" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: " " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "… …. ….",
        example: "My favourite mode of transport is the motorbike because it's convenient. I use it to commute to work.",
      }],
    }],
  },
  "transport-03": {
    title: "Do you ever use public transport?",
    vi: "Bạn có dùng phương tiện công cộng không?",
    vocab: [{ term: "public transport", pos: "n", vi: "phương tiện công cộng", ipa: "ˈpʌblɪk ˈtrænspɔːt" }],
    scenarios: [
      {
        name: "Hiếm khi (Rarely)", vi: "", labels: { g1: "Trả lời", g2: "Lý do", g3: "Khi nào" }, g2DependsOnG1: false, g2Prompt: "",
        g1: [{ en: "I rarely use public transport", vi: "Tôi hiếm khi dùng phương tiện công cộng", ipa: "aɪ ˈreəli juːz ˈpʌblɪk ˈtrænspɔːt" }],
        g2groups: [{ name: "", vi: "", items: [
          { en: "because I usually travel by motorbike", vi: "vì tôi thường đi xe máy", ipa: "bɪˈkɒz aɪ ˈjuːʒuəli ˈtrævl baɪ ˈməʊtəbaɪk" },
          { en: "it's more convenient for me", vi: "nó tiện cho tôi hơn", ipa: "ɪts mɔː kənˈviːniənt fə miː" },
        ] }],
        g3groups: [{ name: "", vi: "", items: [
          { en: "but I sometimes take a bus for long distances", vi: "nhưng đôi khi tôi đi bus đường dài", ipa: "bət aɪ ˈsʌmtaɪmz teɪk ə bʌs fə lɒŋ ˈdɪstənsɪz" },
          { en: "it's a good way to save money", vi: "là cách tiết kiệm tiền", ipa: "ɪts ə ɡʊd weɪ tə seɪv ˈmʌni" },
        ] }],
        structs: [{
          parts: [{ type: "slot", slot: 1 }, { type: "text", text: " " }, { type: "slot", slot: 2 }, { type: "text", text: ", " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
          vi: "… …, ….",
          example: "I rarely use public transport because I usually travel by motorbike, but I sometimes take a bus for long distances.",
        }],
      },
      {
        name: "Có (Yes)", vi: "", labels: { g1: "Trả lời", g2: "Lý do", g3: "Lợi ích" }, g2DependsOnG1: false, g2Prompt: "",
        g1: [{ en: "Yes, I sometimes use public transport", vi: "Có, đôi khi tôi dùng phương tiện công cộng", ipa: "jes aɪ ˈsʌmtaɪmz juːz ˈpʌblɪk ˈtrænspɔːt" }],
        g2groups: [{ name: "", vi: "", items: [
          { en: "I take the bus to save money", vi: "tôi đi bus để tiết kiệm", ipa: "aɪ teɪk ðə bʌs tə seɪv ˈmʌni" },
          { en: "it's cheaper than driving", vi: "rẻ hơn tự lái", ipa: "ɪts ˈtʃiːpə ðən ˈdraɪvɪŋ" },
        ] }],
        g3groups: [{ name: "", vi: "", items: [
          { en: "I can relax on the way", vi: "tôi được thư giãn trên đường", ipa: "aɪ kən rɪˈlæks ɒn ðə weɪ" },
          { en: "I don't have to find parking", vi: "tôi không phải tìm chỗ đậu xe", ipa: "aɪ dəʊnt hæv tə faɪnd ˈpɑːkɪŋ" },
        ] }],
        structs: [{
          parts: [{ type: "slot", slot: 1 }, { type: "text", text: " because " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
          vi: "Có, … vì …. ….",
          example: "Yes, I sometimes use public transport because I take the bus to save money. I can relax on the way.",
        }],
      },
    ],
  },
  "transport-06": {
    title: "What kind of transport do most people use in your city/hometown?",
    vi: "Ở nơi bạn sống, phần lớn mọi người dùng phương tiện gì?",
    vocab: [{ term: "affordable", pos: "adj", vi: "giá phải chăng", ipa: "əˈfɔːdəbl" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Phương tiện", g2: "Lý do", g3: "Chi tiết" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "Most people travel by motorbike", vi: "Phần lớn mọi người đi xe máy", ipa: "məʊst ˈpiːpl ˈtrævl baɪ ˈməʊtəbaɪk" },
        { en: "Motorbikes are the most common here", vi: "Xe máy phổ biến nhất ở đây", ipa: "ˈməʊtəbaɪks ɑː ðə məʊst ˈkɒmən hɪə" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "because it's convenient and affordable", vi: "vì tiện lợi và giá phải chăng", ipa: "bɪˈkɒz ɪts kənˈviːniənt ænd əˈfɔːdəbl" },
        { en: "it suits daily travel in the city", vi: "hợp với việc đi lại hằng ngày trong phố", ipa: "ɪt suːts ˈdeɪli ˈtrævl ɪn ðə ˈsɪti" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "they can move through traffic easily", vi: "họ luồn qua dòng xe dễ dàng", ipa: "ðeɪ kən muːv θruː ˈtræfɪk ˈiːzəli" },
        { en: "it's cheaper than a car", vi: "rẻ hơn ô tô", ipa: "ɪts ˈtʃiːpə ðən ə kɑː" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: " " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "… …. ….",
        example: "Most people travel by motorbike because it's convenient and affordable. They can move through traffic easily.",
      }],
    }],
  },

  // ── Healthy Lifestyles ─────────────────────────────────────
  "healthy-02": {
    title: "Is there any bad habit that you want to break?",
    vi: "Bạn muốn bỏ thói quen xấu nào?",
    vocab: [{ term: "stay up late", pos: "v", vi: "thức khuya", ipa: "steɪ ʌp leɪt" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Thói quen", g2: "Lý do", g3: "Cách bỏ" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "I want to stop staying up late", vi: "Tôi muốn bỏ thức khuya", ipa: "aɪ wɒnt tə stɒp ˈsteɪɪŋ ʌp leɪt" },
        { en: "One bad habit is staying up late", vi: "Một thói quen xấu là thức khuya", ipa: "wʌn bæd ˈhæbɪt ɪz ˈsteɪɪŋ ʌp leɪt" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "because it's bad for my health", vi: "vì nó hại sức khỏe", ipa: "bɪˈkɒz ɪts bæd fə maɪ helθ" },
        { en: "I often feel tired at work", vi: "tôi hay mệt khi làm việc", ipa: "aɪ ˈɒfn fiːl ˈtaɪəd ət wɜːk" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "I'm trying to go to bed earlier", vi: "tôi đang cố ngủ sớm hơn", ipa: "aɪm ˈtraɪɪŋ tə ɡəʊ tə bed ˈɜːliə" },
        { en: "I want to get enough sleep", vi: "tôi muốn ngủ đủ giấc", ipa: "aɪ wɒnt tə ɡet ɪˈnʌf sliːp" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: " because " }, { type: "slot", slot: 2 }, { type: "text", text: ", so " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "… vì …, nên ….",
        example: "I want to stop staying up late because it's bad for my health, so I'm trying to go to bed earlier.",
      }],
    }],
  },
  "healthy-03": {
    title: "Is it important to you to eat healthy food?",
    vi: "Ăn uống lành mạnh có quan trọng với bạn không?",
    vocab: [{ term: "balanced diet", pos: "n", vi: "chế độ ăn cân bằng", ipa: "ˈbælənst ˈdaɪət" }, { term: "cut down on", pos: "v", vi: "giảm bớt", ipa: "kʌt daʊn ɒn" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Trả lời", g2: "Lý do", g3: "Thói quen" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "Yes, it's very important to me", vi: "Có, nó rất quan trọng với tôi", ipa: "jes ɪts ˈveri ɪmˈpɔːtənt tə miː" },
        { en: "Yes, definitely", vi: "Có, chắc chắn rồi", ipa: "jes ˈdefɪnətli" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "it helps me stay healthy", vi: "nó giúp tôi khỏe mạnh", ipa: "ɪt helps miː steɪ ˈhelθi" },
        { en: "it gives me energy for work", vi: "nó cho tôi năng lượng để làm việc", ipa: "ɪt ɡɪvz miː ˈenədʒi fə wɜːk" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "I usually eat chicken, eggs and vegetables", vi: "tôi thường ăn gà, trứng và rau", ipa: "aɪ ˈjuːʒuəli iːt ˈtʃɪkɪn eɡz ænd ˈvedʒtəblz" },
        { en: "I try to cut down on fast food", vi: "tôi cố giảm đồ ăn nhanh", ipa: "aɪ traɪ tə kʌt daʊn ɒn fɑːst fuːd" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: " because " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "… vì …. ….",
        example: "Yes, it's very important to me because it helps me stay healthy. I usually eat chicken, eggs and vegetables.",
      }],
    }],
  },
  "healthy-05": {
    title: "Do you do any exercise?",
    vi: "Bạn có tập thể dục không?",
    vocab: [{ term: "work out", pos: "v", vi: "tập gym", ipa: "wɜːk aʊt" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Trả lời", g2: "Hoạt động", g3: "Lợi ích" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "Yes, I do", vi: "Có, tôi có tập", ipa: "jes aɪ duː" },
        { en: "Yes, I exercise regularly", vi: "Có, tôi tập đều đặn", ipa: "jes aɪ ˈeksəsaɪz ˈreɡjələli" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "I work out at the gym during lunch", vi: "tôi tập gym giờ nghỉ trưa", ipa: "aɪ wɜːk aʊt ət ðə dʒɪm ˈdjʊərɪŋ lʌntʃ" },
        { en: "I play badminton after work", vi: "tôi chơi cầu lông sau giờ làm", ipa: "aɪ pleɪ ˈbædmɪntən ˈɑːftə wɜːk" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "it helps me keep fit", vi: "nó giúp tôi giữ dáng", ipa: "ɪt helps miː kiːp fɪt" },
        { en: "it relieves stress", vi: "nó giảm căng thẳng", ipa: "ɪt rɪˈliːvz stres" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: ". " }, { type: "slot", slot: 2 }, { type: "text", text: ", and " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "…. …, và ….",
        example: "Yes, I do. I work out at the gym during lunch, and it helps me keep fit.",
      }],
    }],
  },

  // ── Family and Relations ───────────────────────────────────
  "family-01": {
    title: "Do you have a large or small family?",
    vi: "Gia đình bạn đông hay ít người?",
    vocab: [{ term: "nuclear family", pos: "n", vi: "gia đình hạt nhân", ipa: "ˈnjuːklɪə ˈfæməli" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Kiểu gia đình", g2: "Số người", g3: "Chi tiết" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "I come from a nuclear family", vi: "Tôi thuộc gia đình hạt nhân", ipa: "aɪ kʌm frəm ə ˈnjuːklɪə ˈfæməli" },
        { en: "I have a small family", vi: "Gia đình tôi ít người", ipa: "aɪ hæv ə smɔːl ˈfæməli" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "there are four of us", vi: "nhà tôi có bốn người", ipa: "ðeər ɑː fɔːr əv ʌs" },
        { en: "my parents, my sister and me", vi: "bố mẹ, em gái và tôi", ipa: "maɪ ˈpeərənts maɪ ˈsɪstər ænd miː" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "my parents are tailors", vi: "bố mẹ tôi làm thợ may", ipa: "maɪ ˈpeərənts ɑː ˈteɪləz" },
        { en: "my sister is a university student", vi: "em gái tôi là sinh viên", ipa: "maɪ ˈsɪstər ɪz ə ˌjuːnɪˈvɜːsəti ˈstjuːdnt" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: ". There are " }, { type: "slot", slot: 2 }, { type: "text", text: ": " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "…. Nhà tôi có …: ….",
        example: "I come from a nuclear family. There are four of us: my parents, my sister and me.",
      }],
    }],
  },
  "family-02": {
    title: "How much time do you spend with your family?",
    vi: "Bạn dành bao nhiêu thời gian cho gia đình?",
    vocab: [{ term: "quality time", pos: "n", vi: "thời gian chất lượng", ipa: "ˈkwɒləti taɪm" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Thực tế", g2: "Lý do", g3: "Bù đắp" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "I can't spend much time with my family", vi: "Tôi không dành được nhiều thời gian cho gia đình", ipa: "aɪ kɑːnt spend mʌtʃ taɪm wɪð maɪ ˈfæməli" },
        { en: "I don't have a lot of time with them", vi: "Tôi không có nhiều thời gian bên họ", ipa: "aɪ dəʊnt hæv ə lɒt əv taɪm wɪð ðəm" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "because I work in Hanoi", vi: "vì tôi làm việc ở Hà Nội", ipa: "bɪˈkɒz aɪ wɜːk ɪn hɑːˈnɔɪ" },
        { en: "I live far from home", vi: "tôi sống xa nhà", ipa: "aɪ lɪv fɑː frəm həʊm" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "but I call my parents often", vi: "nhưng tôi hay gọi cho bố mẹ", ipa: "bət aɪ kɔːl maɪ ˈpeərənts ˈɒfn" },
        { en: "I go home on holidays to spend quality time", vi: "tôi về quê dịp lễ để bên gia đình", ipa: "aɪ ɡəʊ həʊm ɒn ˈhɒlədeɪz tə spend ˈkwɒləti taɪm" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: " " }, { type: "slot", slot: 2 }, { type: "text", text: ", " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "… …, ….",
        example: "I can't spend much time with my family because I work in Hanoi, but I call my parents often.",
      }],
    }],
  },
  "family-03": {
    title: "What do you like to do together as a family?",
    vi: "Gia đình bạn thích làm gì cùng nhau?",
    vocab: [{ term: "strengthen family bonds", pos: "v", vi: "gắn kết gia đình", ipa: "ˈstreŋθən ˈfæməli bɒndz" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Hoạt động", g2: "Thêm", g3: "Ý nghĩa" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "We enjoy having dinner together", vi: "Chúng tôi thích ăn tối cùng nhau", ipa: "wi ɪnˈdʒɔɪ ˈhævɪŋ ˈdɪnə təˈɡeðə" },
        { en: "We like eating meals together", vi: "Chúng tôi thích ăn cơm chung", ipa: "wi laɪk ˈiːtɪŋ miːlz təˈɡeðə" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "and talking about our daily lives", vi: "và nói về cuộc sống hằng ngày", ipa: "ænd ˈtɔːkɪŋ əˈbaʊt aʊə ˈdeɪli laɪvz" },
        { en: "sometimes we visit our relatives", vi: "đôi khi chúng tôi thăm họ hàng", ipa: "ˈsʌmtaɪmz wi ˈvɪzɪt aʊə ˈrelətɪvz" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "it helps us strengthen family bonds", vi: "giúp gắn kết gia đình", ipa: "ɪt helps ʌs ˈstreŋθən ˈfæməli bɒndz" },
        { en: "we feel closer to each other", vi: "chúng tôi thân nhau hơn", ipa: "wi fiːl ˈkləʊsə tu iːtʃ ˈʌðə" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: " " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "… …. ….",
        example: "We enjoy having dinner together and talking about our daily lives. It helps us strengthen family bonds.",
      }],
    }],
  },
  "family-05": {
    title: "Do you get along well with your family members?",
    vi: "Bạn có hòa thuận với người nhà không?",
    vocab: [{ term: "get along well with", pos: "v", vi: "hòa thuận với", ipa: "ɡet əˈlɒŋ wel wɪð" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Trả lời", g2: "Chi tiết", g3: "Thêm" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "Yes, I get along well with my family", vi: "Có, tôi hòa thuận với gia đình", ipa: "jes aɪ ɡet əˈlɒŋ wel wɪð maɪ ˈfæməli" },
        { en: "Yes, definitely", vi: "Có, chắc chắn rồi", ipa: "jes ˈdefɪnətli" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "we often share our problems", vi: "chúng tôi hay chia sẻ khó khăn", ipa: "wi ˈɒfn ʃeər aʊə ˈprɒbləmz" },
        { en: "we support each other", vi: "chúng tôi hỗ trợ nhau", ipa: "wi səˈpɔːt iːtʃ ˈʌðə" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "my family encourages me to work hard", vi: "gia đình động viên tôi cố gắng", ipa: "maɪ ˈfæməli ɪnˈkʌrɪdʒɪz miː tə wɜːk hɑːd" },
        { en: "we rarely argue", vi: "chúng tôi hiếm khi cãi nhau", ipa: "wi ˈreəli ˈɑːɡjuː" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: " because " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "… vì …. ….",
        example: "Yes, I get along well with my family because we often share our problems. My family encourages me to work hard.",
      }],
    }],
  },
  "family-06": {
    title: "Who are you closest to in your family?",
    vi: "Bạn thân với ai nhất trong gia đình?",
    vocab: [{ term: "useful advice", pos: "n", vi: "lời khuyên hữu ích", ipa: "ˈjuːsfl ədˈvaɪs" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Người", g2: "Lý do", g3: "Chi tiết" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "I'm closest to my mother", vi: "Tôi thân nhất với mẹ", ipa: "aɪm ˈkləʊsɪst tə maɪ ˈmʌðə" },
        { en: "I feel closest to my mum", vi: "Tôi thấy gần gũi mẹ nhất", ipa: "aɪ fiːl ˈkləʊsɪst tə maɪ mʌm" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "because she understands me very well", vi: "vì mẹ rất hiểu tôi", ipa: "bɪˈkɒz ʃi ˌʌndəˈstændz miː ˈveri wel" },
        { en: "we can talk about everything", vi: "chúng tôi nói được mọi chuyện", ipa: "wi kən tɔːk əˈbaʊt ˈevriθɪŋ" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "she always gives me useful advice", vi: "mẹ luôn cho tôi lời khuyên hữu ích", ipa: "ʃi ˈɔːlweɪz ɡɪvz miː ˈjuːsfl ədˈvaɪs" },
        { en: "I can share my problems with her", vi: "tôi chia sẻ khó khăn với mẹ", ipa: "aɪ kən ʃeə maɪ ˈprɒbləmz wɪð hɜː" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: " because " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "… vì …. ….",
        example: "I'm closest to my mother because she understands me very well. She always gives me useful advice.",
      }],
    }],
  },

  // ── Friends ────────────────────────────────────────────────
  "friends-01": {
    title: "Do you have close friends?",
    vi: "Bạn có bạn thân không?",
    vocab: [{ term: "have a lot in common", pos: "phrase", vi: "có nhiều điểm chung", ipa: "hæv ə lɒt ɪn ˈkɒmən" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Trả lời", g2: "Họ là ai", g3: "Chi tiết" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "Yes, I have some close friends", vi: "Có, tôi có vài người bạn thân", ipa: "jes aɪ hæv sʌm kləʊs frendz" },
        { en: "Yes, I have a few close friends", vi: "Có, tôi có mấy người bạn thân", ipa: "jes aɪ hæv ə fjuː kləʊs frendz" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "from university and work", vi: "từ hồi đại học và chỗ làm", ipa: "frəm ˌjuːnɪˈvɜːsəti ænd wɜːk" },
        { en: "we've known each other for years", vi: "chúng tôi quen nhau nhiều năm", ipa: "wiv nəʊn iːtʃ ˈʌðə fə jɪəz" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "we have a lot in common", vi: "chúng tôi có nhiều điểm chung", ipa: "wi hæv ə lɒt ɪn ˈkɒmən" },
        { en: "we help each other with problems", vi: "chúng tôi giúp nhau lúc khó khăn", ipa: "wi help iːtʃ ˈʌðə wɪð ˈprɒbləmz" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: " " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "… …. ….",
        example: "Yes, I have some close friends from university and work. We have a lot in common.",
      }],
    }],
  },
  "friends-02": {
    title: "Who is your best friend? What do you like the most about him/her?",
    vi: "Bạn thân nhất là ai? Bạn thích nhất điều gì ở người đó?",
    vocab: [{ term: "reliable", pos: "adj", vi: "đáng tin cậy", ipa: "rɪˈlaɪəbl" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Là ai", g2: "Tính cách", g3: "Điều thích nhất" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "My best friend is someone I met at university", vi: "Bạn thân nhất của tôi quen từ đại học", ipa: "maɪ best frend ɪz ˈsʌmwʌn aɪ met ət ˌjuːnɪˈvɜːsəti" },
        { en: "My best friend is an old classmate", vi: "Bạn thân nhất là bạn học cũ", ipa: "maɪ best frend ɪz ən əʊld ˈklɑːsmeɪt" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "he is friendly, helpful and reliable", vi: "cậu ấy thân thiện, nhiệt tình và đáng tin", ipa: "hi ɪz ˈfrendli ˈhelpfl ænd rɪˈlaɪəbl" },
        { en: "he is kind-hearted and honest", vi: "cậu ấy tốt bụng và thật thà", ipa: "hi ɪz ˈkaɪnd ˈhɑːtɪd ænd ˈɒnɪst" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "he always gives me useful advice", vi: "cậu ấy luôn cho tôi lời khuyên hữu ích", ipa: "hi ˈɔːlweɪz ɡɪvz miː ˈjuːsfl ədˈvaɪs" },
        { en: "he's always there for me", vi: "cậu ấy luôn bên tôi khi cần", ipa: "hiz ˈɔːlweɪz ðeə fə miː" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: ". " }, { type: "slot", slot: 2 }, { type: "text", text: ". What I like most is that " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "…. …. Điều tôi thích nhất là ….",
        example: "My best friend is someone I met at university. He is friendly, helpful and reliable. What I like most is that he always gives me useful advice.",
      }],
    }],
  },
  "friends-03": {
    title: "How often do you hang out with your friends?",
    vi: "Bạn đi chơi với bạn bè bao lâu một lần?",
    vocab: [{ term: "hang out", pos: "v", vi: "đi chơi, tụ tập", ipa: "hæŋ aʊt" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Tần suất", g2: "Hoạt động", g3: "Cảm nhận" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "I usually hang out with my friends at weekends", vi: "Tôi thường đi chơi với bạn vào cuối tuần", ipa: "aɪ ˈjuːʒuəli hæŋ aʊt wɪð maɪ frendz ət ˈwiːkendz" },
        { en: "I meet my friends about once a week", vi: "Tôi gặp bạn khoảng một lần một tuần", ipa: "aɪ miːt maɪ frendz əˈbaʊt wʌns ə wiːk" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "we often play badminton or have dinner", vi: "chúng tôi hay chơi cầu lông hoặc ăn tối", ipa: "wi ˈɒfn pleɪ ˈbædmɪntən ɔː hæv ˈdɪnə" },
        { en: "we go for coffee and chat", vi: "chúng tôi đi cà phê và trò chuyện", ipa: "wi ɡəʊ fə ˈkɒfi ænd tʃæt" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "it helps me relieve stress", vi: "nó giúp tôi giảm căng thẳng", ipa: "ɪt helps miː rɪˈliːv stres" },
        { en: "we always have a good time", vi: "chúng tôi luôn vui vẻ", ipa: "wi ˈɔːlweɪz hæv ə ɡʊd taɪm" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: ". " }, { type: "slot", slot: 2 }, { type: "text", text: ", and " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "…. …, và ….",
        example: "I usually hang out with my friends at weekends. We often play badminton or have dinner, and it helps me relieve stress.",
      }],
    }],
  },
  "friends-04": {
    title: "How do you keep in touch with your friends?",
    vi: "Bạn giữ liên lạc với bạn bè bằng cách nào?",
    vocab: [{ term: "keep in touch", pos: "v", vi: "giữ liên lạc", ipa: "kiːp ɪn tʌtʃ" }, { term: "in person", pos: "phrase", vi: "trực tiếp", ipa: "ɪn ˈpɜːsn" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Cách", g2: "Chi tiết", g3: "Thêm" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "I keep in touch through social media", vi: "Tôi giữ liên lạc qua mạng xã hội", ipa: "aɪ kiːp ɪn tʌtʃ θruː ˈsəʊʃl ˈmiːdiə" },
        { en: "I usually text them on Zalo and Facebook", vi: "Tôi hay nhắn Zalo và Facebook", ipa: "aɪ ˈjuːʒuəli tekst ðəm ɒn ˈzɑːləʊ ænd ˈfeɪsbʊk" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "we send messages and share photos", vi: "chúng tôi nhắn tin và chia sẻ ảnh", ipa: "wi send ˈmesɪdʒɪz ænd ʃeə ˈfəʊtəʊz" },
        { en: "we chat online almost every day", vi: "chúng tôi chat gần như mỗi ngày", ipa: "wi tʃæt ˈɒnlaɪn ˈɔːlməʊst ˈevri deɪ" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "when we're free, we meet in person", vi: "lúc rảnh, chúng tôi gặp trực tiếp", ipa: "wen wɪə friː wi miːt ɪn ˈpɜːsn" },
        { en: "we call each other now and then", vi: "thỉnh thoảng chúng tôi gọi nhau", ipa: "wi kɔːl iːtʃ ˈʌðə naʊ ænd ðen" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: ". " }, { type: "slot", slot: 2 }, { type: "text", text: ", and " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "…. …, và ….",
        example: "I keep in touch through social media. We send messages and share photos, and when we're free, we meet in person.",
      }],
    }],
  },
  "friends-05": {
    title: "Have you ever had a fight with your friends?",
    vi: "Bạn từng cãi nhau với bạn bè chưa?",
    vocab: [{ term: "make up", pos: "v", vi: "làm hòa", ipa: "meɪk ʌp" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Trả lời", g2: "Lý do", g3: "Kết quả" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "Yes, I have, once or twice", vi: "Có, một hai lần rồi", ipa: "jes aɪ hæv wʌns ɔː twaɪs" },
        { en: "Yes, we had a small argument once", vi: "Có, chúng tôi từng cãi nhẹ một lần", ipa: "jes wi hæd ə smɔːl ˈɑːɡjumənt wʌns" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "sometimes we have different opinions", vi: "đôi khi chúng tôi bất đồng ý kiến", ipa: "ˈsʌmtaɪmz wi hæv ˈdɪfrənt əˈpɪnjənz" },
        { en: "it was just a misunderstanding", vi: "chỉ là hiểu nhầm thôi", ipa: "ɪt wəz dʒʌst ə ˌmɪsʌndəˈstændɪŋ" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "but we talked and made up", vi: "nhưng chúng tôi nói chuyện rồi làm hòa", ipa: "bət wi tɔːkt ænd meɪd ʌp" },
        { en: "now we understand each other better", vi: "giờ chúng tôi hiểu nhau hơn", ipa: "naʊ wi ˌʌndəˈstænd iːtʃ ˈʌðə ˈbetə" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: ". " }, { type: "slot", slot: 2 }, { type: "text", text: ", " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "…. …, ….",
        example: "Yes, I have, once or twice. Sometimes we have different opinions, but we talked and made up.",
      }],
    }],
  },
  "friends-06": {
    title: "Do you have any online friends?",
    vi: "Bạn có bạn quen qua mạng không?",
    vocab: [{ term: "share ideas", pos: "v", vi: "chia sẻ ý tưởng", ipa: "ʃeər aɪˈdɪəz" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Trả lời", g2: "Họ là ai", g3: "Chi tiết" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "Yes, I have some online friends", vi: "Có, tôi có vài người bạn trên mạng", ipa: "jes aɪ hæv sʌm ˈɒnlaɪn frendz" },
        { en: "Yes, I've made friends online", vi: "Có, tôi có kết bạn qua mạng", ipa: "jes aɪv meɪd frendz ˈɒnlaɪn" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "who are interested in technology", vi: "những người mê công nghệ", ipa: "huː ɑː ˈɪntrəstɪd ɪn tekˈnɒlədʒi" },
        { en: "we met in an online group", vi: "chúng tôi quen trong một nhóm online", ipa: "wi met ɪn ən ˈɒnlaɪn ɡruːp" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "we often share ideas", vi: "chúng tôi hay chia sẻ ý tưởng", ipa: "wi ˈɒfn ʃeər aɪˈdɪəz" },
        { en: "it helps me learn new things", vi: "nó giúp tôi học điều mới", ipa: "ɪt helps miː lɜːn njuː θɪŋz" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: " " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "… …. ….",
        example: "Yes, I have some online friends who are interested in technology. We often share ideas.",
      }],
    }],
  },
  "friends-07": {
    title: "Do you find it difficult to make new friends?",
    vi: "Bạn có thấy khó kết bạn mới không?",
    vocab: [{ term: "shared interests", pos: "n", vi: "sở thích chung", ipa: "ʃeəd ˈɪntrəsts" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Trả lời", g2: "Lý do", g3: "Cách làm" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "No, I don't find it too difficult", vi: "Không, tôi không thấy quá khó", ipa: "nəʊ aɪ dəʊnt faɪnd ɪt tuː ˈdɪfɪkəlt" },
        { en: "Not really, I'm quite sociable", vi: "Không hẳn, tôi khá hòa đồng", ipa: "nɒt ˈrɪəli aɪm kwaɪt ˈsəʊʃəbl" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "because I'm friendly and open", vi: "vì tôi thân thiện và cởi mở", ipa: "bɪˈkɒz aɪm ˈfrendli ænd ˈəʊpən" },
        { en: "I enjoy talking to new people", vi: "tôi thích nói chuyện với người mới", ipa: "aɪ ɪnˈdʒɔɪ ˈtɔːkɪŋ tə njuː ˈpiːpl" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "I usually start with work or sports", vi: "tôi thường bắt đầu từ công việc hoặc thể thao", ipa: "aɪ ˈjuːʒuəli stɑːt wɪð wɜːk ɔː spɔːts" },
        { en: "shared interests make it easier", vi: "sở thích chung giúp dễ hơn", ipa: "ʃeəd ˈɪntrəsts meɪk ɪt ˈiːziə" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: " because " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "… vì …. ….",
        example: "No, I don't find it too difficult because I'm friendly and open. I usually start with work or sports.",
      }],
    }],
  },

  // ── Hobbies ────────────────────────────────────────────────
  "hobbies-01": {
    title: "What do you do in your free time?",
    vi: "Lúc rảnh bạn làm gì?",
    vocab: [{ term: "in my free time", pos: "phrase", vi: "lúc rảnh", ipa: "ɪn maɪ friː taɪm" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Hoạt động", g2: "Thêm", g3: "Lợi ích" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "In my free time, I usually play badminton", vi: "Lúc rảnh tôi hay chơi cầu lông", ipa: "ɪn maɪ friː taɪm aɪ ˈjuːʒuəli pleɪ ˈbædmɪntən" },
        { en: "In my free time, I work out at the gym", vi: "Lúc rảnh tôi tập gym", ipa: "ɪn maɪ friː taɪm aɪ wɜːk aʊt ət ðə dʒɪm" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "and learn about new technologies", vi: "và tìm hiểu công nghệ mới", ipa: "ænd lɜːn əˈbaʊt njuː tekˈnɒlədʒiz" },
        { en: "and meet my friends", vi: "và gặp bạn bè", ipa: "ænd miːt maɪ frendz" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "it helps me relieve stress", vi: "nó giúp tôi giảm căng thẳng", ipa: "ɪt helps miː rɪˈliːv stres" },
        { en: "it keeps me healthy and happy", vi: "nó giữ tôi khỏe và vui", ipa: "ɪt kiːps miː ˈhelθi ænd ˈhæpi" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: " " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "… …. ….",
        example: "In my free time, I usually play badminton and learn about new technologies. It helps me relieve stress.",
      }],
    }],
  },
  "hobbies-02": {
    title: "Do you think hobbies are important?",
    vi: "Bạn nghĩ sở thích có quan trọng không?",
    vocab: [{ term: "develop a skill", pos: "v", vi: "phát triển kỹ năng", ipa: "dɪˈveləp ə skɪl" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Trả lời", g2: "Lợi ích", g3: "Ví dụ" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "Yes, I think hobbies are important", vi: "Có, tôi nghĩ sở thích quan trọng", ipa: "jes aɪ θɪŋk ˈhɒbiz ɑː ɪmˈpɔːtənt" },
        { en: "Yes, definitely", vi: "Có, chắc chắn rồi", ipa: "jes ˈdefɪnətli" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "they help people relieve stress", vi: "chúng giúp giảm căng thẳng", ipa: "ðeɪ help ˈpiːpl rɪˈliːv stres" },
        { en: "they're a good way to make friends", vi: "là cách tốt để kết bạn", ipa: "ðeə ə ɡʊd weɪ tə meɪk frendz" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "for example, badminton keeps me healthy", vi: "ví dụ, cầu lông giúp tôi khỏe", ipa: "fər ɪɡˈzɑːmpl ˈbædmɪntən kiːps miː ˈhelθi" },
        { en: "we can also develop new skills", vi: "và còn phát triển kỹ năng mới", ipa: "wi kən ˈɔːlsəʊ dɪˈveləp njuː skɪlz" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: " because " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "… vì …. ….",
        example: "Yes, I think hobbies are important because they help people relieve stress. For example, badminton keeps me healthy.",
      }],
    }],
  },
  "hobbies-03": {
    title: "Which hobby would you like to try in the future?",
    vi: "Sau này bạn muốn thử sở thích nào?",
    vocab: [{ term: "take up", pos: "v", vi: "bắt đầu (một sở thích)", ipa: "teɪk ʌp" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Sở thích", g2: "Lý do", g3: "Dự định" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "I'd like to take up swimming", vi: "Tôi muốn bắt đầu học bơi", ipa: "aɪd laɪk tə teɪk ʌp ˈswɪmɪŋ" },
        { en: "In the future, I want to learn to swim", vi: "Sau này tôi muốn học bơi", ipa: "ɪn ðə ˈfjuːtʃər aɪ wɒnt tə lɜːn tə swɪm" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "because it's good for my health", vi: "vì nó tốt cho sức khỏe", ipa: "bɪˈkɒz ɪts ɡʊd fə maɪ helθ" },
        { en: "because it's a great full-body exercise", vi: "vì là bài tập toàn thân rất tốt", ipa: "bɪˈkɒz ɪts ə ɡreɪt fʊl ˈbɒdi ˈeksəsaɪz" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "it can help me keep fit", vi: "nó giúp tôi giữ dáng", ipa: "ɪt kən help miː kiːp fɪt" },
        { en: "I hope to start when I have more free time", vi: "tôi mong bắt đầu khi rảnh hơn", ipa: "aɪ həʊp tə stɑːt wen aɪ hæv mɔː friː taɪm" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: " " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "… …. ….",
        example: "I'd like to take up swimming because it's good for my health. It can help me keep fit.",
      }],
    }],
  },

  // ── Movies ─────────────────────────────────────────────────
  "movies-02": {
    title: "What kinds of movies do you like best?",
    vi: "Bạn thích thể loại phim nào nhất?",
    vocab: [{ term: "special effects", pos: "n", vi: "kỹ xảo", ipa: "ˈspeʃl ɪˈfekts" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Thể loại", g2: "Lý do", g3: "Chi tiết" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "I like science fiction films best", vi: "Tôi thích phim khoa học viễn tưởng nhất", ipa: "aɪ laɪk ˈsaɪəns ˈfɪkʃn fɪlmz best" },
        { en: "My favourite genre is sci-fi", vi: "Thể loại tôi thích nhất là viễn tưởng", ipa: "maɪ ˈfeɪvərɪt ˈʒɒnrə ɪz ˈsaɪ faɪ" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "because I'm interested in technology", vi: "vì tôi thích công nghệ", ipa: "bɪˈkɒz aɪm ˈɪntrəstɪd ɪn tekˈnɒlədʒi" },
        { en: "because the stories are exciting", vi: "vì cốt truyện hấp dẫn", ipa: "bɪˈkɒz ðə ˈstɔːriz ɑːr ɪkˈsaɪtɪŋ" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "they often have amazing special effects", vi: "chúng có kỹ xảo đẹp mắt", ipa: "ðeɪ ˈɒfn hæv əˈmeɪzɪŋ ˈspeʃl ɪˈfekts" },
        { en: "they make me imagine the future", vi: "chúng giúp tôi tưởng tượng tương lai", ipa: "ðeɪ meɪk miː ɪˈmædʒɪn ðə ˈfjuːtʃə" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: " " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "… …. ….",
        example: "I like science fiction films best because I'm interested in technology. They often have amazing special effects.",
      }],
    }],
  },
  "movies-03": {
    title: "How often do you go to a cinema to watch a movie?",
    vi: "Bạn đi rạp xem phim bao lâu một lần?",
    vocab: [{ term: "go to the cinema", pos: "v", vi: "đi rạp chiếu phim", ipa: "ɡəʊ tə ðə ˈsɪnəmə" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Tần suất", g2: "Lý do", g3: "Thêm" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "I rarely go to the cinema", vi: "Tôi hiếm khi đi rạp", ipa: "aɪ ˈreəli ɡəʊ tə ðə ˈsɪnəmə" },
        { en: "I don't go to the cinema very often", vi: "Tôi không đi rạp thường xuyên", ipa: "aɪ dəʊnt ɡəʊ tə ðə ˈsɪnəmə ˈveri ˈɒfn" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "because I'm quite busy with work", vi: "vì tôi khá bận việc", ipa: "bɪˈkɒz aɪm kwaɪt ˈbɪzi wɪð wɜːk" },
        { en: "I prefer watching films at home", vi: "tôi thích xem phim ở nhà hơn", ipa: "aɪ prɪˈfɜː ˈwɒtʃɪŋ fɪlmz ət həʊm" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "but I sometimes go with my friends", vi: "nhưng đôi khi tôi đi cùng bạn", ipa: "bət aɪ ˈsʌmtaɪmz ɡəʊ wɪð maɪ frendz" },
        { en: "it's more convenient to stream at home", vi: "xem ở nhà tiện hơn", ipa: "ɪts mɔː kənˈviːniənt tə striːm ət həʊm" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: " " }, { type: "slot", slot: 2 }, { type: "text", text: ", " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "… …, ….",
        example: "I rarely go to the cinema because I'm quite busy with work, but I sometimes go with my friends.",
      }],
    }],
  },
  "movies-04": {
    title: "Describe your favourite movie.",
    vi: "Mô tả bộ phim bạn thích nhất.",
    vocab: [{ term: "main character", pos: "n", vi: "nhân vật chính", ipa: "meɪn ˈkærəktə" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Tên phim", g2: "Nội dung", g3: "Vì sao thích" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "My favourite film is Iron Man", vi: "Phim tôi thích nhất là Iron Man", ipa: "maɪ ˈfeɪvərɪt fɪlm ɪz ˈaɪən mæn" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "which is a sci-fi superhero film", vi: "một phim viễn tưởng siêu anh hùng", ipa: "wɪtʃ ɪz ə ˈsaɪ faɪ ˈsuːpəhɪərəʊ fɪlm" },
        { en: "it's about a man who builds a powerful suit", vi: "kể về người tạo ra bộ giáp mạnh mẽ", ipa: "ɪts əˈbaʊt ə mæn huː bɪldz ə ˈpaʊəfl suːt" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "I like the main character because he's clever", vi: "tôi thích nhân vật chính vì anh ấy thông minh", ipa: "aɪ laɪk ðə meɪn ˈkærəktə bɪˈkɒz hiz ˈklevə" },
        { en: "it has amazing special effects", vi: "phim có kỹ xảo mãn nhãn", ipa: "ɪt hæz əˈmeɪzɪŋ ˈspeʃl ɪˈfekts" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: ", " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "…, …. ….",
        example: "My favourite film is Iron Man, which is a sci-fi superhero film. I like the main character because he's clever.",
      }],
    }],
  },

  // ── Tea & Coffee ───────────────────────────────────────────
  "tea-coffee-01": {
    title: "Do Vietnamese people like to drink tea or coffee?",
    vi: "Người Việt thích uống trà hay cà phê?",
    vocab: [{ term: "stay awake", pos: "v", vi: "tỉnh táo", ipa: "steɪ əˈweɪk" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Nhận định", g2: "Cà phê", g3: "Trà" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "Both tea and coffee are popular in Vietnam", vi: "Cả trà và cà phê đều phổ biến ở Việt Nam", ipa: "bəʊθ tiː ænd ˈkɒfi ɑː ˈpɒpjələr ɪn ˌvjetˈnɑːm" },
        { en: "Vietnamese people enjoy both tea and coffee", vi: "Người Việt thích cả trà và cà phê", ipa: "ˌvjetnəˈmiːz ˈpiːpl ɪnˈdʒɔɪ bəʊθ tiː ænd ˈkɒfi" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "many people drink coffee in the morning to stay awake", vi: "nhiều người uống cà phê sáng để tỉnh táo", ipa: "ˈmeni ˈpiːpl drɪŋk ˈkɒfi ɪn ðə ˈmɔːnɪŋ tə steɪ əˈweɪk" },
        { en: "coffee gives them energy for work", vi: "cà phê cho họ năng lượng làm việc", ipa: "ˈkɒfi ɡɪvz ðəm ˈenədʒi fə wɜːk" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "older people often drink tea when they chat", vi: "người lớn tuổi hay uống trà khi trò chuyện", ipa: "ˈəʊldə ˈpiːpl ˈɒfn drɪŋk tiː wen ðeɪ tʃæt" },
        { en: "tea is a part of our culture", vi: "trà là một phần văn hóa của chúng tôi", ipa: "tiː ɪz ə pɑːt əv aʊə ˈkʌltʃə" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: ". " }, { type: "slot", slot: 2 }, { type: "text", text: ", while " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "…. …, trong khi ….",
        example: "Both tea and coffee are popular in Vietnam. Many people drink coffee in the morning to stay awake, while older people often drink tea when they chat.",
      }],
    }],
  },
  "tea-coffee-02": {
    title: "Do you prepare tea or coffee for the guests at home?",
    vi: "Bạn có pha trà hoặc cà phê khi nhà có khách không?",
    vocab: [{ term: "feel welcome", pos: "phrase", vi: "thấy được chào đón", ipa: "fiːl ˈwelkəm" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Trả lời", g2: "Chi tiết", g3: "Ý nghĩa" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "Yes, I do", vi: "Có, tôi có pha", ipa: "jes aɪ duː" },
        { en: "Yes, we usually do", vi: "Có, nhà tôi thường pha", ipa: "jes wi ˈjuːʒuəli duː" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "when we have guests, we offer them tea", vi: "khi có khách, chúng tôi mời trà", ipa: "wen wi hæv ɡests wi ˈɒfə ðəm tiː" },
        { en: "sometimes we make coffee if they prefer it", vi: "đôi khi pha cà phê nếu họ thích", ipa: "ˈsʌmtaɪmz wi meɪk ˈkɒfi ɪf ðeɪ prɪˈfɜːr ɪt" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "it's a good way to make them feel welcome", vi: "là cách hay để khách thấy được chào đón", ipa: "ɪts ə ɡʊd weɪ tə meɪk ðəm fiːl ˈwelkəm" },
        { en: "it's a common custom here", vi: "đó là tục lệ quen thuộc ở đây", ipa: "ɪts ə ˈkɒmən ˈkʌstəm hɪə" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: ". " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "…. …. ….",
        example: "Yes, I do. When we have guests, we offer them tea. It's a good way to make them feel welcome.",
      }],
    }],
  },
  "tea-coffee-03": {
    title: "When was the last time you drank tea or coffee?",
    vi: "Lần gần nhất bạn uống trà hoặc cà phê là khi nào?",
    vocab: [{ term: "concentrate", pos: "v", vi: "tập trung", ipa: "ˈkɒnsntreɪt" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Khi nào", g2: "Chi tiết", g3: "Lý do" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "The last time was this morning", vi: "Lần gần nhất là sáng nay", ipa: "ðə lɑːst taɪm wəz ðɪs ˈmɔːnɪŋ" },
        { en: "I had a coffee this morning", vi: "Tôi uống cà phê sáng nay", ipa: "aɪ hæd ə ˈkɒfi ðɪs ˈmɔːnɪŋ" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "I had a cup of coffee before work", vi: "tôi uống một cốc cà phê trước giờ làm", ipa: "aɪ hæd ə kʌp əv ˈkɒfi bɪˈfɔː wɜːk" },
        { en: "I drank it at a café near my office", vi: "tôi uống ở quán gần văn phòng", ipa: "aɪ dræŋk ɪt ət ə ˈkæfeɪ nɪə maɪ ˈɒfɪs" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "because it helps me stay awake", vi: "vì nó giúp tôi tỉnh táo", ipa: "bɪˈkɒz ɪt helps miː steɪ əˈweɪk" },
        { en: "it helps me concentrate better at work", vi: "nó giúp tôi tập trung hơn khi làm", ipa: "ɪt helps miː ˈkɒnsntreɪt ˈbetər ət wɜːk" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: ". " }, { type: "slot", slot: 2 }, { type: "text", text: " " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "…. … ….",
        example: "The last time was this morning. I had a cup of coffee before work because it helps me stay awake.",
      }],
    }],
  },

  // ── Languages ──────────────────────────────────────────────
  "languages-01": {
    title: "How many languages do you speak?",
    vi: "Bạn nói được bao nhiêu ngôn ngữ?",
    vocab: [{ term: "native language", pos: "n", vi: "tiếng mẹ đẻ", ipa: "ˈneɪtɪv ˈlæŋɡwɪdʒ" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Ngôn ngữ", g2: "Tiếng mẹ đẻ", g3: "Đang học" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "I speak Vietnamese and a little English", vi: "Tôi nói tiếng Việt và chút tiếng Anh", ipa: "aɪ spiːk ˌvjetnəˈmiːz ænd ə ˈlɪtl ˈɪŋɡlɪʃ" },
        { en: "I speak two languages", vi: "Tôi nói được hai ngôn ngữ", ipa: "aɪ spiːk tuː ˈlæŋɡwɪdʒɪz" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "Vietnamese is my native language", vi: "tiếng Việt là tiếng mẹ đẻ", ipa: "ˌvjetnəˈmiːz ɪz maɪ ˈneɪtɪv ˈlæŋɡwɪdʒ" },
        { en: "I use Vietnamese every day", vi: "tôi dùng tiếng Việt hằng ngày", ipa: "aɪ juːz ˌvjetnəˈmiːz ˈevri deɪ" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "I'm currently learning English for work", vi: "tôi đang học tiếng Anh cho công việc", ipa: "aɪm ˈkʌrəntli ˈlɜːnɪŋ ˈɪŋɡlɪʃ fə wɜːk" },
        { en: "I want to improve my communication skills", vi: "tôi muốn cải thiện kỹ năng giao tiếp", ipa: "aɪ wɒnt tu ɪmˈpruːv maɪ kəˌmjuːnɪˈkeɪʃn skɪlz" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: ". " }, { type: "slot", slot: 2 }, { type: "text", text: ", and " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "…. …, và ….",
        example: "I speak Vietnamese and a little English. Vietnamese is my native language, and I'm currently learning English for work.",
      }],
    }],
  },
  "languages-02": {
    title: "Will you learn any other languages in the future?",
    vi: "Sau này bạn có học thêm ngôn ngữ nào không?",
    vocab: [{ term: "communicate with", pos: "v", vi: "giao tiếp với", ipa: "kəˈmjuːnɪkeɪt wɪð" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Trả lời", g2: "Lý do", g3: "Thêm" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "Yes, I'd like to learn German", vi: "Có, tôi muốn học tiếng Đức", ipa: "jes aɪd laɪk tə lɜːn ˈdʒɜːmən" },
        { en: "Yes, I'm interested in learning German", vi: "Có, tôi hứng thú học tiếng Đức", ipa: "jes aɪm ˈɪntrəstɪd ɪn ˈlɜːnɪŋ ˈdʒɜːmən" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "because it may help me find jobs", vi: "vì nó có thể giúp tôi tìm việc", ipa: "bɪˈkɒz ɪt meɪ help miː faɪnd dʒɒbz" },
        { en: "it would help me communicate with local people", vi: "nó giúp tôi giao tiếp với người bản xứ", ipa: "ɪt wʊd help miː kəˈmjuːnɪkeɪt wɪð ˈləʊkl ˈpiːpl" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "I might go to Germany someday", vi: "có thể một ngày tôi sẽ đến Đức", ipa: "aɪ maɪt ɡəʊ tə ˈdʒɜːməni ˈsʌmdeɪ" },
        { en: "I find the language interesting", vi: "tôi thấy ngôn ngữ đó thú vị", ipa: "aɪ faɪnd ðə ˈlæŋɡwɪdʒ ˈɪntrəstɪŋ" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: " " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "… …. ….",
        example: "Yes, I'd like to learn German because it may help me find jobs. I might go to Germany someday.",
      }],
    }],
  },
  "languages-03": {
    title: "Do you think learning a new language is difficult?",
    vi: "Bạn thấy học ngôn ngữ mới có khó không?",
    vocab: [{ term: "practise regularly", pos: "v", vi: "luyện tập thường xuyên", ipa: "ˈpræktɪs ˈreɡjələli" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Trả lời", g2: "Khó ở đâu", g3: "Cách khắc phục" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "Yes, I think it can be difficult", vi: "Có, tôi nghĩ nó có thể khó", ipa: "jes aɪ θɪŋk ɪt kən bi ˈdɪfɪkəlt" },
        { en: "It can be quite challenging", vi: "Nó khá thử thách", ipa: "ɪt kən bi kwaɪt ˈtʃælɪndʒɪŋ" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "it's hard to remember new vocabulary", vi: "khó nhớ từ vựng mới", ipa: "ɪts hɑːd tə rɪˈmembə njuː vəˈkæbjələri" },
        { en: "pronunciation is quite difficult", vi: "phát âm khá khó", ipa: "prəˌnʌnsiˈeɪʃn ɪz kwaɪt ˈdɪfɪkəlt" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "but practising regularly helps a lot", vi: "nhưng luyện đều rất có ích", ipa: "bət ˈpræktɪsɪŋ ˈreɡjələli helps ə lɒt" },
        { en: "I improve little by little", vi: "tôi tiến bộ dần dần", ipa: "aɪ ɪmˈpruːv ˈlɪtl baɪ ˈlɪtl" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: " because " }, { type: "slot", slot: 2 }, { type: "text", text: ", " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "… vì …, ….",
        example: "Yes, I think it can be difficult because it's hard to remember new vocabulary, but practising regularly helps a lot.",
      }],
    }],
  },

  // ── Music ──────────────────────────────────────────────────
  "music-01": {
    title: "Do you like listening to music?",
    vi: "Bạn có thích nghe nhạc không?",
    vocab: [{ term: "relieve stress", pos: "v", vi: "giảm căng thẳng", ipa: "rɪˈliːv stres" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Trả lời", g2: "Khi nào", g3: "Lợi ích" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "Yes, I do", vi: "Có, tôi thích", ipa: "jes aɪ duː" },
        { en: "Yes, I love listening to music", vi: "Có, tôi rất thích nghe nhạc", ipa: "jes aɪ lʌv ˈlɪsnɪŋ tə ˈmjuːzɪk" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "I listen to music when I work out or relax", vi: "tôi nghe nhạc khi tập gym hoặc thư giãn", ipa: "aɪ ˈlɪsn tə ˈmjuːzɪk wen aɪ wɜːk aʊt ɔː rɪˈlæks" },
        { en: "music helps me relieve stress", vi: "nhạc giúp tôi giảm căng thẳng", ipa: "ˈmjuːzɪk helps miː rɪˈliːv stres" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "it makes me feel more energetic", vi: "nó làm tôi tràn năng lượng hơn", ipa: "ɪt meɪks miː fiːl mɔːr ˌenəˈdʒetɪk" },
        { en: "it lifts my mood", vi: "nó cải thiện tâm trạng", ipa: "ɪt lɪfts maɪ muːd" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: ". " }, { type: "slot", slot: 2 }, { type: "text", text: ", and " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "…. …, và ….",
        example: "Yes, I do. I listen to music when I work out or relax, and it helps me relieve stress.",
      }],
    }],
  },
  "music-02": {
    title: "What kind of music do you like to listen to?",
    vi: "Bạn thích nghe thể loại nhạc nào?",
    vocab: [{ term: "catchy melody", pos: "n", vi: "giai điệu bắt tai", ipa: "ˈkætʃi ˈmelədi" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Thể loại", g2: "Lý do", g3: "Chi tiết" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "I usually listen to pop music", vi: "Tôi thường nghe nhạc pop", ipa: "aɪ ˈjuːʒuəli ˈlɪsn tə pɒp ˈmjuːzɪk" },
        { en: "My favourite genre is pop", vi: "Thể loại tôi thích là pop", ipa: "maɪ ˈfeɪvərɪt ˈʒɒnrə ɪz pɒp" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "because it has catchy melodies", vi: "vì giai điệu bắt tai", ipa: "bɪˈkɒz ɪt hæz ˈkætʃi ˈmelədiz" },
        { en: "because it's easy to enjoy", vi: "vì dễ nghe", ipa: "bɪˈkɒz ɪts ˈiːzi tu ɪnˈdʒɔɪ" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "I listen when I exercise or relax", vi: "tôi nghe khi tập hoặc thư giãn", ipa: "aɪ ˈlɪsn wen aɪ ˈeksəsaɪz ɔː rɪˈlæks" },
        { en: "it helps improve my mood", vi: "nó cải thiện tâm trạng", ipa: "ɪt helps ɪmˈpruːv maɪ muːd" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: " " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "… …. ….",
        example: "I usually listen to pop music because it has catchy melodies. I listen when I exercise or relax.",
      }],
    }],
  },
  "music-03": {
    title: "Have you ever been interested in singing?",
    vi: "Bạn có từng thích hát không?",
    vocab: [{ term: "sing along", pos: "v", vi: "hát theo", ipa: "sɪŋ əˈlɒŋ" }],
    scenarios: [{
      name: "Trả lời", vi: "", labels: { g1: "Trả lời", g2: "Chi tiết", g3: "Cảm nhận" }, g2DependsOnG1: false, g2Prompt: "",
      g1: [
        { en: "Yes, I have", vi: "Có chứ", ipa: "jes aɪ hæv" },
        { en: "Yes, I quite enjoy singing", vi: "Có, tôi khá thích hát", ipa: "jes aɪ kwaɪt ɪnˈdʒɔɪ ˈsɪŋɪŋ" },
      ],
      g2groups: [{ name: "", vi: "", items: [
        { en: "I sometimes sing along to my favourite songs", vi: "đôi khi tôi hát theo bài yêu thích", ipa: "aɪ ˈsʌmtaɪmz sɪŋ əˈlɒŋ tə maɪ ˈfeɪvərɪt sɒŋz" },
        { en: "I enjoy singing karaoke with friends", vi: "tôi thích hát karaoke với bạn bè", ipa: "aɪ ɪnˈdʒɔɪ ˈsɪŋɪŋ ˌkærɪˈəʊki wɪð frendz" },
      ] }],
      g3groups: [{ name: "", vi: "", items: [
        { en: "although I'm not a good singer", vi: "dù tôi hát không hay", ipa: "ɔːlˈðəʊ aɪm nɒt ə ɡʊd ˈsɪŋə" },
        { en: "it helps me relax and have fun", vi: "nó giúp tôi thư giãn và vui", ipa: "ɪt helps miː rɪˈlæks ænd hæv fʌn" },
      ] }],
      structs: [{
        parts: [{ type: "slot", slot: 1 }, { type: "text", text: ". " }, { type: "slot", slot: 2 }, { type: "text", text: ". " }, { type: "slot", slot: 3 }, { type: "text", text: "." }],
        vi: "…. …. ….",
        example: "Yes, I have. I sometimes sing along to my favourite songs. Although I'm not a good singer, it helps me relax and have fun.",
      }],
    }],
  },
}
