/** create user */
const { User } = require("../../models");
const bcrypt = require("bcrypt");

const createUser = async (req, res) => {
  try {
    const {
      userId,
      firstName,
      middleName,
      lastName,
      userName,
      password,
      role,
      skill,
      channel,
      coachGroup,
      supGroup,
      managerGroup,
      site,
      director
      
    } = req.body;

    const existingUser = await User.findOne({ where: { userId } });
    if (existingUser) {
      return res.status(400).json({ message: "UserId already exists" });
    }

    // Set default password if none provided
    const userPassword = password || "Pass@123"; // <-- default password

    const generateSalt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(userPassword, generateSalt);

    const newUser = await User.create({
      userId,
      firstName,
      middleName,
      lastName,
      userName,
      password: encryptedPassword,
      role,
      skill,
      channel,
      coachGroup,
      supGroup,
      managerGroup,
      site,
      director
    });

    res.status(201).json(newUser);
  } catch (error) {
  console.error("Error creating user:", error);
  res.status(500).json({ message: "Server error", error: error.message });
}
};


module.exports = {
  createUser
}