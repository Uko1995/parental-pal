# Weekend Enrichment — Product Requirements Document

<div align="center">

**ParentalPal**  
*Give every child a creative, smart & confidence-boosting Saturday.*

</div>

---

## Document overview

| | |
|---|---|
| **Product** | Weekend Enrichment landing & enrollment |
| **Stack** | Next.js 15 (App Router), TypeScript, Tailwind CSS, DaisyUI, Framer Motion |
| **Icons** | `@heroicons/react` and `@phosphor-icons/react` (no emoji in UI) |
| **Imagery** | Next/Image + Cloudinary where applicable; use existing `public/` assets (e.g. `kid.webp`, `tutoring.webp`, `camp.webp`) for sections |

---

## 1. Hero section

**Goal:** One clear value proposition and primary CTA.

**Copy (headline):**  
*Give Your Child a Creative, Smart & Confidence-Boosting Weekend Experience!*

**Sublines:**
- Fine Art | STEM | Performing Arts
- For Ages 2–15
- Starts: 7th February | Saturdays Only
- **Location:** ParentalPal Hub, 12 Fola Jinadu Crescent, Gbagada Phase 1

**Pill / tagline (use icons, not emoji):**
- Creativity → `SparklesIcon` or `PaintBrushIcon` (Heroicons)
- Tech skills → `CpuChipIcon` or `CodeBracketIcon`
- Confidence → `UserGroupIcon` or `TrophyIcon`
- Critical thinking → `LightBulbIcon` or `PuzzlePieceIcon`

**Primary CTA (choose one label):**
- Register Now  
- Save My Child’s Slot  
- Book a Seat for This Saturday  
- Yes! I Want to Enroll  

**Design:** Full-width hero; bold typography (e.g. Jost/Manrope); brand green `#90AC19` for CTAs; optional gradient overlay for contrast. Use a strong background image (e.g. kids learning / arts) from `public/` or Cloudinary.

---

## 2. Emotional hook (Section 1)

**Goal:** Speak to parents who want more than “cartoons and boredom” on weekends.

**Copy:**  
*Your child deserves more than cartoons, noise, and boredom every weekend…*

*Every Saturday can be a powerful opportunity for:*
- Building real-life skills
- Growing confidence
- Exploring creativity
- Developing cognitive abilities
- Learning through fun, movement, art, and technology

*That is exactly what the ParentalPal Weekend Enrichment Session is designed for—a wholesome, premium, fun-filled learning experience that makes parents proud and keeps children excited every Saturday.*

**Design:** Warm, high-contrast section. Use `CheckCircleIcon` (Heroicons) for each bullet. Optional soft background (e.g. `greenBG.webp` or brand tint). Keep text scannable with short paragraphs.

---

## 3. Program overview — Three tracks (Section 2)

**Headline:** *3 Enrichment Tracks — One Powerful Weekend Experience*

**Subline:**  
*Your child benefits from a structured, hands-on Saturday designed by certified instructors and education specialists.*

### Track 1: Fine Art (10am – 1pm)

| Program | Ages | Price | Highlights |
|--------|------|--------|------------|
| **Budding Artist Course** | 5–15 | ₦65,000/month | Drawing, Painting, Craft, 3D Construction, End-of-term Exhibition |
| **Arts & Crafts for Toddlers** | 2–5 | ₦55,000/month | Painting, Craft, Drawing, Child-friendly DIY, Mini showcase for parents |

**Icon:** `PaintBrushIcon` (Heroicons) or Phosphor `Palette`

### Track 2: STEM (1pm – 2pm)

| Program | Ages | Price | Highlights |
|--------|------|--------|------------|
| **Intermediate Tech Class** | 7–15 | ₦60,000/month | Coding, Web Dev, Robotics foundations, Tech games, 3D construction *(Laptop required)* |
| **Chess, Puzzles & Scratch** | 4–6 | ₦40,000/month | Thinking, reasoning, memory, problem-solving through logic-based games |

**Icon:** `CpuChipIcon` or `CommandLineIcon` (Heroicons) or Phosphor `Code`

### Track 3: Performing Arts (2pm – 4pm)

| Program | Ages | Price | Highlights |
|--------|------|--------|------------|
| **Dance & Drama** | 7–15 | ₦50,000/month | Drama, Stage confidence, Expression, Performance etiquette, End-of-term production showcase |
| **Ballet & Contemporary Dance** | 2–6 | ₦40,000/month | Confidence, body coordination, rhythm, flexibility, posture |

**Icon:** `MusicalNoteIcon` or `FilmIcon` (Heroicons) or Phosphor `MusicNotes`

**Design:** Cards or bordered blocks per track; distinct accent color per track (e.g. art = warm, STEM = blue, performing = purple) while keeping brand green for primary actions.

---

## 4. Who this is for (Section 3)

**Headline:** *Who This Program Is Perfect For*

**Copy:**  
*Parents who want their child to:*
- Spend weekends meaningfully
- Become more confident, expressive, and creative
- Develop strong cognitive and problem-solving skills
- Reduce screen time
- Improve communication and social skills
- Build talent early
- Enjoy a safe, fun, enriching environment

*Designed for toddlers, primary school children, and teens (ages 2–15).*

**Design:** Bullet list with `CheckIcon` or `CheckCircleIcon`. Optional parent/child imagery from `public/` (e.g. `people.webp`, `kid.webp`).

---

## 5. Program benefits (Section 4)

**Headline:** *Why families choose Weekend Enrichment*

| # | Benefit | Short description |
|---|--------|--------------------|
| 1 | Creative skill development | Real artistic techniques; imagination and expression |
| 2 | Tech skills for the future | Coding, web dev, STEM foundations |
| 3 | Stronger cognitive abilities | Chess, puzzles, STEAM; thinking, logic, memory |
| 4 | Confidence & social development | Drama and dance; communication, charisma, emotional intelligence |
| 5 | Screen-free weekend productivity | Structured, fun learning—not gadgets |
| 6 | Professional instructors | Trained educators, artists, tech specialists |
| 7 | Safe & supportive environment | ParentalPal Hub secure, child-friendly, purpose-built |

**Design:** Numbered cards or list with icons (e.g. `AcademicCapIcon`, `ShieldCheckIcon`, `UserGroupIcon`). Use brand green for key phrases.

---

## 6. Comparison / Why ParentalPal (Section 5)

**Headline:** *Why Choose ParentalPal Over Regular Weekend Classes?*

| Feature | ParentalPal Weekend Enrichment | Regular Art/Tech/Dance Classes |
|--------|---------------------------------|---------------------------------|
| Structured curriculum | Termly project-based learning | Often no set curriculum |
| Instructors | Certified specialists | Often random tutors |
| Breadth | Art + STEM + Performing Arts | Usually one focus |
| Showcase | End-of-term exhibition | Often no performance showcase |
| Environment | Purpose-built kids hub | Often improvised spaces |
| Parent engagement | Weekly progress updates | Often none |

**Design:** Table or two-column layout; use `CheckIcon` (green) and `XMarkIcon` (muted) from Heroicons for rows.

**Closing line:**  
*ParentalPal is designed to help your child grow, express, create, and thrive.*

---

## 7. Social proof & reviews (Section 6)

**Headline:** *What Parents Are Saying*

Three testimonials (use `StarIcon` from Heroicons for rating, not emoji):

1. **“My daughter became more confident on stage!”**  
   *“She used to be shy, but the dance and drama classes changed everything. She can now speak and perform boldly.”* — Mrs. Chioma

2. **“I love how structured it is.”**  
   *“The STEM class is worth every naira. My son now codes simple games!”* — Mr. Fatai

3. **“The environment is safe, colourful, and engaging.”**  
   *“My toddlers enjoy the art class so much. They look forward to Saturdays.”* — Mrs. Bisi

**Design:** Quote cards with star rating (icons), optional small avatar placeholders (`placeholder-avatar.svg` or Cloudinary).

---

## 8. FAQ / Objections (Section 7)

**Headline:** *Common questions*

| Question | Answer |
|----------|--------|
| Is it safe? | Yes. ParentalPal Hub is secure, child-friendly, and supervised by trained staff. |
| Will my child enjoy it? | Absolutely. Every class is hands-on, fun, and interactive. |
| Is it worth the price? | Yes. Structured, skill-building program with professional instructors and real results. |
| Can I choose only one class? | Yes. You can enroll your child in any single track. |
| What if my child is shy? | Our facilitators are trained to help children open up comfortably and gradually. |

**Design:** Accordion or simple Q&A list; use `QuestionMarkCircleIcon` or `ChatBubbleLeftRightIcon` for the section.

---

## 9. Enrollment steps (Section 8)

**Headline:** *How to Register*

1. Click the button below  
2. Fill in your details  
3. Our team contacts you for confirmation  
4. Your child starts this Saturday  

**CTA:** Register Now | Secure My Child’s Slot | Start This Saturday  

**Design:** Numbered steps with `CursorArrowRaysIcon` or `ClipboardDocumentCheckIcon`; single prominent CTA button (brand green).

---

## 10. Bonus / value add (Section 9)

**Headline:** *FREE: Welcome Pack for Every Child*

- Creativity Starter Kit  
- Progress Tracker  
- End-of-term exhibition participation  
- Certificate of Participation  

*(Limited to early registrants.)*

**Design:** Compact card or list with `GiftIcon` or `SparklesIcon`; optional “Limited spots” badge.

---

## 11. Reassurance (Section 10)

**Headline:** *Your child is in safe hands*

*At ParentalPal, we maintain:*
- Safe learning spaces  
- Verified instructors  
- Clean, child-friendly environment  
- Continuous parent feedback  
- Structured curriculum  

*Your child’s growth, confidence, and creativity are our top priority.*

**Design:** Calm section with `ShieldCheckIcon`; soft background or border.

---

## 12. Location & contact (Section 11)

**Centre:** ParentalPal Hub  
**Address:** 12 Fola Jinadu Crescent, Gbagada Phase 1  
**Days:** Saturdays  
**Starts:** 7th February  
**Ages:** 2–15  
**Contact:** Call/WhatsApp 08065394795  

**Icons:** `MapPinIcon`, `CalendarDaysIcon`, `PhoneIcon` (Heroicons).

---

## 13. Final CTA (Section 12)

**Copy:**  
*Give your child a fun, creative, and educational Saturday every week. Slots are limited (due to facilitator–child ratio).*

**CTA options:**  
Register Now | Save a Slot for My Child | Join the Weekend Enrichment Session | Book Now to Start This Saturday  

**Design:** Full-width or contained strip; bold headline + single primary button; optional urgency (“Limited slots”).

---

## Implementation checklist

- [ ] **Route:** `/weekend-enrichment` — single page with sections 1–12.
- [ ] **Nav:** Add “Weekend Enrichment” to main header nav (e.g. after Services).
- [ ] **Home hero:** Slim banner above the hero (absolute top), linking to `/weekend-enrichment` with short line e.g. “Weekend Enrichment — Saturdays from 7th Feb. Register now.”
- [ ] **Tech:** Next.js 15, TypeScript, Tailwind, Framer Motion, Heroicons/Phosphor only (no emoji in UI).
- [ ] **Assets:** Use existing `public/` images and Cloudinary where needed; keep layout responsive and accessible.

---

*PRD v1 — Weekend Enrichment | ParentalPal*
