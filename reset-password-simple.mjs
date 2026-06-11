import pg from "pg";

const { Pool } = pg;

// Get the new password from command line argument or use default
const newPassword = process.argv[2] || "admin123";

async function resetPassword() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ ERROR: DATABASE_URL environment variable is not set");
    console.log("Make sure you're in the Talk-Plan directory where .env file exists");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log(`🔄 Resetting admin password to: ${newPassword}`);
    
    // Check if settings table exists and has data
    const checkResult = await pool.query("SELECT * FROM settings LIMIT 1");
    
    if (checkResult.rows.length === 0) {
      // No settings exist, create one
      await pool.query(
        "INSERT INTO settings (admin_password_hash) VALUES ($1)",
        [newPassword]
      );
      console.log("✅ Created new settings with password:", newPassword);
    } else {
      // Update existing settings
      await pool.query(
        "UPDATE settings SET admin_password_hash = $1 WHERE id = $2",
        [newPassword, checkResult.rows[0].id]
      );
      console.log("✅ Admin password reset successfully to:", newPassword);
    }
    
    console.log("\n📝 You can now use this password to log in to the admin panel.");
  } catch (error) {
    console.error("❌ Error resetting password:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

resetPassword();
