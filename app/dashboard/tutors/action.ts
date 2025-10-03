import { UserRepository } from "@/lib/UserRepository";
import { unstable_cache } from "next/cache";
import { CACHE_TIMES, CACHE_TAGS } from "@/lib/cache-config";
import { UserInterface } from "@/models/User";

interface TutorsData {
  tutors: UserInterface[];
  tutorStats: {
    totalTutors: number;
    activeTutors: number;
    inactiveTutors: number;
  };
}

const fetchTutors = async (): Promise<TutorsData> => {
  const tutors = await UserRepository.findByRole("tutor");

  const tutorStats = {
    totalTutors: tutors.length,
    activeTutors: tutors.filter((tutor: UserInterface) => tutor.isActive)
      .length,
    inactiveTutors: tutors.filter((tutor: UserInterface) => !tutor.isActive)
      .length,
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
