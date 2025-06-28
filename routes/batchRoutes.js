// ======================== ROUTES/batch.routes.js ========================
const express = require("express");
const router = express.Router();
const  {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
getAllBatchesByCourseId
} = require("../controllers/batchController");
const { tokenChecker, allowRoles } = require("../middleware/authChecker");
// CREATE
router.post("/create-batch",tokenChecker, allowRoles(["admin"]) ,createBatch);

// GET ALL
router.get("/get-all-batches", getAllBatches);

// GET SINGLE BY ID
router.get("/get-batch-by-id/:id", getBatchById);
router.get("/get-all-batches-by-courseId/:id",   getAllBatchesByCourseId);

// UPDATE
router.put("/update-batch/:id",tokenChecker, allowRoles(["admin"]), updateBatch);

// DELETE (soft)
router.delete("/delete-batch/:id",tokenChecker, allowRoles(["admin"]), deleteBatch);

module.exports = router;
