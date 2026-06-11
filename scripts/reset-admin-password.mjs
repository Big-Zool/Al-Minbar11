import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";

const { Pool } = pg;

// Define the settings table schema
const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  adminPasswordHash: text("admin_password_hash").notNull().default("admin123"),
  aboutAr: text("about_ar").notNull().default(""),
  aboutEn: text("about_en").notNull().default(""),
  aboutTr: text("about_tr").notNull().default(""),
  aboutFr: text("about_fr").notNull().default(""),
  aboutUr: text("about_ur").notNull().default(""),
  aboutFa: text("about_fa").notNull().default(""),
});

// Get the new password from command line argument or use default
const newPassword = process.argv[2] || "admin123";

async function resetPassword() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ ERROR: DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema: { settingsTable } });

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
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

resetPassword();
