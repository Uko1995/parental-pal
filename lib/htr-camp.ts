export const HTR26_SEASON_ID = "holidays-that-rock-2026";

export function isHtrSummerCampBooking(
  serviceType: string | undefined,
  campSeasonId: string | undefined,
): boolean {
  return serviceType === "holiday-camps" && campSeasonId === HTR26_SEASON_ID;
}
