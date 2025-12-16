const { Request } = require("../../models");

const deleteAllRequests = async (req, res) => {
  try {
    // Delete ALL requests in the table
    const deleted = await Request.destroy({
      where: {},   // <-- empty where = delete ALL rows
      truncate: false   // set true if you want TRUNCATE behavior
    });

    return res.status(200).json({
      message: "All requests deleted successfully",
      deletedCount: deleted
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { deleteAllRequests };
