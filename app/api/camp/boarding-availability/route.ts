import { NextRequest, NextResponse } from "next/server";
import {
  type CampLocation,
  type CampSeasonId,
  SUMMER_CAMP_RATES,
} from "@/lib/camp-seasons";
import {
  checkBoardingCapacityFromDb,
  getBoardingCapacityStatus,
  isBoardingCapacityApplicable,
} from "@/lib/boarding-capacity";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
};

function unavailableStatus() {
  return NextResponse.json(
    {
      capacity: SUMMER_CAMP_RATES.boardingCapacity,
      used: 0,
      remaining: 0,
      isFull: true,
    },
    { headers: NO_STORE_HEADERS },
  );
}

export async function GET(request: NextRequest) {
  try {
    const campSeasonId = request.nextUrl.searchParams.get(
      "campSeasonId",
    ) as CampSeasonId | null;
    const campLocation = request.nextUrl.searchParams.get(
      "campLocation",
    ) as CampLocation | null;

    if (!campSeasonId || !campLocation) {
      return NextResponse.json(
        { error: "campSeasonId and campLocation are required." },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    if (!isBoardingCapacityApplicable(campSeasonId, campLocation)) {
      return unavailableStatus();
    }

    const status = await getBoardingCapacityStatus({
      campSeasonId,
      campLocation,
    });

    return NextResponse.json(status, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("Boarding availability error:", error);
    return NextResponse.json(
      { error: "Failed to load boarding availability." },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const campSeasonId = String(body?.campSeasonId || "") as CampSeasonId;
    const campLocation = String(body?.campLocation || "") as CampLocation;
    const requestedBoardingChildren = Math.max(
      0,
      parseInt(String(body?.requestedBoardingChildren ?? "0"), 10) || 0,
    );

    if (!campSeasonId || !campLocation) {
      return NextResponse.json(
        { error: "campSeasonId and campLocation are required." },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    if (!isBoardingCapacityApplicable(campSeasonId, campLocation)) {
      return NextResponse.json(
        {
          ...evaluateUnavailable(),
          allowed: requestedBoardingChildren === 0,
          error:
            requestedBoardingChildren > 0
              ? "Boarding is only available at Gbagada for children aged 6–14."
              : null,
        },
        { headers: NO_STORE_HEADERS },
      );
    }

    const result = await checkBoardingCapacityFromDb({
      campSeasonId,
      campLocation,
      requestedBoardingChildren,
    });

    return NextResponse.json(result, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("Boarding availability check error:", error);
    return NextResponse.json(
      { error: "Failed to check boarding availability." },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}

function evaluateUnavailable() {
  return {
    status: {
      capacity: SUMMER_CAMP_RATES.boardingCapacity,
      used: 0,
      remaining: 0,
      isFull: true,
    },
    allowed: false,
    error: null as string | null,
  };
}
