const express = require("express");
const router = express.Router();
const{authenticate} = require("../middleware/authentication");
/** login user */
const { login } = require("../controllers/loginLogout/login_controller");
router.post("/login", login);

/** logout user */
const { logout } = require("../controllers/loginLogout/logout_controller.js");
router.post("/logout", authenticate, logout);

module.exports = router;
