const { Status } = require('../../models');

// ---------------------------
// Get a status by statusName
// ---------------------------
const getStatusByName = async (req, res) => {
    // User must be logged in — your auth middleware should set req.user
  if (!req.user || !req.user.userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: You must be logged in to create a status',
    });
  }
  const { statusName } = req.params; // get from URL
  if (!statusName) {
    return res.status(400).json({ success: false, message: 'statusName is required in URL' });
  }

  try {
    // Find status by its name
    const status = await Status.findOne({ where: { statusName } });

    if (!status) {
      return res.status(404).json({
        success: false,
        message: `Status '${statusName}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      status,
    });
  } catch (err) {
    console.error('Error fetching status:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

module.exports = { getStatusByName };
