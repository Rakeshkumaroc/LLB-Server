const app = require("./app"); // Import the app
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Choose a port (default to 5000 if not provided)
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
