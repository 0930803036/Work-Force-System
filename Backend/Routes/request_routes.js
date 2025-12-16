const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authentication");  

// -------------------- Controllers --------------------
const { createRequest, approveEmergencyBriefing } = require("../controllers/requests/create_requests_controller");
const { deleteAllRequests } = require("../controllers/requests/delete_all_requests_controller");
const { deleteRequest } = require("../controllers/requests/delete_request_controller");

// -------------------- Routes --------------------

// Create a new request
router.post("/", authenticate, createRequest);

// Approve or reject Emergency Briefing (coach only)
router.patch("/approve/:userId", authenticate, approveEmergencyBriefing);

// Delete all requests
router.delete("/delete-all", authenticate, deleteAllRequests);

// Delete a specific request
router.delete("/:userId", authenticate, deleteRequest);

module.exports = router;
