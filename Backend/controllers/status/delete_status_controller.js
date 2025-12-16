const { Status } = require('../../models');

// ---------------------------
// Delete a status
// ---------------------------
const deleteStatus = async (req, res) => {
  // Check if user is logged in (token decoded by middleware)
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: You must be logged in to delete a status'
    });
  }

  const { statusName } = req.params;

  try {
    // Find the status by statusName
    const status = await Status.findOne({ where: { statusName } });

    if (!status) {
      return res.status(404).json({
        success: false,
        message: 'Status not found'
      });
    }

    // Delete the status
    await status.destroy();

    return res.status(200).json({
      success: true,
      message: `${statusName} deleted successfully`
    });

  } catch (err) {
    console.error('Error deleting status:', err);
    
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

module.exports = { deleteStatus };
