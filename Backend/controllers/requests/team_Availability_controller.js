const { Request, User } = require("../../models");
const { Op } = require("sequelize");

// ---------------------------------------------------
// Calculate availability % for agents in same coachGroup
// ---------------------------------------------------
const calculateTeamAvailability = async (coachGroup) => {

  // 1️⃣ Get all agents in this coach group
  const agents = await User.findAll({
    where: {
      role: "agent",
      coachGroup,
    },
    attributes: ["userId"],
  });

  if (!agents.length) return 0;

  const agentIds = agents.map(a => a.userId);

  // 2️⃣ Get all requests for these agents (excluding Offline)
  const requests = await Request.findAll({
    where: {
      userId: { [Op.in]: agentIds },
      statusName: { [Op.ne]: "Offline" }  // exclude Offline
    },
    order: [["statusCreatedAt", "DESC"]],
  });

  if (!requests.length) return 0;

  // 3️⃣ Keep only the latest status request per agent
  const latestPerUser = Object.values(
    requests.reduce((acc, r) => {
      if (
        !acc[r.userId] ||
        new Date(r.statusCreatedAt) > new Date(acc[r.userId].statusCreatedAt)
      ) {
        acc[r.userId] = r;
      }
      return acc;
    }, {})
  );

  // Total users EXCLUDING those whose latest is Offline
  const totalUsers = latestPerUser.length;

  if (totalUsers === 0) return 0;

  // 4️⃣ Count users whose latest status = Available
  const availableUsers = latestPerUser.filter(
    r => r.statusName === "Available"
  ).length;

  // 5️⃣ Calculate availability %
  return (availableUsers / totalUsers) * 100;
};

module.exports = { calculateTeamAvailability };
