import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-config";

export const invalidateCache = {
  // When new booking is created
  newBooking: () => {
    revalidateTag(CACHE_TAGS.BOOKINGS);
    revalidateTag(CACHE_TAGS.DASHBOARD);
    revalidateTag(CACHE_TAGS.CHILDREN);
    revalidateTag(CACHE_TAGS.ANALYTICS);
  },

  // When user profile is updated
  userUpdate: () => {
    revalidateTag(CACHE_TAGS.USERS);
    revalidateTag(CACHE_TAGS.CHILDREN);
    revalidateTag(CACHE_TAGS.TUTORS);
    revalidateTag(CACHE_TAGS.DASHBOARD);
  },

  // When service is modified
  serviceUpdate: () => {
    revalidateTag(CACHE_TAGS.SERVICES);
    revalidateTag(CACHE_TAGS.DASHBOARD);
  },

  // When payment is processed
  paymentUpdate: () => {
    revalidateTag(CACHE_TAGS.PAYMENTS);
    revalidateTag(CACHE_TAGS.BOOKINGS);
    revalidateTag(CACHE_TAGS.ANALYTICS);
    revalidateTag(CACHE_TAGS.DASHBOARD);
  },

  // When product is created, updated, or deleted
  productUpdate: () => {
    revalidateTag(CACHE_TAGS.PRODUCTS);
    revalidateTag(CACHE_TAGS.DASHBOARD);
    revalidateTag(CACHE_TAGS.ANALYTICS);
  },

  // When tutor is updated
  tutorUpdate: () => {
    revalidateTag(CACHE_TAGS.TUTORS);
    revalidateTag(CACHE_TAGS.USERS);
    revalidateTag(CACHE_TAGS.DASHBOARD);
  },

  // When child is updated
  childUpdate: () => {
    revalidateTag(CACHE_TAGS.CHILDREN);
    revalidateTag(CACHE_TAGS.USERS);
    revalidateTag(CACHE_TAGS.DASHBOARD);
  },

  // Full dashboard refresh
  fullRefresh: () => {
    revalidateTag(CACHE_TAGS.DASHBOARD);
    revalidateTag(CACHE_TAGS.ANALYTICS);
    revalidateTag(CACHE_TAGS.BOOKINGS);
    revalidateTag(CACHE_TAGS.CHILDREN);
    revalidateTag(CACHE_TAGS.USERS);
    revalidateTag(CACHE_TAGS.PRODUCTS);
    revalidateTag(CACHE_TAGS.TUTORS);
    revalidateTag(CACHE_TAGS.SERVICES);
    revalidateTag(CACHE_TAGS.PAYMENTS);
  },
};
