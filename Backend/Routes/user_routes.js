const express = require("express");
const router = express.Router();

const {authenticate} = require("../middleware/authentication");

/** create user */
const { createUser } = require("../controllers/users/create_user_controller");
router.post("/", createUser);

/** read/ get users */
const { readUsers,getUsersWithLatestStatus} = require("../controllers/users/read_users_controller");
router.get("/", readUsers);
router.get("/group",authenticate, getUsersWithLatestStatus);


/** search user By Id*/
const { searchUserById } = require("../controllers/users/search_user_byId_controller");
router.get("/:userId", searchUserById);


/** update user */
const { userUpdate } = require("../controllers/users/update_user_controller");
router.patch("/:userId", userUpdate);

/** delete all users from database */
const { deleteAllUsers } = require("../controllers/users/delete_all_users_controller");
router.delete("/delete-all", authenticate,deleteAllUsers);


/** delete user By Id*/
const { deleteUser } = require("../controllers/users/delete_user_controller");
router.delete("/:userId", deleteUser);


module.exports = router;
