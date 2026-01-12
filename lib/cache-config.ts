// Cache times set to false = cache indefinitely until manually invalidated via revalidateTag
// This ensures instant invalidation after mutations on both dev and prod
export const CACHE_TIMES = {
  STATIC_DATA: false, // Invalidate only on mutation (services, settings)
  DASHBOARD_STATS: false, // Invalidate only on mutation (analytics, counts)
  USER_DATA: false, // Invalidate only on mutation (children, parents, tutors)
  BOOKINGS: false, // Invalidate only on mutation (bookings)
  REAL_TIME: false, // Invalidate only on mutation (payments, notifications)
  PRODUCTS: false, // Invalidate only on mutation (products)
} as const;

// Time-based fallback (optional - uncomment if you want eventual consistency)
// export const CACHE_TIMES = {
//   STATIC_DATA: 1800, // 30 minutes (services, settings)
//   DASHBOARD_STATS: 180, // 3 minutes (analytics, counts)
//   USER_DATA: 300, // 5 minutes (children, parents, tutors)
//   BOOKINGS: 120, // 2 minutes (frequently changing)
//   REAL_TIME: 60, // 1 minute (payments, notifications)
//   PRODUCTS: 300, // 5 minutes (products)
// } as const;

export const CACHE_TAGS = {
  ANALYTICS: "analytics",
  BLOG: "blog",
  BOOKINGS: "bookings",
  CART: "cart",
  CHILDREN: "children",
  COUPONS: "coupons",
  DASHBOARD: "dashboard-stats",
  ORDERS: "orders",
  PAYMENTS: "payments",
  PRODUCTS: "products",
  REVIEWS: "reviews",
  SERVICES: "services",
  TUTORS: "tutors",
  USERS: "users",
  WISHLIST: "wishlist",
} as const;
