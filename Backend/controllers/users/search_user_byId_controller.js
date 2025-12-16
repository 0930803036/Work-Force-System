/** get single user by userId */
const { User } = require("../../models");
const searchUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ where: { userId } });
    if (!user) {
      return res.status(404).json({ message: `User with userId ${userId} not found` });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "server error", error });
  }
};


module.exports ={ searchUserById};