import type { PublicServiceType } from "@/lib/service-utils";

export const SERVICE_CONSULT_WHATSAPP_URL = `https://wa.me/+2348065394795?text=${encodeURIComponent(
  "Hello! I'd like to schedule a consultation about your services.",
)}`;

export interface ServicePageFaq {
  question: string;
  answer: string;
}

export interface ServicePageExtras {
  heroTagline: string;
  whoItsFor: string[];
  howItWorks: Array<{ title: string; body: string }>;
  faqs: ServicePageFaq[];
  keywords: string[];
}

export const SERVICE_PAGE_CONTENT: Record<PublicServiceType, ServicePageExtras> =
  {
    childcare: {
      heroTagline: "Reliable daily care that feels like family.",
      whoItsFor: [
        "Working parents who need trusted weekday coverage",
        "Families looking for a consistent, child-centred routine",
        "Parents who want peace of mind with trained caregivers",
      ],
      howItWorks: [
        {
          title: "Share your needs",
          body: "Tell us your child’s age, schedule, and the kind of support you want at home or at our centre.",
        },
        {
          title: "Match and confirm",
          body: "We recommend a care plan, walk through availability, and confirm the days that work for your family.",
        },
        {
          title: "Settle in",
          body: "Your child starts with a warm handover. You stay in the loop, and we adjust as routines change.",
        },
      ],
      faqs: [
        {
          question: "Is care available at home and at your centre?",
          answer:
            "Yes. We support families who need in-home care as well as centre-based days, depending on availability.",
        },
        {
          question: "What ages do you accept?",
          answer:
            "Age groups are listed on this page from the live service details. If you are unsure, send us a WhatsApp message and we will advise.",
        },
        {
          question: "Can I book a full month instead of day-to-day?",
          answer:
            "Monthly packages are often available and usually cost less per day than booking single days. Check the package deals above or book to see current options.",
        },
        {
          question: "How do I get started?",
          answer:
            "Use Book Now to choose dates and children, or start with a WhatsApp consultation if you would like to talk it through first.",
        },
      ],
      keywords: [
        "childcare Nigeria",
        "nanny and daycare",
        "daily childcare Lagos",
        "trusted caregivers",
      ],
    },
    tutoring: {
      heroTagline: "Subject support that builds confidence, not cramming.",
      whoItsFor: [
        "Students who need extra help in core subjects",
        "Families preparing for exams or a new school term",
        "Parents who want structured, professional tutoring at home or online",
      ],
      howItWorks: [
        {
          title: "Choose a format",
          body: "Pick virtual or in-person sessions and tell us the subjects and goals that matter most.",
        },
        {
          title: "Meet your tutor",
          body: "We match your child with a qualified tutor and agree a weekly rhythm that fits your calendar.",
        },
        {
          title: "Track progress",
          body: "Lessons stay focused on real schoolwork, with feedback so you can see how your child is improving.",
        },
      ],
      faqs: [
        {
          question: "Do you offer virtual and in-person tutoring?",
          answer:
            "Yes. Location-based rates may apply. You can choose the format that suits your family when you book.",
        },
        {
          question: "Which subjects can you cover?",
          answer:
            "We support core academic subjects and exam prep. Share the topics during booking or a consultation so we can match the right tutor.",
        },
        {
          question: "How long is a typical session?",
          answer:
            "Sessions are usually billed hourly. Your booking form will show the current rate and any package options.",
        },
        {
          question: "Can siblings share a tutor?",
          answer:
            "Often yes, when levels are similar. Mention it when you book or on WhatsApp so we can plan the right setup.",
        },
      ],
      keywords: [
        "private tutors Nigeria",
        "home tutoring Lagos",
        "exam prep",
        "online tutoring",
      ],
    },
    homeschooling: {
      heroTagline:
        "Creche, preschool, grade school and afterschool care under one roof.",
      whoItsFor: [
        "Families who need warm, flexible creche care by the day, week or month",
        "Preschool families who want play and inquiry-based early years learning",
        "Grade school families, including those raising neuro-divergent children",
        "Parents who need supervised afterschool care and homework support",
      ],
      howItWorks: [
        {
          title: "Choose a programme",
          body: "Pick creche, preschool, grade school or afterschool care, and tell us your child’s stage and the outcomes you want.",
        },
        {
          title: "Confirm your plan",
          body: "Creche is booked by the day, week or month; preschool and grade school run by term with optional transport, materials and extra-curricular activities.",
        },
        {
          title: "Learn and review",
          body: "Your child gets guided teaching in a structured day, and you get clear check-ins and home-learning connections through the term.",
        },
      ],
      faqs: [
        {
          question: "Do you support neuro-divergent children?",
          answer:
            "Yes. Grade School is designed for neuro-divergent children as well as typical learners, with differentiated support in inclusive classrooms. Share any diagnosis, therapy plan or learning need during booking so we can plan the right support.",
        },
        {
          question: "What does a typical day look like?",
          answer:
            "Preschool and grade school days run from 8am to 2pm around four rhythms: Connect, Discover, Move and Reflect — covering circle time, literacy and inquiry, outdoor play and movement, then practical life and closing circle.",
        },
        {
          question: "Can I book creche for just a few days?",
          answer:
            "Yes. Creche is available by the day, week or month, so you can match care to the weeks you actually need.",
        },
        {
          question: "What is included in the term bill?",
          answer:
            "Tuition is billed per term. Development levy (new intakes), learning materials, transport within Gbagada and extra-curricular activities are optional add-ons you select during booking, and each appears as its own line on your invoice.",
        },
        {
          question: "Which curriculum do you follow?",
          answer:
            "Our learning is inspired by the IB Primary Years Programme, EYFS and Montessori. Preschool explores themed units over three weeks each, while grade school is organised around six PYP themes with subjects taught in an integrated way.",
        },
      ],
      keywords: [
        "creche Lagos",
        "preschool Gbagada",
        "grade school Nigeria",
        "neuro-divergent friendly school",
        "afterschool care Lagos",
        "homeschooling Nigeria",
      ],
    },
    "holiday-camps": {
      heroTagline: "Holiday weeks packed with learning, play, and new friends.",
      whoItsFor: [
        "Parents who want a productive, supervised holiday programme",
        "Kids who enjoy crafts, STEM, sports, and group play",
        "Families looking for a safe place during school breaks",
      ],
      howItWorks: [
        {
          title: "Pick the camp",
          body: "Choose the current holiday programme and the weeks that fit your family’s break.",
        },
        {
          title: "Register your children",
          body: "Add ages, any notes we should know, and complete booking so we can reserve their place.",
        },
        {
          title: "Enjoy the holiday",
          body: "Drop-off is simple, days are structured and fun, and we keep you updated through the programme.",
        },
      ],
      faqs: [
        {
          question: "When is the next camp running?",
          answer:
            "Holiday camps are seasonal. If a programme is open, you will see dates and a register link on this page or the current camp landing page.",
        },
        {
          question: "What should my child bring?",
          answer:
            "Packing lists are shared after registration for the specific camp. Typical items include a water bottle, a change of clothes, and any listed extras.",
        },
        {
          question: "Can I book only some of the weeks?",
          answer:
            "Yes, when weekly options are available. Multi-week packages may include a discount — check the live camp details when you register.",
        },
        {
          question: "Is lunch included?",
          answer:
            "Meal arrangements vary by camp season. The booking form and camp page list what is included for the current programme.",
        },
      ],
      keywords: [
        "holiday camp Lagos",
        "school break camp",
        "kids summer camp Nigeria",
        "holiday programme",
      ],
    },
    "space-rental": {
      heroTagline: "A bright, child-friendly space for parties and gatherings.",
      whoItsFor: [
        "Parents planning a kiddies party or playdate",
        "Families who need a safe indoor venue with room to move",
        "Hosts who want a space that already feels made for children",
      ],
      howItWorks: [
        {
          title: "Choose a date",
          body: "Tell us the event type, guest count, and preferred time so we can check availability.",
        },
        {
          title: "Confirm the setup",
          body: "We walk through space, timing, and any extras you need so the day runs smoothly.",
        },
        {
          title: "Host with ease",
          body: "Arrive to a child-ready venue. You focus on the celebration; we take care of the space.",
        },
      ],
      faqs: [
        {
          question: "Is this suitable for birthday parties?",
          answer:
            "Yes. The space is designed with children in mind and is a popular choice for kiddies parties and similar events.",
        },
        {
          question: "How many guests can we host?",
          answer:
            "Capacity depends on the layout of your event. Share your guest count when you book and we will confirm it works.",
        },
        {
          question: "Can we bring our own vendor or decorator?",
          answer:
            "Usually yes, with a few house rules to keep the space safe. Mention vendors during booking so we can plan access.",
        },
        {
          question: "Is there a weekend rate?",
          answer:
            "Package deals may apply for longer or weekend bookings. Current options are listed above when available.",
        },
      ],
      keywords: [
        "kids party venue Lagos",
        "space rental for children",
        "kiddies party hall",
        "event space",
      ],
    },
    "kiddies-enrichment": {
      heroTagline: "Creative, STEM, and performing-arts sessions kids look forward to.",
      whoItsFor: [
        "Children who love art, science, music, or movement",
        "Parents who want structured weekend or after-school enrichment",
        "Families looking for a premium, supervised learning experience",
      ],
      howItWorks: [
        {
          title: "Pick a track",
          body: "Choose Fine Art, STEM, or Performing Arts — or start with the track that matches your child’s energy.",
        },
        {
          title: "Enrol",
          body: "Add your children, choose sessions, and complete registration so we can save their place.",
        },
        {
          title: "Watch them grow",
          body: "Sessions are hands-on and supervised, with moments that build skill and confidence week by week.",
        },
      ],
      faqs: [
        {
          question: "Is this the same as Weekend Enrichment?",
          answer:
            "Weekend Enrichment is our flagship Saturday programme under kiddies enrichment. You can learn more and enrol on the Weekend Enrichment page.",
        },
        {
          question: "What ages can join?",
          answer:
            "Age groups are listed in the service details on this page. If your child is close to a cutoff, message us and we will advise.",
        },
        {
          question: "Do you provide materials?",
          answer:
            "Core activity materials are typically provided. Any extras your child should bring will be shared after enrolment.",
        },
        {
          question: "Can we try one session first?",
          answer:
            "Availability for trial or drop-in sessions depends on the term. Ask on WhatsApp or check the enrolment form for current options.",
        },
      ],
      keywords: [
        "kids enrichment Lagos",
        "STEM art performing arts",
        "weekend kids programme",
        "after school activities",
      ],
    },
  };

export function getServicePageContent(
  type: PublicServiceType,
): ServicePageExtras {
  return SERVICE_PAGE_CONTENT[type];
}
