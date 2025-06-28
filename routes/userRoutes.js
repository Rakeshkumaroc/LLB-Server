const express = require("express");
const {
  signUp,
  login,
  addChildAdmin,
} = require("../controllers/userController");
const { tokenChecker, allowRoles } = require("../middleware/authChecker");
const router = express.Router();

router.post("/sign-up", signUp);
router.post("/login", login);

router.post(
  "/create-child-admin",
  tokenChecker,
  allowRoles(["admin"]),
  addChildAdmin
);

module.exports = router;
