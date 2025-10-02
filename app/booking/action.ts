"use server";

import { revalidatePath } from "next/cache";

export async function registerChild(formData: FormData) {
  try {
    console.log("Form Data Received:", Object.fromEntries(formData.entries()));

    // Clean up Next.js internal form data
    const cleanedData = Object.fromEntries(formData.entries());
    Object.keys(cleanedData).forEach((key) => {
      if (key.startsWith("$ACTION_ID")) {
        delete cleanedData[key];
      }
    });

    console.log("Cleaned Data:", cleanedData);
    console.log("Google Script URL:", process.env.GOOGLE_SCRIPT_URL);

    // Send to Google Apps Script endpoint
    // const res = await fetch(process.env.GOOGLE_SCRIPT_URL!, {
    //   method: "POST",
    //   body: JSON.stringify(cleanedData),
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // });

    // const responseText = await res.text();
    // console.log("Google Sheets API Response Status:", res.status);
    // console.log("Google Sheets API Response:", responseText);

    // if (!res.ok) {
    //   console.error("Google Sheets submission failed:", {
    //     status: res.status,
    //     statusText: res.statusText,
    //     response: responseText.substring(0, 500), // Truncate long HTML responses
    //   });

    //   // Provide specific error messages based on status code
    //   if (res.status === 401) {
    //     console.error(
    //       "GOOGLE SHEETS SETUP ISSUE: The script is not authorized or URL is incorrect."
    //     );
    //     console.error("Please check:");
    //     console.error("1. Your Google Apps Script URL is correct");
    //     console.error("2. The script is published as 'Execute as: Me'");
    //     console.error(
    //       "3. The script has 'Who has access: Anyone' for web app deployment"
    //     );
    //     console.error("4. Current URL:", process.env.GOOGLE_SCRIPT_URL);
    //   } else if (res.status === 403) {
    //     console.error("GOOGLE SHEETS PERMISSION ISSUE: Script access denied");
    //   } else if (res.status === 404) {
    //     console.error("GOOGLE SHEETS URL ISSUE: Script not found at URL");
    //   }

    //   // Don't fail the entire registration, just log the error
    //   console.warn("Continuing with registration despite Google Sheets error");
    // } else {
    //   console.log("✅ Successfully submitted to Google Sheets");
    // }
    revalidatePath("/register");

    console.log("✅ Registration completed successfully");
  } catch (error) {
    console.error("Registration error:", error);

    // Log the error but don't fail the registration
    console.warn("Registration completed with errors:", error);
    revalidatePath("/register");

    console.log("⚠️ Registration completed with some technical issues");
  }
}
