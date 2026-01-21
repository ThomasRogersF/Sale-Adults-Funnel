import { QuizConfig } from "@/types/quiz";

export const spanishQuiz: QuizConfig = {
  id: "spanish-learning-quiz",
  title: "Spanish Learning Quiz",
  description: "Discover your perfect Spanish learning path",
  logoUrl: "https://spanishvip.com/wp-content/uploads/2025/06/SpanishVIP-Original-Logo.png",
  introImageUrl: "https://spanishvip.com/wp-content/uploads/2025/04/private-tutoring.jpg",
  introText: "Welcome to your personalized Spanish learning journey! This quick quiz will help us create the perfect learning experience tailored just for you.",
  estimatedTime: "2-3 minutes",
  primaryColor: "#FF5913",
  secondaryColor: "#F7F4EE",
  webhookUrl: "https://hook.us2.make.com/jiqug4vix263lgx98kc32o801nlpfat9",
  questions: [
    {
      id: "q1",
      type: "mcq",
      title: "What’s your main reason for learning Spanish?",
      required: true,
      options: [
        { id: "a1", text: "Travel ✈", value: "reason_travel" },
        { id: "a2", text: "Work or career 💼", value: "reason_work" },
        { id: "a3", text: "Family or relationships 👨‍👩‍👧‍👦", value: "reason_family" },
        { id: "a4", text: "Study or exam 🎓", value: "reason_study" },
        { id: "a5", text: "Just for fun 🙂", value: "reason_fun" }
      ]
    },
    {
      id: "q2",
      type: "mcq",
      title: "How would you describe your current level?",
      required: true,
      options: [
        { id: "a1", text: "Beginner (I know a few words)", value: "level_beginner" },
        { id: "a2", text: "Upper beginner (I can manage basic conversations)", value: "level_upper_beginner" },
        { id: "a3", text: "Intermediate", value: "level_intermediate" },
        { id: "a4", text: "Advanced", value: "level_advanced" }
      ]
    },
    {
      id: "q3",
      type: "mcq",
      title: "What kind of learning experience sounds right for you?",
      required: true,
      options: [
        { id: "a1", text: "1-on-1 private lessons with a personal tutor", value: "experience_private" },
        { id: "a2", text: "Small, friendly group classes", value: "experience_group" },
        { id: "a3", text: "A mix of both", value: "experience_mix" }
      ]
    },
    {
      id: "q4",
      type: "mcq",
      title: "How much time can you usually dedicate to Spanish each week?",
      required: true,
      options: [
        { id: "a1", text: "1–2 hours", value: "time_1_2" },
        { id: "a2", text: "3–4 hours", value: "time_3_4" },
        { id: "a3", text: "5–6 hours", value: "time_5_6" },
        { id: "a4", text: "7+ hours", value: "time_7_plus" }
      ]
    },
    {
      id: "q5",
      type: "mcq",
      title: "Which schedule works best for you?",
      required: true,
      options: [
        { id: "a1", text: "Mornings", value: "schedule_mornings" },
        { id: "a2", text: "Afternoons", value: "schedule_afternoons" },
        { id: "a3", text: "Evenings", value: "schedule_evenings" },
        { id: "a4", text: "Weekends", value: "schedule_weekends" }
      ]
    },
    {
      id: "q6",
      type: "mcq",
      title: "How often would you like to take classes?\n\n(You’ll still be able to change this later.)",
      required: true,
      options: [
        { id: "a1", text: "Private lessons: 3× per week", value: "freq_private_3x" },
        { id: "a2", text: "Private lessons: 5× per week", value: "freq_private_5x" },
        { id: "a3", text: "Group classes: Join whenever you want (unlimited access)", value: "freq_group_unlimited" }
      ]
    },
    {
      id: "q7",
      type: "mcq",
      title: "What are you most interested in improving right now?",
      required: true,
      options: [
        { id: "a1", text: "Speaking confidence", value: "focus_speaking" },
        { id: "a2", text: "Grammar and structure", value: "focus_grammar" },
        { id: "a3", text: "Listening and pronunciation", value: "focus_listening" },
        { id: "a4", text: "Vocabulary for everyday life", value: "focus_vocabulary" },
        { id: "a5", text: "Professional or business Spanish", value: "focus_business" }
      ]
    },
    {
      id: "q8",
      type: "mcq",
      title: "What would make you feel successful after one month?",
      required: true,
      options: [
        { id: "a1", text: "Feeling comfortable having basic conversations", value: "success_basic_conversations" },
        { id: "a2", text: "Understanding native speakers better", value: "success_understanding" },
        { id: "a3", text: "Seeing real progress with grammar", value: "success_grammar_progress" },
        { id: "a4", text: "Staying consistent with practice", value: "success_consistency" }
      ]
    },
    {
      id: "q9",
      type: "mcq",
      title: "What usually makes it harder for you to keep learning a language?",
      required: true,
      options: [
        { id: "a1", text: "A busy schedule", value: "obstacle_busy_schedule" },
        { id: "a2", text: "Hard to stay motivated", value: "obstacle_motivation" },
        { id: "a3", text: "Not knowing what to study next", value: "obstacle_unclear_study" },
        { id: "a4", text: "Nervous to speak", value: "obstacle_nervous_speaking" },
        { id: "a5", text: "Finding the right program", value: "obstacle_find_program" }
      ]
    }
  ],
  resultTemplates: [
    {
      id: "group_classes",
      title: "Group Classes - Perfect for You!",
      description: "Based on your responses, Group Classes are your ideal match. You'll enjoy unlimited sessions Monday–Friday at your CEFR level, learning with a global peer group led by native teachers. Perfect for steady progress and great value!",
      conditions: []
    },
    {
      id: "private_tutoring",
      title: "Private Tutoring - Your Best Path Forward!",
      description: "Based on your responses, Private Tutoring is your ideal match. You'll get a dedicated native teacher who creates a custom plan around your goals, with flexible scheduling and personalized feedback for faster progress.",
      conditions: []
    },
    {
      id: "bundled_option",
      title: "Bundled Option - Best of Both!",
      description: "A balanced plan that combines a dedicated 1-on-1 tutor with unlimited group classes. Get personalized attention and consistent practice with peers.",
      conditions: []
    }
  ],
  incentiveEnabled: true,
  incentiveTitle: "50% OFF Your First Month + FREE Beginner Spanish Academy Course",
  incentiveUrl: "https://spanishvip.com/special-offer",
  externalRedirectUrl: "https://spanishvip.com"
};
