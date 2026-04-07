import { UserRepository } from "@/models";
import { unstable_cache } from "next/cache";
import { CACHE_TIMES, CACHE_TAGS } from "@/lib/cache-config";

interface ChildrenData {
  children: Array<{
    childId?: string;
    name: string;
    age: number;
    gender: "male" | "female";
    class?: string;
    schoolName?: string;
    subjects?: string[];
    parentId: string;
    parentName: string | null;
    parentEmail: string | null;
    services: Array<{
      serviceType: string;
      status: string;
      bookingId: string;
      createdAt: Date;
    }>;
  }>;
  serviceStats: Array<{
    serviceType: string;
    childrenCount: number;
    totalBookings: number;
  }>;
  childrenStats: {
    totalChildren: number;
    averageAge: number;
    ageRange: { youngest: number; oldest: number };
    ageGroups: Record<string, number>;
    schoolDistribution: Record<string, number>;
    serviceStats: Array<{
      serviceType: string;
      childrenCount: number;
      totalBookings: number;
    }>;
  };
}

interface PaginatedChildrenData extends ChildrenData {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalChildren: number;
    childrenPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const fetchChildren = async (): Promise<ChildrenData> => {
  const result = await UserRepository.getAllChildren();
  const childrenStats = await UserRepository.getChildrenStats();

  // Transform children data to ensure parentId is a string
  const transformedChildren = result.children.map((child) => ({
    ...child,
    parentId: child.parentId.toString(),
  }));

  return {
    children: transformedChildren,
    serviceStats: result.serviceStats,
    childrenStats,
  };
};

const fetchChildrenPaginated = async (
  page: number = 1,
  limit: number = 10,
  filters?: {
    name?: string;
    minAge?: number;
    maxAge?: number;
    service?: string;
  }
): Promise<PaginatedChildrenData> => {
  const result = await UserRepository.getAllChildren();
  const childrenStats = await UserRepository.getChildrenStats();

  // Transform children data to ensure parentId is a string
  const transformedChildren = result.children.map((child) => ({
    ...child,
    parentId: child.parentId.toString(),
  }));

  // Apply filters
  let filteredChildren = transformedChildren;

  if (filters) {
    filteredChildren = transformedChildren.filter((child) => {
      // Name filter
      if (
        filters.name &&
        !child.name.toLowerCase().includes(filters.name.toLowerCase())
      ) {
        return false;
      }

      // Age filters
      if (filters.minAge && child.age < filters.minAge) {
        return false;
      }
      if (filters.maxAge && child.age > filters.maxAge) {
        return false;
      }

      // Service filter
      if (
        filters.service &&
        !child.services.some(
          (service) => service.serviceType === filters.service
        )
      ) {
        return false;
      }

      return true;
    });
  }

  // Calculate pagination
  const totalChildren = filteredChildren.length;
  const totalPages = Math.ceil(totalChildren / limit);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;

  // Get paginated children
  const paginatedChildren = filteredChildren.slice(startIndex, endIndex);

  return {
    children: paginatedChildren,
    serviceStats: result.serviceStats,
    childrenStats,
    pagination: {
      currentPage,
      totalPages,
      totalChildren,
      childrenPerPage: limit,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
  };
};

export const getChildren = unstable_cache(fetchChildren, ["children-data"], {
  revalidate: CACHE_TIMES.USER_DATA,
  tags: [CACHE_TAGS.CHILDREN, CACHE_TAGS.BOOKINGS, CACHE_TAGS.USERS],
});

// Paginated children with caching
export const getChildrenPaginated = unstable_cache(
  async (
    page: number = 1,
    limit: number = 10,
    filters?: {
      name?: string;
      minAge?: number;
      maxAge?: number;
      service?: string;
    }
  ) => fetchChildrenPaginated(page, limit, filters),
  ["children-paginated"],
  {
    revalidate: CACHE_TIMES.USER_DATA,
    tags: [CACHE_TAGS.CHILDREN, CACHE_TAGS.BOOKINGS, CACHE_TAGS.USERS],
  }
);

// Helper function to get children by age group
export const getChildrenByAgeGroup = unstable_cache(
  async (minAge: number, maxAge: number) => {
    return await UserRepository.getChildrenByAgeRange(minAge, maxAge);
  },
  ["children-by-age"],
  {
    revalidate: CACHE_TIMES.USER_DATA,
    tags: [CACHE_TAGS.CHILDREN],
  }
);

// Update child within parent document
export async function updateChild(
  parentId: string,
  childData: {
    originalName: string; // To find the child
    name: string;
    age: number;
    class?: string;
    schoolName?: string;
    subjects?: string[];
  }
) {
  try {
    // Get the parent user
    const parent = await UserRepository.findById(parentId);
    if (!parent) {
      return { success: false, error: "Parent not found" };
    }

    // Find the child index by matching the original name
    const children = parent.children || [];
    const childIndex = children.findIndex(
      (child) => child.name === childData.originalName
    );

    if (childIndex === -1) {
      return { success: false, error: "Child not found" };
    }

    // Update the specific child
    children[childIndex] = {
      ...children[childIndex],
      name: childData.name,
      age: childData.age,
      class: childData.class,
      schoolName: childData.schoolName,
      subjects: childData.subjects,
    };

    // Update the parent document
    const result = await UserRepository.updateUser(parentId, {
      children,
      updatedAt: new Date(),
    });

    // Revalidate cache
    // Note: In a real app, you'd use revalidateTag here
    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating child:", error);
    return { success: false, error: "Failed to update child" };
  }
}

// Delete child from parent document
export async function deleteChild(parentId: string, childIndex: number) {
  try {
    // Get the parent user
    const parent = await UserRepository.findById(parentId);
    if (!parent) {
      return { success: false, error: "Parent not found" };
    }

    // Remove the specific child
    const children = parent.children || [];
    if (childIndex >= children.length) {
      return { success: false, error: "Child not found" };
    }

    children.splice(childIndex, 1);

    // Update the parent document
    const result = await UserRepository.updateUser(parentId, {
      children,
      updatedAt: new Date(),
    });

    // Revalidate cache
    return { success: true, data: result };
  } catch (error) {
    console.error("Error deleting child:", error);
    return { success: false, error: "Failed to delete child" };
  }
}
