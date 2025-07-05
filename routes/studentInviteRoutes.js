const express = require("express");
const {
  sendStudentInvites,
  registerStudentViaInvite,
  getAllStudentsByInstituteId,
} = require("../controllers/studentInvitesController");
const { tokenChecker } = require("../middleware/authChecker");

const router = express.Router();

//  Authenticated Institute can send invites
router.post("/send-invites", tokenChecker, sendStudentInvites);

//  Public route for student registration via invite
router.post("/register/:token", registerStudentViaInvite);

router.get(
  "/get-all-students-by-institute-id/:instituteId",
  getAllStudentsByInstituteId
);

module.exports = router;
