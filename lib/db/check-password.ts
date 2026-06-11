import { db, settingsTable } from "./src/index";

async function checkPassword() {
  try {
    console.log("🔍 Checking current admin password...\n");
    
    const rows = await db.select().from(settingsTable).limit(1);
    
    if (rows.length === 0) {
      console.log("⚠️  No settings found in database.");
      console.log("Default password would be: admin123");
    } else {
      const settings = rows[0];
      console.log("📋 Current Settings:");
      console.log("   ID:", settings.id);
      console.log("   Admin Password:", settings.adminPasswordHash);
      console.log("\n✅ This is the password you need to use for the admin panel.");
    }
    process.exit(0);
  } catch (error) {
    console.error("❌ Error checking password:", error);
    process.exit(1);
  }
}

checkPassword();
