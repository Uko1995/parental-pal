import { UserRepository } from "@/lib/UserRepository";
import { unstable_cache } from "next/cache";
import { CACHE_TIMES, CACHE_TAGS } from "@/lib/cache-config";
import { UserInterface } from "@/models/User";
import { getCollection } from "@/lib/mongodb";

interface TutorsData {
  tutors: UserInterface[];
  tutorStats: {
    totalTutors: number;
    activeTutors: number;
    inactiveTutors: number;
    newThisMonth: number;
  };
}

interface TutorPerformance {
  tutorId: string;
  tutorName: string;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  subjects: string[];
}

interface BookingDoc {
  pricing?: {
    totalAmount?: number;
  };
  serviceType?: string;
  status?: string;
}

interface TutorDoc {
  _id: string | object;
  userData?: {
    user?: {
      name?: string;
    };
  };
  tutorProfile?: {
    subjects?: string[];
    rating?: number;
  };
}

interface MonthlyRegistration {
  _id: { month: number };
  count: number;
}

const fetchTutors = async (): Promise<TutorsData> => {
  const tutors = await UserRepository.findByRole("tutor");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const newThisMonth = tutors.filter(
    (tutor: UserInterface) => tutor.createdAt && tutor.createdAt >= startOfMonth
  ).length;

  const tutorStats = {
    totalTutors: tutors.length,
    activeTutors: tutors.filter((tutor: UserInterface) => tutor.isActive)
      .length,
    inactiveTutors: tutors.filter((tutor: UserInterface) => !tutor.isActive)
      .length,
    newThisMonth,
  };

  return {
    tutors,
    tutorStats,
  };
};

export const getTutors = unstable_cache(fetchTutors, ["tutors-data"], {
  revalidate: CACHE_TIMES.USER_DATA,
  tags: [CACHE_TAGS.TUTORS, CACHE_TAGS.USERS],
});

export const getTutorById = unstable_cache(
  async (tutorId: string) => {
    return await UserRepository.findById(tutorId);
  },
  ["tutor-detail"],
  {
    revalidate: CACHE_TIMES.USER_DATA,
    tags: [CACHE_TAGS.TUTORS],
  }
);

/**
 * Get tutor performance analytics
 */
export const getTutorPerformanceData = unstable_cache(
  async (): Promise<TutorPerformance[]> => {
    const bookingsCollection = await getCollection("bookings");
    const usersCollection = await getCollection("users");

    // Get all tutors
    const tutors = await usersCollection.find({ role: "tutor" }).toArray();

    // Get performance data for each tutor
    const performanceData: TutorPerformance[] = [];

    for (const tutor of tutors) {
      const tutorBookings = await bookingsCollection
        .find({
          serviceType: "tutoring",
          status: { $in: ["confirmed", "completed", "in-progress"] },
        })
        .toArray();

      const totalRevenue = (tutorBookings as BookingDoc[]).reduce(
        (sum: number, booking: BookingDoc) =>
          sum + (booking.pricing?.totalAmount || 0),
        0
      );

      // Extract subjects from tutor profile
      const subjects = tutor.tutorProfile?.subjects || [];

      performanceData.push({
        tutorId: tutor._id.toString(),
        tutorName: tutor.userData?.user?.name || "Unknown",
        totalBookings: tutorBookings.length,
        totalRevenue,
        averageRating: tutor.tutorProfile?.rating || 0,
        subjects,
      });
    }

    // Sort by total revenue descending
    return performanceData.sort((a, b) => b.totalRevenue - a.totalRevenue);
  },
  ["tutor-performance-data"],
  {
    revalidate: CACHE_TIMES.DASHBOARD_STATS,
    tags: [CACHE_TAGS.TUTORS, CACHE_TAGS.BOOKINGS],
  }
);

/**
 * Get tutor subject distribution
 */
export const getTutorSubjectDistribution = unstable_cache(
  async () => {
    const usersCollection = await getCollection("users");

    const tutors = await usersCollection
      .find({
        role: "tutor",
        "tutorProfile.subjects": { $exists: true, $not: { $size: 0 } },
      })
      .toArray();

    const subjectCount: Record<string, number> = {};

    (tutors as TutorDoc[]).forEach((tutor: TutorDoc) => {
      const subjects = tutor.tutorProfile?.subjects || [];
      subjects.forEach((subject: string) => {
        subjectCount[subject] = (subjectCount[subject] || 0) + 1;
      });
    });

    return Object.entries(subjectCount)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count);
  },
  ["tutor-subject-distribution"],
  {
    revalidate: CACHE_TIMES.DASHBOARD_STATS,
    tags: [CACHE_TAGS.TUTORS],
  }
);

/**
 * Get tutor registration trends
 */
export const getTutorRegistrationTrends = unstable_cache(
  async () => {
    const usersCollection = await getCollection("users");
    const currentYear = new Date().getFullYear();

    const monthlyRegistrations = await usersCollection
      .aggregate([
        {
          $match: {
            role: "tutor",
            createdAt: {
              $gte: new Date(currentYear, 0, 1),
              $lte: new Date(currentYear, 11, 31, 23, 59, 59),
            },
          },
        },
        {
          $group: {
            _id: { month: { $month: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.month": 1 } },
      ])
      .toArray();

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return monthNames.map((name, index) => {
      const monthData = (monthlyRegistrations as MonthlyRegistration[]).find(
        (item: MonthlyRegistration) => item._id.month === index + 1
      );
      return {
        month: name,
        registrations: monthData?.count || 0,
      };
    });
  },
  ["tutor-registration-trends"],
  {
    revalidate: CACHE_TIMES.DASHBOARD_STATS,
    tags: [CACHE_TAGS.TUTORS],
  }
);

// Update tutor function
export async function updateTutor(
  tutorId: string,
  updateData: Partial<UserInterface>
) {
  try {
    const result = await UserRepository.updateUser(tutorId, updateData);

    // Revalidate cache
    // Note: In a real app, you'd use revalidateTag here
    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating tutor:", error);
    return { success: false, error: "Failed to update tutor" };
  }
}

// Delete tutor function
export async function deleteTutor(tutorId: string) {
  try {
    const result = await UserRepository.deleteUser(tutorId);

    // Revalidate cache
    // Note: In a real app, you'd use revalidateTag here
    return { success: true, data: result };
  } catch (error) {
    console.error("Error deleting tutor:", error);
    return { success: false, error: "Failed to delete tutor" };
  }
}

// Get single tutor details
export async function getTutorDetails(tutorId: string) {
  try {
    const tutor = await UserRepository.findById(tutorId);

    return { success: true, data: tutor };
  } catch (error) {
    console.error("Error fetching tutor details:", error);
    return { success: false, error: "Failed to fetch tutor details" };
  }
}
