const { Status } = require("../../models");

// ---------------------------
// Get all statuses (only statusName, alphabetical)
// ---------------------------
const getStatuses = async (req, res) => {
  // User must be logged in — your auth middleware should set req.user
  if (!req.user || !req.user.userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: You must be logged in to view statuses",
    });
  }

  try {
    const statuses = await Status.findAll({
      attributes: ["statusName"], // only return this column
      order: [["statusName", "ASC"]], // alphabetical order
    });

    // return as array directly (not nested in object) for easier frontend usage
    const statusNames = statuses.map((s) => s.statusName);

    return res.status(200).json(statusNames);
  } catch (err) {
    console.error("Error fetching statuses:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

module.exports = { getStatuses };
