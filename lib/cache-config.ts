export const CACHE_TIMES = {
  STATIC_DATA: 10, // 10 seconds (services, settings)
  DASHBOARD_STATS: 10, // 10 seconds (analytics, counts)
  USER_DATA: 10, // 10 seconds (children, parents, tutors)
  BOOKINGS: 10, // 10 seconds (frequently changing)
  REAL_TIME: 10, // 10 seconds (payments, notifications)
} as const;
// export const CACHE_TIMES = {
//   STATIC_DATA: 1800, // 30 minutes (services, settings)
//   DASHBOARD_STATS: 160, // 3 minutes (analytics, counts)
//   USER_DATA: 300, // 5 minutes (children, parents, tutors)
//   BOOKINGS: 120, // 2 minutes (frequently changing)
//   REAL_TIME: 60, // 1 minute (payments, notifications)
// } as const;

export const CACHE_TAGS = {
  ANALYTICS: "analytics",
  BOOKINGS: "bookings",
  CHILDREN: "children",
  DASHBOARD: "dashboard-stats",
  PAYMENTS: "payments",
  SERVICES: "services",
  TUTORS: "tutors",
  USERS: "users",
} as const;
