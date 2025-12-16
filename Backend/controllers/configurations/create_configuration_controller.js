const { Configuration, User } = require("../../models");

const createConfiguration = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const {
      channel,
      skill,
      managerGroup,
      supervisorGroup,
      coachGroup,
      teamAvailability,
      shiftName,
      startTime,
      endTime,
      statusName
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId not found" });
    }

    const user = await User.findOne({ where: { userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    
    // -----------------------------
    // Create new configuration
    // -----------------------------
    const newConfiguration = await Configuration.create({
      userId,
      channel: channel !== undefined ? channel : null,
      skill: skill !== undefined ? skill : null,
      managerGroup: managerGroup || null,
      supervisorGroup: supervisorGroup || null,
      coachGroup: coachGroup || null,
      teamAvailability: parseFloat(teamAvailability),
      shiftName: shiftName,
      startTime: startTime,
      endTime: endTime,
      statusName: statusName,
    });

    res.status(201).json(newConfiguration);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};


module.exports = { createConfiguration };