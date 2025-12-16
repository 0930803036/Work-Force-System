/** Delete all users from the table */
const { User } = require("../../models");
const deleteAllUsers = async (req, res) => {
  try {
    // Check for authenticated user
    if (!req.user) {
      return res.status(401).json({ message: "No user provided" });
    }

    // Check for admin role
    // if (req.user.role !== "admin") {
    //   return res.status(403).json({ message: "Unauthorized: Admins only" });
    // }

    // Delete all users
    const deletedCount = await User.destroy({
      where: {},      // all users
      truncate: false // keep auto-increment of the id in db table
    });

    res.status(200).json({
      message: `All users deleted successfully`,
      deletedCount
    });
  } catch (error) {
    console.error("Delete all users error:", error);
    res.status(500).json({
      message: "Failed to delete users",
      error: error.message || error
    });
  }
};

module.exports ={deleteAllUsers};