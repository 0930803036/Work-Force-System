const express = require('express');
const router = express.Router();

/** authentication */
const {authenticate} = require("../middleware/authentication")
// const {authorize} = require("../middleware/authorization")

/** get all shifts */
const { getAllShifts } = require('../controllers/shift/get_all_shifts_controller');
router.get('/', authenticate, getAllShifts);

/** create a shift */
const { createShift } = require('../controllers/shift/create_shift_controller');
router.post('/', authenticate, createShift);

/** update a shift */
const { updateShift } = require('../controllers/shift/update_shift_controller');
router.patch('/:shiftName', authenticate, updateShift);

/** delete a shift */
const { deleteShift } = require('../controllers/shift/delete_shift_controller');
router.delete('/:shiftName', authenticate, deleteShift);

module.exports = router;