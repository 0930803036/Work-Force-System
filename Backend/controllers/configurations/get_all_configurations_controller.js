const { Configuration, User } = require("../../models");

const getConfigurations = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({ message: "userId not found" });
    }

    // -----------------------------
    // Find all configurations of this user
    // -----------------------------
    const configurations = await Configuration.findAll({
      // where: { userId }
    });

    if (!configurations || configurations.length === 0) {
      return res.status(404).json({ message: "No configurations found for this user" });
    }

    // -----------------------------
    // Return all configurations
    // -----------------------------
    return res.status(200).json(configurations);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { getConfigurations };
