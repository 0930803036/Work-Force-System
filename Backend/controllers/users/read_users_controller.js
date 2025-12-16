const { User, Request } = require("../../models");
const { Op } = require("sequelize");

/** get all users */
const readUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    if (!users || users.length === 0) {
      return res.json({ message: "No users found" });
    }
    console.log(res.json(users));
    return res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};
const getUsersWithLatestStatus = async (req, res) => {
  try {
    const coachId = req.user.userId;

    // 1️⃣ Find the coach
    const coach = await User.findOne({ where: { userId: coachId } });
    if (!coach) return res.status(404).json({ error: "Coach not found" });

    // 2️⃣ Get all users in same coach group
    const users = await User.findAll({
      where: {
        coachGroup: coach.coachGroup,
      },
      attributes: ["userId", "firstName", "middleName", "coachGroup", "role"],
      raw: true,
    });

    // 3️⃣ Get latest approved status for each user
    const userIds = users.map((u) => u.userId);
    const requests = await Request.findAll({
      where: {
        userId: { [Op.in]: userIds },
        approvalStatus: "Approved",
      },
      order: [["statusCreatedAt", "DESC"]],
      raw: true,
    });

    const latestStatusMap = {};
    users.forEach((u) => {
      const latestReq = requests.find((r) => r.userId === u.userId);
      latestStatusMap[u.userId] = latestReq ? latestReq.statusName : "-";
    });

    // 4️⃣ Return users with latest status
    const result = users.map((u) => ({
      ...u,
      statusName: latestStatusMap[u.userId],
    }));

    return res.json(result);
  } catch (err) {
    console.error("Error fetching group users with status:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};



module.exports = {readUsers,getUsersWithLatestStatus};