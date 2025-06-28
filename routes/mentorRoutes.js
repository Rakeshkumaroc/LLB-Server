const express = require("express");
const router = express.Router();
const {
  createMentor,
  updateMentor,
  deleteMentor,
  getAllMentors,
  getMentorById,
} = require("../controllers/mentorController");

const {
  tokenChecker,
 allowRoles
} = require("../middleware/authChecker");

// Protected Routes
router.post("/create-mentor", tokenChecker,  allowRoles(["childAdmin", "admin"]), createMentor);
router.put(
  "/update-mentor/:mentorId",
  tokenChecker,
   allowRoles(["childAdmin", "admin"]),
  updateMentor
);
router.delete(
  "/delete-mentor/:mentorId",
  tokenChecker,
  allowRoles(["childAdmin", "admin"]),
  deleteMentor
);

router.get("/get-all-mentors", getAllMentors); // all mentors
router.get(
  "/get-mentor-by-id/:mentorId",
  tokenChecker,
   allowRoles(["childAdmin", "admin"]),
  getMentorById
); // one mentor

module.exports = router;
