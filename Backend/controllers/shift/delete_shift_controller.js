const { Shift } = require('../../models');

const deleteShift = async (req, res) => {
  const { shiftName } = req.params;

  // ---------------------------
  // Get logged-in user ID
  // ---------------------------
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: You must be logged in to delete a shift',
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
    // Ensure only creator can delete
    // ---------------------------
    if (shift.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete your own shifts',
      });
    }

    // ---------------------------
    // Delete the shift
    // ---------------------------
    await shift.destroy();

    return res.status(200).json({
      success: true,
      message: 'Shift deleted successfully',
    });
  } catch (err) {
    console.error('Error deleting shift:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

module.exports = { deleteShift };
