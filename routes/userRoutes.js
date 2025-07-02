const express = require("express");
const {
  signUp,
  login,
  addChildAdmin,
  getAllInstitutes,
  getAllStudent,
  updateUser,
  deleteUser,
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

router.get(
  "/get-all-institutes",
  tokenChecker,
  allowRoles(["admin"]),
  getAllInstitutes
);
router.get(
  "/get-all-student",
  tokenChecker,
  allowRoles(["admin"]),
  getAllStudent
);

router.put("/update-user/:id", tokenChecker, updateUser);

router.delete("/delete-user/:id", tokenChecker, getAllStudent);

module.exports = router;
