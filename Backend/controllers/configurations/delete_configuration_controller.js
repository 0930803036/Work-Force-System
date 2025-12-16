const { Configuration } = require("../../models");

const deleteConfiguration = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({ message: "userId not found" });
    }

    // -----------------------------
    // Delete all configurations for user
    // -----------------------------
    const deleted = await Configuration.destroy({
      where: { userId }
    });

    if (deleted === 0) {
      return res.status(404).json({ message: "No configuration found to delete" });
    }

    return res.status(200).json({
      message: "Configuration(s) deleted successfully",
      deletedCount: deleted
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { deleteConfiguration };
