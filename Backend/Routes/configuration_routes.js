const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authentication");

/** read configurations */
const { getConfigurations } = require("../controllers/configurations/get_all_configurations_controller");
router.get("/", authenticate, getConfigurations);

/** create configuration */
const { createConfiguration } = require("../controllers/configurations/create_configuration_controller");
router.post("/", authenticate, createConfiguration); 


/** update configuration */
const { updateConfiguration } = require("../controllers/configurations/update_configuration_controller");
router.patch("/:userId", authenticate,  updateConfiguration); 

/** delete configuration */
const { deleteConfiguration } = require("../controllers/configurations/delete_configuration_controller");
router.delete("/:userId", authenticate, deleteConfiguration);

module.exports = router;