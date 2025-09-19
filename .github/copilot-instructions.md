# Copilot Instructions for PARENTALPAL

## Project Overview

PARENTALPAL is a full-stack childcare solutions platform built with Next.js (App Router), TypeScript, and Tailwind CSS. It connects parents with tutors, holiday camps, playgroups, homeschooling resources, and children's events. MongoDB Atlas is used for data storage. The codebase is monorepo-style, with all app logic in the `app/` directory.

## Architecture & Key Patterns

- **App Directory Structure**: Uses Next.js 14+ App Router. Each route is a folder in `app/` (e.g., `app/tutors/page.tsx`).
- **Components**: Shared React components are in `app/components/` (e.g., `NavBar.tsx`, `Hero.tsx`).
- **Styling**: Tailwind CSS is imported in `app/globals.css`. Brand colors are: primary color: #90AC19, secondary color: #E8931A, accent color: #A25F97, cream: #FFEACF.
- **Fonts**: Uses Manrope font via `next/font` in `app/layout.tsx`.
- **Navigation**: The `NavBar` is fixed, always white, and uses Next.js `Link` for navigation. Active links are highlighted with the brand color.
- **No API routes or backend logic** are present in this repo yet; all pages are static or client components.

## Developer Workflows

- **Development**: `npm run dev` (uses Next.js with Turbopack)
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Type Checking**: TypeScript strict mode is enabled
- **Styling**: Use Tailwind utility classes; do not write custom CSS unless necessary
- **Routing**: Use file-based routing in `app/` (e.g., `app/events/page.tsx` for `/events`)

## Conventions & Patterns

- **Component Naming**: PascalCase for React components
- **File Naming**: Use `page.tsx` for route entrypoints, `layout.tsx` for shared layouts
- **State Management**: Use React hooks; no global state library in use, tanstack query and zustand will be implemented later
- **Data Fetching**: Use `fetch` in server components; client components can use React Query (to be added later)
- **TypeScript**: Strict types;
- **Branding**: Use the green `#37bd3cd6` for highlights and active states
- **Accessibility**: Use semantic HTML and ARIA labels for navigation and buttons
- **No Scroll Effects**: The NavBar should not change on scroll; keep background and text colors consistent

## Integration Points

- **Database**: MongoDB Atlas (planned, not yet integrated)
- **Authentication**: NextAuth.js (planned, not yet integrated)
- **Deployment**: Vercel (recommended)

## Examples

- See `app/components/NavBar.tsx` for navigation and active link pattern
- See `app/components/Hero.tsx` for hero section with overlay and responsive design
- See `app/layout.tsx` for font setup and NavBar inclusion

## Quickstart

1. Run `npm install`
2. Start dev server: `npm run dev`
3. Edit pages in `app/` or components in `app/components/`

---

If you add backend logic, API routes, or database integration, update this file to document new patterns and workflows.
