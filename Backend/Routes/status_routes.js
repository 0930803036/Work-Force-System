const express = require('express');
const router = express.Router();  

const {authenticate} = require("../middleware/authentication");

/* Create a new status */
const { createStatus } = require('../controllers/status/create_status_controller');
router.post('/', authenticate, createStatus);

/* Get all statuses */
const { getStatuses } = require('../controllers/status/get_all_status_controller');
router.get('/', authenticate, getStatuses);

/* Get a status by statusName */
const { getStatusByName } = require('../controllers/status/get_by_statusName_controller');
router.get('/:statusName', authenticate, getStatusByName);

/* Update a status */
const { updateStatus } = require('../controllers/status/update_status_controller');
router.patch('/:statusName', authenticate, updateStatus);

/* Delete a status */
const { deleteStatus } = require('../controllers/status/delete_status_controller');
router.delete('/:statusName', authenticate, deleteStatus);

module.exports = router;