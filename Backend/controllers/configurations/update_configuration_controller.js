const { Configuration, User } = require("../../models");

const updateConfiguration = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const {
      channel,
      skill,
      managerGroup,
      supervisorGroup,
      coachGroup,
      teamAvailability,
      startTime,
      endTime,
      statusName
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId not found" });
    }

    // Find existing configuration for the user
    const config = await Configuration.findOne({ where: { userId } });

    if (!config) {
      return res.status(404).json({ message: "Configuration not found for this user" });
    }

    // --------------------------------------
    // Perform updates only for provided fields
    // --------------------------------------
    config.channel = channel !== undefined ? channel : config.channel;
    config.skill = skill !== undefined ? skill : config.skill;

    config.managerGroup = managerGroup !== undefined ? managerGroup : config.managerGroup;
    config.supervisorGroup = supervisorGroup !== undefined ? supervisorGroup : config.supervisorGroup;
    config.coachGroup = coachGroup !== undefined ? coachGroup : config.coachGroup;

    if (teamAvailability !== undefined) {
      const parsedTeam = parseFloat(teamAvailability);
      config.teamAvailability = isNaN(parsedTeam) ? config.teamAvailability : parsedTeam;
    }

    config.startTime = startTime !== undefined ? startTime : config.startTime;
    config.endTime = endTime !== undefined ? endTime : config.endTime;

    config.statusName = statusName !== undefined ? statusName : config.statusName;

    // Save updates
    await config.save();

    return res.status(200).json({
      message: "Configuration updated successfully",
      updatedConfig: config
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { updateConfiguration };
