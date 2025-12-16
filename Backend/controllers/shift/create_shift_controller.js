const { Shift } = require('../../models');

const createShift = async (req, res) => {
  // ---------------------------
  // Get the logged-in user's ID
  // ---------------------------
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  const { shiftName, shiftStart, shiftEnd } = req.body;

  // ---------------------------
  // Validate required fields
  // ---------------------------
  if (!shiftName || !shiftStart || !shiftEnd) {
    return res.status(400).json({
      success: false,
      message: 'shiftName, shiftStart, and shiftEnd are required',
    });
  }

  try {
    // ---------------------------
    // Check for duplicate shiftName
    // ---------------------------
    const existingShift = await Shift.findOne({
      where: { shiftName },
    });

    if (existingShift) {
      return res.status(400).json({
        success: false,
        message: 'Shift already exists',
      });
    }

    // ---------------------------
    // Create shift with userId to track creator
    // ---------------------------
    const shift = await Shift.create({
      userId, // 🔥 assign the logged-in user as creator
      shiftName,
      shiftStart,
      shiftEnd,
      
    });

    return res.status(201).json({ success: true, shift });
  } catch (err) {
    console.error('Error creating shift:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

module.exports = { createShift };
