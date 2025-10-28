import { NextResponse } from "next/server";
import { getChildren } from "../../dashboard/children/action";

export async function GET() {
  try {
    const data = await getChildren();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Children API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch children data" },
      { status: 500 }
    );
  }
}
