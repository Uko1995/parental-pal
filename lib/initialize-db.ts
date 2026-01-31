/**
 * Database initialization script
 * Run this to set up indexes and collections
 */

import { initializeLoginAttemptsIndexes } from "./account-lockout-mongodb";
import { initializeAuditLogsIndexes } from "./audit-logger-mongodb";
import { WeekendEnrichmentRepository } from "./WeekendEnrichmentRepository";

export async function initializeDatabase(): Promise<void> {
  console.log("Initializing database...");

  try {
    // Initialize login attempts collection indexes
    await initializeLoginAttemptsIndexes();
    console.log("✓ Login attempts indexes created");

    // Initialize audit logs collection indexes
    await initializeAuditLogsIndexes();
    console.log("✓ Audit logs indexes created");

    // Weekend Enrichment collections (enrollments + save slots)
    await WeekendEnrichmentRepository.initializeEnrollments();
    console.log("✓ Weekend enrollments collection created");
    await WeekendEnrichmentRepository.initializeSaveSlots();
    console.log("✓ Weekend save slots collection created");

    console.log("Database initialization complete");
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log("Done");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}
