const { Status } = require('../../models');

const createStatus = async (req, res) => {
  // User must be logged in — your auth middleware should set req.user
  if (!req.user || !req.user.userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: You must be logged in to create a status',
    });
  }

  const userId = req.user.userId;
  const { statusName, description } = req.body;

  if (!statusName) {
    return res.status(400).json({
      success: false,
      message: 'statusName is required',
    });
  }

  try {
    // Prevent duplicate statusName
    const existing = await Status.findOne({ where: { statusName } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'statusName already exists',
      });
    }

    const status = await Status.create({
      userId,
      statusName,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Status created successfully",
      status,
    });

  } catch (err) {
    console.error("Status creation error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

module.exports = { createStatus };
