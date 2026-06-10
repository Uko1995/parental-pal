import { v4 as uuidv4 } from "uuid";

export interface BookingChildPrefill {
  name: string;
  age: number;
  gender?: string;
  class?: string;
  schoolName?: string;
}

export interface BookingProfilePrefill {
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  parentAddress: string;
  children: BookingChildPrefill[];
}

export interface ChildInfoDefaults {
  name?: string;
  age?: number;
  gender?: string;
  allergies?: string;
  specialRequirements?: string;
}

export function childPrefillToDefaults(
  child: BookingChildPrefill,
): ChildInfoDefaults {
  return {
    name: child.name,
    age: child.age,
    gender: child.gender,
  };
}

export function createPrefilledChildrenFromProfile(
  children: BookingChildPrefill[],
  createId: () => string = uuidv4,
) {
  const ids = children.map(() => createId());
  const defaults: Record<string, ChildInfoDefaults> = {};
  const ages: Record<string, number> = {};

  children.forEach((child, index) => {
    const id = ids[index];
    defaults[id] = childPrefillToDefaults(child);
    ages[id] = child.age;
  });

  return { ids, defaults, ages };
}

export function applyParentContactPrefill(
  profile: BookingProfilePrefill,
  setters: {
    setParentName: (value: string) => void;
    setParentEmail: (value: string) => void;
    setParentPhone: (value: string) => void;
    setParentAddress: (value: string) => void;
  },
) {
  if (profile.parentName) setters.setParentName(profile.parentName);
  if (profile.parentEmail) setters.setParentEmail(profile.parentEmail);
  if (profile.parentPhone) setters.setParentPhone(profile.parentPhone);
  if (profile.parentAddress) setters.setParentAddress(profile.parentAddress);
}
