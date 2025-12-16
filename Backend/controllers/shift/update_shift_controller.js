const { Shift } = require('../../models');

// ---------------------------
// Update a shift (PATCH)
// ---------------------------
const updateShift = async (req, res) => {
  const { shiftName } = req.params; // original shiftName
  const { newShiftName, shiftStart, shiftEnd } = req.body; // fields to update

  // ---------------------------
  // Ensure user is logged in
  // ---------------------------
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: You must be logged in to update a shift',
    });
  }

  try {
    // ---------------------------
    // Find the shift by shiftName
    // ---------------------------
    const shift = await Shift.findOne({ where: { shiftName } });
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Shift not found',
      });
    }

    // ---------------------------
    // Ensure only creator can update
    // ---------------------------
    if (shift.userId !== userId) {  // Use creatorUserId
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update your own shifts',
      });
    }

    // ---------------------------
    // Update only provided fields
    // ---------------------------
    if (newShiftName) shift.shiftName = newShiftName;
    if (shiftStart) shift.shiftStart = shiftStart;
    if (shiftEnd) shift.shiftEnd = shiftEnd;

    await shift.save();

    return res.status(200).json({
      success: true,
      shift,
    });
  } catch (err) {
    console.error('Error updating shift:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

module.exports = { updateShift };
