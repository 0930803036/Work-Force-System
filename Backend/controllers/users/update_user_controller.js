const { User } = require("../../models");
const bcrypt = require("bcrypt");

const userUpdate = async (req, res) => {
  try {
    // Use userId from params, not from body
    const { userId } = req.params;

    const {
      firstName,
      middleName,
      lastName,
      userName,
      password,
      role,
      skill,
      channel,
      coachGroup,
      supervisorGroup,
      managerGroup,
      site,
      director
    } = req.body;

    const updateData = {};

    if (firstName) updateData.firstName = firstName;
    if (middleName) updateData.middleName = middleName;
    if (lastName) updateData.lastName = lastName;
    if (userName) updateData.userName = userName;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (role) updateData.role = role;
    if (skill) updateData.skill = skill;
    if (channel) updateData.channel = channel;
    if (coachGroup) updateData.coachGroup = coachGroup;
    if (supervisorGroup) updateData.supervisorGroup = supervisorGroup;
    if (managerGroup) updateData.managerGroup = managerGroup;
    if (site) updateData.site = site;
    if (director) updateData.director = director;

    // Only update if there is data to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const [updatedCount] = await User.update(updateData, { where: { userId } });

    if (updatedCount === 0) {
      return res.status(404).json({ message: `User with id ${userId} not found` });
    }

    const updatedUser = await User.findOne({ where: { userId } });

    // Always return once
    return res.status(200).json(updatedUser);

  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { userUpdate };
