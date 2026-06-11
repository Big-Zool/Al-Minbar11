import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

// Get the new password from command line argument or use default
const newPassword = process.argv[2] || "admin123";

async function resetPassword() {
  try {
    console.log(`🔄 Resetting admin password to: ${newPassword}`);
    
    // Get all settings rows
    const rows = await db.select().from(settingsTable).limit(1);
    
    if (rows.length === 0) {
      // No settings exist, create one
      await db.insert(settingsTable).values({
        adminPasswordHash: newPassword,
      });
      console.log("✅ Created new settings with password:", newPassword);
    } else {
      // Update existing settings
      await db
        .update(settingsTable)
        .set({ adminPasswordHash: newPassword })
        .where(eq(settingsTable.id, rows[0].id));
      console.log("✅ Admin password reset successfully to:", newPassword);
    }
    
    console.log("\n📝 You can now use this password to log in to the admin panel.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    process.exit(1);
  }
}

resetPassword();
