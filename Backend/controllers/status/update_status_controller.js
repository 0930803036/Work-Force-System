const { Status } = require('../../models');

// ---------------------------
// Update a status
// ---------------------------
const updateStatus = async (req, res) => {
    // User must be logged in — your auth middleware should set req.user
  if (!req.user || !req.user.userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: You must be logged in to create a status',
    });
  }
  const { statusName } = req.params;  // old name from URL
  const { statusName: newStatusName, description } = req.body; // new fields

  console.log("Updating:", statusName, "->", newStatusName);

  try {
    // Find status by current name
    const status = await Status.findOne({ where: { statusName } });

    if (!status) {
      return res.status(404).json({
        success: false,
        message: `Status '${statusName}' not found`,
      });
    }

    // Check for duplicate name only when renaming
    if (newStatusName && newStatusName !== statusName) {
      const existing = await Status.findOne({ where: { statusName: newStatusName } });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Status '${newStatusName}' already exists`,
        });
      }
    }

    // Apply updates
    if (newStatusName) status.statusName = newStatusName;
    if (description) status.description = description;

    await status.save();

    return res.status(200).json({
      success: true,
      message: `Status '${statusName}' updated successfully`,
      updatedStatus: status,
    });

  } catch (err) {
    console.error('Error updating status:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

module.exports = { updateStatus };
