const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createInstitute,
  getAllInstitutesForUser,
  getSingleInstituteById,
  updateInstituteById,
  deleteInstituteById,
} = require("../controllers/instituteController");

// Create
router.post("/",createInstitute);

// Get all for logged-in user
router.get("/", getAllInstitutesForUser);

// Get single
router.get("/:id", getSingleInstituteById);

// Update
router.put("/:id", updateInstituteById);

// Delete
router.delete("/:id", deleteInstituteById);

module.exports = router;
