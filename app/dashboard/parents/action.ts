import { unstable_cache } from "next/cache";
import { UserRepository } from "@/lib/UserRepository";
import { BookingRepository } from "@/lib/BookingRepository";
import { UserInterface } from "@/models/User";
import { BookingInterface } from "@/models/Booking";
import { CACHE_TIMES, CACHE_TAGS } from "@/lib/cache-config";

interface SerializedParentWithStats {
  _id: string | undefined;
  userData: {
    expiresAt: string;
    user: {
      name: string | null;
      email: string | null;
      image: string | null;
    };
  };
  phone?: string;
  address?: string;
  image?: string;
  googleId?: string;
  role: "admin" | "parent" | "tutor";
  isActive: boolean;
  lastLoginAt?: string | null;
  membershipType: "basic" | "premium" | "none";
  children?: {
    name: string;
    age: number;
    class?: string;
    schoolName?: string;
    subjects?: string[];
  }[];
  preferences?: Record<string, unknown>;
  createdAt?: string | null;
  updatedAt?: string | null;
  stats: {
    totalBookings: number;
    activeBookings: number;
    totalSpent: number;
    childrenCount: number;
    lastBookingDate: number | null;
  };
}

// Get all parents with their statistics
export const getParentsData = unstable_cache(
  async () => {
    try {
      const parents = await UserRepository.findByRole("parent");

      // Add statistics to each parent and serialize data
      const parentsWithStats = await Promise.all(
        parents.map(async (parent: UserInterface) => {
          const bookings = await BookingRepository.findByUserId(
            parent._id!.toString()
          );

          // Serialize the parent object to plain object
          const serializedParent = {
            _id: parent._id?.toString(),
            userData: parent.userData,
            phone: parent.phone,
            address: parent.address,
            image: parent.image,
            googleId: parent.googleId,
            role: parent.role,
            isActive: parent.isActive,
            lastLoginAt: parent.lastLoginAt
              ? new Date(parent.lastLoginAt).toISOString()
              : null,
            membershipType: parent.membershipType,
            children: parent.children,
            preferences: parent.preferences,
            createdAt: parent.createdAt
              ? new Date(parent.createdAt).toISOString()
              : null,
            updatedAt: parent.updatedAt
              ? new Date(parent.updatedAt).toISOString()
              : null,
            stats: {
              totalBookings: bookings.length,
              activeBookings: bookings.filter(
                (b: BookingInterface) => b.status === "confirmed"
              ).length,
              totalSpent: bookings.reduce(
                (sum: number, b: BookingInterface) =>
                  sum + (b.pricing?.totalAmount || 0),
                0
              ),
              childrenCount: parent.children?.length || 0,
              lastBookingDate:
                bookings.length > 0
                  ? Math.max(
                      ...bookings.map((b: BookingInterface) =>
                        new Date(b.createdAt || "").getTime()
                      )
                    )
                  : null,
            },
          };

          return serializedParent;
        })
      );

      console.log("Parents with stats:", parentsWithStats.length);
      return parentsWithStats;
    } catch (error) {
      console.error("Error fetching parents data:", error);
      console.error("Error details:", error);
      return [];
    }
  },
  [CACHE_TAGS.USERS],
  { revalidate: CACHE_TIMES.USER_DATA, tags: [CACHE_TAGS.USERS] }
);

// Get parent analytics data
export const getParentAnalytics = unstable_cache(
  async () => {
    try {
      const parents = await UserRepository.findByRole("parent");
      // Get all bookings by combining from different methods since there's no findAll
      const allServiceBookings = await Promise.all([
        BookingRepository.findByServiceType("childcare"),
        BookingRepository.findByServiceType("tutoring"),
        BookingRepository.findByServiceType("holiday-camps"),
        BookingRepository.findByServiceType("space-rental"),
        BookingRepository.findByServiceType("kiddies-enrichment"),
        BookingRepository.findByServiceType("homeschooling"),
      ]);
      const allBookings = allServiceBookings.flat();

      // Filter bookings by parents
      const parentBookings = allBookings.filter((booking: BookingInterface) =>
        parents.some(
          (parent: UserInterface) =>
            parent._id?.toString() === booking.userId?.toString()
        )
      );

      // Registration trends (last 12 months)
      const registrationTrends = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const registrations = parents.filter((parent: UserInterface) => {
          const createdAt = new Date(parent.userData?.expiresAt || "");
          return createdAt >= monthStart && createdAt <= monthEnd;
        }).length;

        return {
          month: date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          registrations,
        };
      }).reverse();

      // Service distribution
      const serviceDistribution = parentBookings.reduce(
        (acc: Record<string, number>, booking: BookingInterface) => {
          const service = booking.serviceType;
          acc[service] = (acc[service] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      // Membership distribution
      const membershipDistribution = parents.reduce(
        (acc: Record<string, number>, parent: UserInterface) => {
          const membership = parent.membershipType || "none";
          acc[membership] = (acc[membership] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      // Monthly revenue from parents
      const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const revenue = parentBookings
          .filter((booking: BookingInterface) => {
            const createdAt = new Date(booking.createdAt || "");
            return createdAt >= monthStart && createdAt <= monthEnd;
          })
          .reduce(
            (sum: number, booking: BookingInterface) =>
              sum + (booking.pricing?.totalAmount || 0),
            0
          );

        return {
          month: date.toLocaleDateString("en-US", { month: "short" }),
          revenue,
        };
      }).reverse();

      // Calculate actual revenue (paid) and pending revenue (pending)
      const actualRevenue = parentBookings
        .filter((b: BookingInterface) => b.payment?.status === "paid")
        .reduce(
          (sum: number, b: BookingInterface) =>
            sum + (b.pricing?.totalAmount || 0),
          0
        );

      const pendingRevenue = parentBookings
        .filter((b: BookingInterface) => b.payment?.status === "pending")
        .reduce(
          (sum: number, b: BookingInterface) =>
            sum + (b.pricing?.totalAmount || 0),
          0
        );

      return {
        totalParents: parents.length,
        activeParents: parents.filter((p: UserInterface) => p.isActive).length,
        totalChildren: parents.reduce(
          (sum: number, p: UserInterface) => sum + (p.children?.length || 0),
          0
        ),
        actualRevenue,
        pendingRevenue,
        totalRevenue: actualRevenue + pendingRevenue,
        averageChildrenPerParent:
          parents.length > 0
            ? (
                parents.reduce(
                  (sum: number, p: UserInterface) =>
                    sum + (p.children?.length || 0),
                  0
                ) / parents.length
              ).toFixed(1)
            : 0,
        registrationTrends,
        serviceDistribution: Object.entries(serviceDistribution).map(
          ([service, count]) => ({
            service: service
              .replace("-", " ")
              .replace(/\b\w/g, (l) => l.toUpperCase()),
            count,
          })
        ),
        membershipDistribution: Object.entries(membershipDistribution).map(
          ([type, count]) => ({
            type: type.charAt(0).toUpperCase() + type.slice(1),
            count,
          })
        ),
        monthlyRevenue,
      };
    } catch (error) {
      console.error("Error fetching parent analytics:", error);
      return {
        totalParents: 0,
        activeParents: 0,
        totalChildren: 0,
        actualRevenue: 0,
        pendingRevenue: 0,
        totalRevenue: 0,
        averageChildrenPerParent: 0,
        registrationTrends: [],
        serviceDistribution: [],
        membershipDistribution: [],
        monthlyRevenue: [],
      };
    }
  },
  [CACHE_TAGS.ANALYTICS],
  { revalidate: CACHE_TIMES.DASHBOARD_STATS, tags: [CACHE_TAGS.ANALYTICS] }
);

// Get top parents by various metrics
export const getTopParents = unstable_cache(
  async () => {
    try {
      const parents = await getParentsData();

      return {
        bySpending: parents
          .sort(
            (a: SerializedParentWithStats, b: SerializedParentWithStats) =>
              (b.stats?.totalSpent || 0) - (a.stats?.totalSpent || 0)
          )
          .slice(0, 5),
        byBookings: parents
          .sort(
            (a: SerializedParentWithStats, b: SerializedParentWithStats) =>
              (b.stats?.totalBookings || 0) - (a.stats?.totalBookings || 0)
          )
          .slice(0, 5),
        byChildren: parents
          .sort(
            (a: SerializedParentWithStats, b: SerializedParentWithStats) =>
              (b.stats?.childrenCount || 0) - (a.stats?.childrenCount || 0)
          )
          .slice(0, 5),
      };
    } catch (error) {
      console.error("Error fetching top parents:", error);
      return {
        bySpending: [],
        byBookings: [],
        byChildren: [],
      };
    }
  },
  [CACHE_TAGS.USERS],
  { revalidate: CACHE_TIMES.USER_DATA, tags: [CACHE_TAGS.USERS] }
);

// Update parent function
export async function updateParent(
  parentId: string,
  updateData: Partial<UserInterface>
) {
  try {
    const result = await UserRepository.updateUser(parentId, updateData);

    // Revalidate cache
    // Note: In a real app, you'd use revalidateTag here
    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating parent:", error);
    return { success: false, error: "Failed to update parent" };
  }
}

// Delete parent function
export async function deleteParent(parentId: string) {
  try {
    const result = await UserRepository.deleteUser(parentId);

    // Revalidate cache
    return { success: true, data: result };
  } catch (error) {
    console.error("Error deleting parent:", error);
    return { success: false, error: "Failed to delete parent" };
  }
}
