/** delete user */
const { User } = require("../../models");
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.destroy({ where: { userId } });

    if (user === 0) {
      return res.status(404).json({ message: `User with id ${userId} not found` });
    }

    res.status(200).json({ message: `User with user-id ${userId} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


module.exports = {deleteUser}