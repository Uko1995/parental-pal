import {
  type CampLocation,
  type CampSeasonId,
  SUMMER_CAMP_RATES,
  canChildBoard,
  getCampSeason,
} from "@/lib/camp-seasons";
import { BookingRepository } from "@/lib/BookingRepository";

export interface BoardingCapacityStatus {
  capacity: number;
  used: number;
  remaining: number;
  isFull: boolean;
}

export interface BoardingCapacityInput {
  campSeasonId: CampSeasonId;
  campLocation: CampLocation;
  requestedBoardingChildren?: number;
  excludeBookingId?: string;
}

export function isBoardingCapacityApplicable(
  campSeasonId: CampSeasonId,
  campLocation: CampLocation | null | undefined,
): boolean {
  const season = getCampSeason(campSeasonId);
  return season.isSummer && campLocation === "gbagada";
}

export function isValidBoardingChild(
  age: number,
  campLocation: CampLocation | null | undefined,
): boolean {
  return campLocation === "gbagada" && canChildBoard(age);
}

export function evaluateBoardingCapacity(
  used: number,
  requestedBoardingChildren = 0,
): BoardingCapacityStatus {
  const capacity = SUMMER_CAMP_RATES.boardingCapacity;
  const remaining = Math.max(0, capacity - used);
  const isFull = remaining <= 0;

  return {
    capacity,
    used,
    remaining,
    isFull,
  };
}

export async function getBoardingCapacityStatus(
  input: BoardingCapacityInput,
): Promise<BoardingCapacityStatus> {
  if (!isBoardingCapacityApplicable(input.campSeasonId, input.campLocation)) {
    return {
      capacity: SUMMER_CAMP_RATES.boardingCapacity,
      used: 0,
      remaining: 0,
      isFull: true,
    };
  }

  const used = await BookingRepository.countBoardingChildren(
    input.campSeasonId,
    input.campLocation,
    input.excludeBookingId,
  );

  return evaluateBoardingCapacity(used);
}

export function getBoardingCapacityError(
  status: BoardingCapacityStatus,
  requestedBoardingChildren: number,
): string | null {
  if (requestedBoardingChildren <= 0) {
    return null;
  }

  if (status.used + requestedBoardingChildren <= status.capacity) {
    return null;
  }

  if (status.remaining <= 0) {
    return `Boarding is fully booked (${status.capacity}/${status.capacity}). Please select day camp only.`;
  }

  return `Only ${status.remaining} boarding spot(s) remaining. Reduce boarding selections and try again.`;
}

export async function checkBoardingCapacityFromDb(
  input: BoardingCapacityInput,
): Promise<{
  status: BoardingCapacityStatus;
  allowed: boolean;
  error: string | null;
}> {
  const requested = input.requestedBoardingChildren ?? 0;
  const status = await getBoardingCapacityStatus(input);

  if (requested <= 0) {
    return { status, allowed: true, error: null };
  }

  if (!isBoardingCapacityApplicable(input.campSeasonId, input.campLocation)) {
    return {
      status,
      allowed: false,
      error:
        "Boarding is only available at Gbagada for children aged 6–14.",
    };
  }

  const error = getBoardingCapacityError(status, requested);
  return {
    status,
    allowed: error === null,
    error,
  };
}

export async function assertBoardingCapacityAvailable(
  input: BoardingCapacityInput,
): Promise<void> {
  const requested = input.requestedBoardingChildren ?? 0;
  if (requested <= 0) {
    return;
  }

  if (!isBoardingCapacityApplicable(input.campSeasonId, input.campLocation)) {
    throw new Error(
      "Boarding is only available at Gbagada for children aged 6–14.",
    );
  }

  const status = await getBoardingCapacityStatus(input);
  const error = getBoardingCapacityError(status, requested);
  if (error) {
    throw new Error(error);
  }
}
