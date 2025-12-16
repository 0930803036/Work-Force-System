const { Shift } = require('../../models');

// ---------------------------
// Get all shifts
// ---------------------------
const getAllShifts = async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: You must be logged in to view shifts',
    });
  }

  try {
    // Fetch all shifts sorted by shiftStart ascending
    const shifts = await Shift.findAll({
      order: [["shiftStart", "ASC"]],
    });

    return res.status(200).json({ success: true, shifts });
  } catch (err) {
    console.error('Error fetching shifts:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

module.exports = { getAllShifts };
