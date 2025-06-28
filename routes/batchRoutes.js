// ======================== ROUTES/batch.routes.js ========================
const express = require("express");
const router = express.Router();
const batchController = require("../controllers/batch.controller");

// CREATE
router.post("/",createBatch);

// GET ALL
router.get("/", getAllBatches);

// GET SINGLE BY ID
router.get("/:id", getBatchById);

// UPDATE
router.put("/:id", updateBatch);

// DELETE (soft)
router.delete("/:id", deleteBatch);

module.exports = router;
