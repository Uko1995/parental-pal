# Copilot Instructions for PARENTALPAL

## Project Overview

PARENTALPAL is a full-stack childcare solutions platform built with Next.js (App Router), TypeScript, and Tailwind CSS. It connects parents with tutors, holiday camps, playgroups, homeschooling resources, and children's events. MongoDB Atlas is used for data storage with Google Sheets as backup. The platform includes comprehensive booking forms, payment scheduling, and form reset functionality.

## Architecture & Key Patterns

- **App Directory Structure**: Uses Next.js 14+ App Router. Each route is a folder in `app/` (e.g., `app/register/page.tsx`).
- **Components**: Shared React components are in `app/components/` (e.g., `NavBar.tsx`, `Hero.tsx`, `Vision.tsx`). All components must be typed with interfaces defined.
- **Forms**: Advanced booking forms with service-specific components (`TutoringForm.tsx`, `ChildCareSpecificBookingForm.tsx`, `EventBookingForm.tsx`, `HolidayCampForm.tsx`).
- **Styling**: Tailwind CSS with DaisyUI components imported in `app/globals.css`. Brand colors are: primary color: #90AC19, secondary color: #E8931A, accent color: #A25F97, cream: #FFEACF.
- **Fonts**: Uses Manrope font via `next/font` in `app/layout.tsx`.
- **Navigation**: The `NavBar` is fixed, always white, and uses Next.js `Link` for navigation. Active links are highlighted with the brand color.
- **Database**: MongoDB Atlas integration with native MongoDB driver for data modeling and CRUD operations.
- **API Routes**: Backend logic in `app/api/` directory following RESTful patterns.
- **Admin Dashboard**: Comprehensive admin interface with responsive sidebar/bottom navigation using DaisyUI components.

## Database Integration

### Connection & Models

- **Connection Utility**: `lib/mongodb.ts` - MongoDB connection with development/production handling
- **Data Models**: `models/` directory contains Mongoose schemas:
  - `User.ts` - Parent/tutor/admin user accounts
  - `Booking.ts` - Service bookings with schedules and pricing
  - `Service.ts` - Available services and pricing structure
- **Types**: `types/database.ts` - TypeScript interfaces for all database collections

### API Structure

```
app/api/
├── bookings/
│   ├── route.ts              # POST /api/bookings, GET /api/bookings
│   └── [id]/route.ts         # GET/PATCH/DELETE /api/bookings/[id]
├── users/
│   ├── route.ts              # POST /api/users
│   └── profile/route.ts      # GET/PATCH /api/users/profile
├── services/
│   ├── route.ts              # GET /api/services
│   └── pricing/route.ts      # GET /api/services/pricing
└── analytics/
    ├── dashboard/route.ts    # GET /api/analytics/dashboard
    └── revenue/route.ts      # GET /api/analytics/revenue
```

## Form System Architecture

### Core Components

- **BookingForm**: Main form wrapper with service selection and common fields
- **WeekdaysSchedule**: Reusable component for day/time selection with hours
- **PaymentSchedule**: Dynamic pricing display based on service type and selections

### Service-Specific Forms

- **TutoringForm**: Academic tutoring with hourly scheduling (₦15,000/hour)
- **ChildCareSpecificBookingForm**: Daily childcare with monthly options (₦5,000/day)
- **EventBookingForm**: Event services with venue selection and extra services
- **HolidayCampForm**: Weekly holiday camps with date selection (₦30,000/week)

### Form Features

- **Real-time pricing**: Automatic cost calculation based on selections
- **Service validation**: Different validation rules per service type
- **Reset functionality**: Complete form reset after successful submission via `useImperativeHandle`
- **State management**: React hooks for complex form interactions
- **Data persistence**: Form data submitted to both MongoDB and Google Sheets backup

## Developer Workflows

- **Development**: `npm run dev` (uses Next.js with Turbopack)
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Type Checking**: TypeScript strict mode is enabled
- **Database**: MongoDB connection automatically handles dev/prod environments
- **API Testing**: Use `/api/*` endpoints for CRUD operations
- **Form Testing**: All forms include proper TypeScript interfaces and validation

## Conventions & Patterns

### General

- **Component Naming**: PascalCase for React components
- **File Naming**: Use `page.tsx` for route entrypoints, `layout.tsx` for shared layouts
- **State Management**: React hooks with `useState`, `useEffect`, `useImperativeHandle` for form refs
- **Data Fetching**: Server actions in `action.ts` files, API routes for database operations
- **TypeScript**: Strict types with interfaces for all props, form data, and database schemas

### Form Patterns

- **forwardRef**: All form components use `forwardRef` with reset functionality
- **Hidden Inputs**: Complex data (arrays, objects) submitted as JSON strings in hidden inputs
- **Conditional Rendering**: Service-specific fields shown/hidden based on selections
- **Validation**: Required fields with visual feedback and error messages

### Database Patterns

- **Connection Pooling**: MongoDB connection reuse in development, new connections in production
- **Schema Validation**: Mongoose schemas with TypeScript interfaces
- **Error Handling**: Try-catch blocks with proper error responses
- **Data Cleaning**: Filter Next.js internal form data before database operations

## Styling Guidelines

- **Form Styling**: Consistent form inputs with brand colors and focus states
- **Button States**: Interactive buttons with hover effects and disabled states
- **Card Components**: Rounded corners, shadows, and proper spacing
- **Responsive Design**: Mobile-first approach with breakpoint prefixes
- **Color Usage**: Green `#90AC19` for success/active, Orange `#E8931A` for highlights, Purple `#A25F97` for accents
- **Typography**: Consistent heading hierarchy and text sizes

## Service Configuration

### Pricing Structure

- **Tutoring**: ₦15,000 per hour
- **Childcare**: ₦5,000 per day (15% monthly discount)
- **Events**: Base ₦250,000 (indoor/outdoor), ₦470,000 (both), ₦50,000 caution fee
- **Holiday Camps**: ₦30,000 per week
- **Extra Services**: DJ (₦150,000), MC (₦60,000), Event Planning (₦150,000), Carers (₦8,000 each)

### Service Types

```typescript
type ServiceType =
  | "childcare"
  | "tutoring"
  | "homeschooling"
  | "holiday-camps"
  | "space-rental"
  | "kiddies-enrichment";
```

## Environment Variables

```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
GOOGLE_SCRIPT_URL=https://script.google.com/... (optional backup)
```

## Analytics & Dashboard Technology Stack

### **UI Components**

- **DaisyUI**: Component library for consistent design system
- **Tailwind CSS**: Utility-first styling with custom brand color extensions
- **Heroicons**: Icon set for navigation and UI elements
- **React Chart.js 2**: Charts and data visualization library
- **Chart.js**: Core charting library with responsive design

### **Data Visualization**

- **Chart Types**: Line charts, bar charts, pie charts, doughnut charts
- **Analytics Components**: Revenue trends, booking statistics, user growth metrics
- **Interactive Elements**: Hoverable data points, filterable date ranges
- **Responsive Design**: Mobile-optimized charts and tables

### **Dashboard Features**

- **Real-time Analytics**: Live data updates from MongoDB aggregation pipelines
- **Export Functions**: CSV/PDF export for reports
- **Data Filtering**: Date ranges, service types, user segments
- **Performance Metrics**: KPIs, conversion rates, revenue analytics

## Integration Points

- **Database**: MongoDB Atlas with native MongoDB driver (integrated)
- **Authentication**: NextAuth.js (planned, structure ready)
- **Backup**: Google Sheets integration for form submissions
- **Deployment**: Vercel (recommended)
- **Analytics**: Complete dashboard with Chart.js integration and MongoDB aggregation
- **UI Library**: DaisyUI components for consistent admin interface

## Examples

- See `app/components/NavBar.tsx` for navigation and active link pattern
- See `app/components/Vision.tsx` for service categorization (childcare vs tutoring)
- See `app/booking/BookingForm.tsx` for main form architecture
- See `app/booking/WeekdaysSchedule.tsx` for reusable scheduling component
- See `app/booking/action.ts` for server action with database integration
- See `models/Booking.ts` for Mongoose schema patterns
- See `app/api/bookings/route.ts` for API route structure

## Quickstart

1. Run `npm install`
2. Set up environment variables in `.env.local`
3. Start dev server: `npm run dev`
4. Test forms at `/register`
5. Check API endpoints at `/api/bookings`
6. Edit service-specific forms in `app/register/`
7. Modify database schemas in `models/`

## Form Reset System

All forms implement a standardized reset system:

- Each form component exports a ref interface (e.g., `TutoringFormRef`)
- Reset functions clear all state and child component states
- Main `BookingForm` coordinates reset after successful submission
- `WeekdaysSchedule` component resets day selections and hours
- `PaymentSchedule` automatically updates when dependent states change

---

**Note**: The platform now includes full-stack functionality with database integration, advanced form handling, and comprehensive service management. All booking data is stored in MongoDB with Google Sheets backup for redundancy.
