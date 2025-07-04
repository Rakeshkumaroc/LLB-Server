const app = require("./app"); // Import the app
const dotenv = require("dotenv");
const cron = require("node-cron");
const { sendFollowUpReminders } = require("./controllers/followUpController");

// Load environment variables from .env file
dotenv.config();

// Choose a port (default to 5000 if not provided)
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
// ⏰ Schedule daily 8AM reminder
cron.schedule("34 19 4 7 *", async () => {
  console.log("📨 Running 7:32 PM follow-up reminder check...");
  await sendFollowUpReminders();
});
