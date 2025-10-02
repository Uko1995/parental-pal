import { UserRepository } from "@/models";

export const getChildren = async () => {
  const result = await UserRepository.getAllChildren();
  const childrenStats = await UserRepository.getChildrenStats();
  return { 
    children: result.children, 
    serviceStats: result.serviceStats,
    childrenStats 
  };
};
