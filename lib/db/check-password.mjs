import pg from "pg";

const { Pool } = pg;

async function checkPassword() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ ERROR: DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log("🔍 Checking current admin password...\n");
    
    const result = await pool.query("SELECT * FROM settings LIMIT 1");
    
    if (result.rows.length === 0) {
      console.log("⚠️  No settings found in database.");
      console.log("Default password would be: admin123");
    } else {
      const settings = result.rows[0];
      console.log("📋 Current Settings:");
      console.log("   ID:", settings.id);
      console.log("   Admin Password:", settings.admin_password_hash);
      console.log("\n✅ This is the password you need to use for the admin panel.");
    }
  } catch (error) {
    console.error("❌ Error checking password:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkPassword();
