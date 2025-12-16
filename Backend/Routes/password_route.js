const express = require("express");
const router = express.Router();
const{authenticate} = require("../middleware/authentication");


/** change password */
const { changePassword } = require("../controllers/password/change_password_controller");
router.patch("/change-password",authenticate, changePassword);

/** reset password */
const { resetPassword } = require("../controllers/password/reset_password_controller");
router.patch("/reset-password/:userId",authenticate, resetPassword);

module.exports = router;
