const express = require("express");
const dbConnect = require("./db/db");
const app = express();
const errorHandler = require("./middleware/errorHandler");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");  
const  mentorRoutes = require("./routes/mentorRoutes"); 
const  courseRoutes = require("./routes/courseRoutes"); 
const  batchRoutes = require("./routes/batchRoutes");
const  ratingRoutes = require("./routes/ratingRoutes");
const  moduleRoutes = require("./routes/moduleRoutes");
const  raisedDealRoutes = require("./routes/raisedDealRoutes");
const  genEnquireRoutes = require("./routes/genEnquireRoutes");
const  courseEnquireRoutes = require("./routes/courseEnquiryRoutes");
const cookieParser = require("cookie-parser");

// 1️ Connect to MongoDB
dbConnect();

// 2️ Middleware to parse cookies
app.use(cookieParser());

// 3️ CORS configuration (allow frontend & send cookies)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// 4️ Middleware to parse incoming JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5️  routes mounting
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/mentor", mentorRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/batch", batchRoutes);
app.use("/api/v1/rating", ratingRoutes);
app.use("/api/v1/module", moduleRoutes);
app.use("/api/v1/raised-deal", raisedDealRoutes);
app.use("/api/v1/gen-enquiry", genEnquireRoutes);
app.use("/api/v1/course-enquiry", courseEnquireRoutes);
//  Test Route
app.get("/api/test", (req, res) => {
  res.status(200).json({ message: "OK" });
});
// 6️ Global error handler (should be last)
app.use(errorHandler);

//Ready to export
module.exports = app;
