const { User, Configuration } = require("../models");
const { Op } = require("sequelize");

// const { createUserLog } = require("../utils/logHelper");

// 🔹 Convert HH:MM → decimal
// function hhmmToDecimal(timeStr) {
//   if (!timeStr || typeof timeStr !== "string") return null;
//   const [h, m] = timeStr.split(":").map(Number);
//   return h + m / 60;
// }

// 🔹 Check if time is within shift range
function isInShift(current, start, end) {
  return start != null && end != null && current >= start && current < end;
}

// 🔹 Fetch configs (newest first)
async function fetchOrderedConfigs() {
  return await Configuration.findAll({ order: [["createdAt", "DESC"]] });
}

// 🔹 Determine applicable config (hierarchy) per type
const configHandlers = {
  break: (cfg, user) =>
    (cfg.CoachGroup && user.CoachGroup && String(cfg.CoachGroup) === String(user.CoachGroup)) ||
    (cfg.SupervisorGroup && user.SupervisorGroup && String(cfg.SupervisorGroup) === String(user.SupervisorGroup)) ||
    (cfg.ManagerGroup && user.ManagerGroup && String(cfg.ManagerGroup) === String(user.ManagerGroup)) ||
    (cfg.SkillGroup && user.SkillGroup && String(cfg.SkillGroup) === String(user.SkillGroup)) ||
    (cfg.Channel && user.Channel && String(cfg.Channel) === String(user.Channel)),

  brief: (cfg, user) =>
   (cfg.CoachGroup && user.CoachGroup && String(cfg.CoachGroup) === String(user.CoachGroup)) ||
    (cfg.SupervisorGroup && user.SupervisorGroup && String(cfg.SupervisorGroup) === String(user.SupervisorGroup)) ||
    (cfg.ManagerGroup && user.ManagerGroup && String(cfg.ManagerGroup) === String(user.ManagerGroup)) ||
    (cfg.SkillGroup && user.SkillGroup && String(cfg.SkillGroup) === String(user.SkillGroup)) ||
    (cfg.Channel && user.Channel && String(cfg.Channel) === String(user.Channel)),
};

function getApplicableConfigForUser(configs, user, type = "break") {
  if (!configs?.length) return null;
  const filtered = configs.filter(cfg => cfg.type === type);
  if (!filtered?.length) return null;

  const handler = configHandlers[type];
  if (!handler) return filtered[0]; // fallback

  for (const cfg of filtered) {
    if (handler(cfg, user)) return cfg;
  }

  return filtered[0]; // fallback
}


// ===============================
// 🔁 Auto update canTakeBreak for all agents
// ===============================
async function updateCanTakeBreak(io) {
  try {
    const configs = await fetchOrderedConfigs();
    if (!configs || configs.length === 0) return;

    const now = new Date();
    const currentDecimalTime = now.getHours() + now.getMinutes() / 60;

    const allAgents = await User.findAll({ where: { role: "agent" } });

    for (const agent of allAgents) {
      if (agent.isWhitelisted) {
        if (!agent.canTakeBreak) {
          agent.canTakeBreak = true;
          await agent.save();
        }
        continue;
      }

      const applicableBreak = getApplicableConfigForUser(configs, agent, "break");
      const applicableBrief = getApplicableConfigForUser(configs, agent, "brief");

      const inBreakShift =
        applicableBreak &&
        (isInShift(currentDecimalTime, applicableBreak.shift1StartHour, applicableBreak.shift1EndHour) ||
         isInShift(currentDecimalTime, applicableBreak.shift2StartHour, applicableBreak.shift2EndHour));

      const inBriefingShift =
        applicableBrief &&
        (isInShift(currentDecimalTime, applicableBrief.briefingShift1StartHour, applicableBrief.briefingShift1EndHour) ||
         isInShift(currentDecimalTime, applicableBrief.briefingShift2StartHour, applicableBrief.briefingShift2EndHour));

      const totalCoachAgents = await User.count({
        where: { role: "agent", CoachGroup: agent.CoachGroup, status: { [Op.not]: "Off" } },
      });
      const availableCoachAgents = await User.count({
        where: { role: "agent", CoachGroup: agent.CoachGroup, status: "Available" },
      });

      const percentAvailable = totalCoachAgents > 0 ? (availableCoachAgents / totalCoachAgents) * 100 : 0;
      const minAvailability = applicableBreak?.minAvailability || 80;

      let canTakeBreak = false;
      let restrictionReason = null;

      if (agent.status === "Available") {
        if (inBriefingShift) {
          canTakeBreak = true;
        } else if (inBreakShift) {
          if (percentAvailable >= minAvailability) {
            canTakeBreak = true;
          } else {
            restrictionReason = `Team availability (${percentAvailable.toFixed(1)}%) below threshold (${minAvailability}%)`;
          }
        } else {
          restrictionReason = "Outside allowed break/briefing window";
        }
      }

      if (agent.canTakeBreak !== canTakeBreak) {
        agent.canTakeBreak = canTakeBreak;
        await agent.save();

        if (!canTakeBreak && io) {
          io.emit("restrictionNotice", {
            userId: agent.userId,
            applicableConfigId: applicableBreak?.id || applicableBrief?.id,
            reason: restrictionReason,
          });
        }
      }
    }

    if (io) {
      const refreshedAgents = await User.findAll({ where: { role: "agent" } });
      io.emit("statusUpdate", refreshedAgents);
    }
  } catch (err) {
    console.error("Error in updateCanTakeBreak:", err);
  }
}

// ===============================
// GET latest config (of any type)
// ===============================
async function getConfiguration(req, res) {
  try {
    const Configuration = await Configuration.findOne({ order: [["createdAt", "DESC"]] });
    if (!Configuration) return res.status(404).json({ message: "No Configuration found" });

    res.json({
      ...Configuration.toJSON(),
      message: `Type: ${Configuration.type} | Min availability: ${Configuration.minAvailability}% | Active Shifts: ${Configuration.shift1StartHour}-${Configuration.shift1EndHour}, ${Configuration.shift2StartHour}-${Configuration.shift2EndHour}`,
    });
  } catch (err) {
    console.error("Error fetching Configuration:", err);
    res.status(500).json({ message: "Server error fetching Configuration" });
  }
}

// ===============================
// Update config (creates new row)
// ===============================
async function updateConfiguration(req, res) {
  try {
    const supervisorId = req.user.userId;
    const {
      type = "break",
      minAvailability,
      shift1,
      shift2,
      briefingShift1,
      briefingShift2,
      CoachGroup,
      SupervisorGroup,
      ManagerGroup,
      SkillGroup,
      Channel,
    } = req.body;

    const groupField =
      CoachGroup ? "CoachGroup" :
      SupervisorGroup ? "SupervisorGroup" :
      ManagerGroup ? "ManagerGroup" :
      SkillGroup ? "SkillGroup" :
      Channel ? "Channel" : null;

    if (!groupField) return res.status(400).json({ message: "At least one group must be selected" });

    const groupValue = req.body[groupField];

    const newConfig = await Configuration.create({
      userId: supervisorId,
      type,
      minAvailability: minAvailability || 80,
      shift1StartHour: shift1?.start ? hhmmToDecimal(shift1.start) : 0,
      shift1EndHour: shift1?.end ? hhmmToDecimal(shift1.end) : 0,
      shift2StartHour: shift2?.start ? hhmmToDecimal(shift2.start) : 0,
      shift2EndHour: shift2?.end ? hhmmToDecimal(shift2.end) : 0,
      briefingShift1StartHour: briefingShift1?.start ? hhmmToDecimal(briefingShift1.start) : 0,
      briefingShift1EndHour: briefingShift1?.end ? hhmmToDecimal(briefingShift1.end) : 0,
      briefingShift2StartHour: briefingShift2?.start ? hhmmToDecimal(briefingShift2.start) : 0,
      briefingShift2EndHour: briefingShift2?.end ? hhmmToDecimal(briefingShift2.end) : 0,
      CoachGroup: groupField === "CoachGroup" ? groupValue : null,
      SupervisorGroup: groupField === "SupervisorGroup" ? groupValue : null,
      ManagerGroup: groupField === "ManagerGroup" ? groupValue : null,
      SkillGroup: groupField === "SkillGroup" ? groupValue : null,
      Channel: groupField === "Channel" ? groupValue : null,
    });

    await updateCanTakeBreak(req.io);

    res.json({
      success: true,
      message: `${type.toUpperCase()} config applied for ${groupField}: ${groupValue}`,
      Configuration: newConfig,
    });
  } catch (err) {
    console.error("Error adding Configuration:", err);
    res.status(500).json({ message: "Server error adding Configuration" });
  }
}

// ===============================
// Supervisor override
// ===============================
async function overrideUserStatus(req, res) {
  try {
    const { userId } = req.params;
    const { newStatus } = req.body;

    if (!newStatus)
      return res.status(400).json({ message: "newStatus is required" });

    const role = req.user.role?.toLowerCase();
    if (role !== "supervisor" && role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const [user, supervisor] = await Promise.all([
      User.findOne({ where: { userId } }),
      User.findOne({ where: { userId: req.user.userId } }),
    ]);

    if (!user) return res.status(404).json({ message: "User not found" });

    const allowedStatuses = ["Available", "On Break", "Briefing", "Off", "Emergency Briefing"];
    if (!allowedStatuses.includes(newStatus)) return res.status(400).json({ message: "Invalid status" });

    user.status = newStatus;
    await user.save();

    if (req.io) await updateCanTakeBreak(req.io);

    const normalizedStatus =
      newStatus === "On Break" ? "Break" :
      newStatus === "Emergency Briefing" ? "Emergency" : newStatus;

    const supervisorName =
      `${supervisor.firstName || ""} ${supervisor.middleName || ""} ${supervisor.lastName || ""}`.trim() ||
      supervisor.username || "Unknown Supervisor";

    const actionReason = `${supervisorName} (Supervisor) override to ${normalizedStatus} for user ${user.userId} due to emergency case`;

    await createUserLog({
      userId: req.user.userId,
      actionRemark: "Supervisor Override",
      actionReason,
      actionStartTime: new Date(),
      targetUserId: user.userId,
      details: `Changed status of ${user.userId} to ${newStatus}`,
    });

    if (req.io) req.io.emit("statusChanged", { userId, status: newStatus });

    res.json({ message: `User ${userId} status overridden to ${newStatus}` });
  } catch (err) {
    console.error("Override status error:", err);
    res.status(500).json({ message: "Server error overriding status" });
  }
}

// ⚙️ GET all break configs (history)
async function getAllConfigurations(req, res) {
  try {
    const allConfigs = await Configuration.findAll({ order: [["createdAt", "DESC"]] });
    res.json(allConfigs);
  } catch (err) {
    console.error("Error fetching all Configurations:", err);
    res.status(500).json({ message: "Server error fetching all Configurations" });
  }
}

// 🔹 Only supervisor or admin can manage whitelist
async function toggleWhitelist(req, res) {
  try {
    const { userId } = req.params;
    if (req.user.role !== "supervisor" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Only supervisors or admins can toggle whitelist." });
    }

    const user = await User.findOne({
      where: { [Op.or]: [{ userId }, { id: !isNaN(userId) ? userId : -1 }] },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "agent") return res.status(400).json({ message: "Only agents can be whitelisted" });

    user.isWhitelisted = !user.isWhitelisted;
    await user.save();

    if (req.io) req.io.emit("whitelistChanged", { userId: user.userId, isWhitelisted: user.isWhitelisted });
    await updateCanTakeBreak(req.io);

    return res.json({
      success: true,
      message: `Agent ${user.firstName} ${user.lastName} (${user.userId}) whitelist is now ${user.isWhitelisted}`,
      user: { userId: user.userId, isWhitelisted: user.isWhitelisted, role: user.role },
    });
  } catch (err) {
    console.error("Error toggling whitelist:", err);
    res.status(500).json({ message: "Server error toggling whitelist" });
  }
}

// Toggle Break/Briefing
async function toggleStatus(req, res) {
  try {
    const { type } = req.body;
    const user = await User.findOne({ where: { userId: req.user.userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const now = new Date();
    const currentDecimalTime = now.getHours() + now.getMinutes() / 60;

    const configs = await fetchOrderedConfigs();
    if (!configs || configs.length === 0) return res.status(404).json({ message: "No Configuration found" });

    const applicable = getApplicableConfigForUser(configs, user, type || "break");

    const logAndRespond = async (remark, reason, message, statusCode = 200, targetUser = null) => {
      const target = targetUser || user;
      await createUserLog({ userId: target.userId, actionRemark: remark, actionReason: reason, actionEndTime: new Date() });
      if (req.io) req.io.emit("statusChanged", { userId: target.userId, status: target.status });
      return res.status(statusCode).json({ message, status: target.status });
    };

    const cancelAction = async (newStatus, remark, reason, message, targetUser = null) => {
      const target = targetUser || user;
      target.status = newStatus;
      await target.save();
      await updateCanTakeBreak(req.io);
      return logAndRespond(remark, reason, message, 200, target);
    };

    // 🔹 Emergency
    if (type === "emergency") {
      if (user.status === "Emergency Briefing") {
        return cancelAction("Available", "Emergency Briefing Canceled", "User manually canceled emergency briefing", "Emergency Briefing canceled");
      }
      user.status = "Emergency Briefing";
      await user.save();
      if (req.io) req.io.emit("statusChanged", { userId: user.userId, status: "Emergency Briefing" });
      return logAndRespond("Emergency Briefing Started", "Agent started emergency briefing", "Emergency Briefing started");
    }

    // 🔹 Whitelisted agents bypass rules
    if (user.isWhitelisted) {
      if ((type === "break" && user.status !== "On Break") || (type === "brief" && user.status !== "Briefing")) {
        user.status = type === "break" ? "On Break" : "Briefing";
        await user.save();
        await updateCanTakeBreak(req.io);
        return logAndRespond(`${type === "break" ? "Break" : "Briefing"} Started (Whitelisted)`, "Whitelisted agent bypassed restrictions", `${type === "break" ? "Break" : "Briefing"} started`);
      }
      if ((type === "break" && user.status === "On Break") || (type === "brief" && user.status === "Briefing")) {
        return cancelAction("Available", `${type === "break" ? "Break" : "Briefing"} Canceled (Whitelisted)`, "Whitelisted agent manually canceled", `${type === "break" ? "Break" : "Briefing"} canceled`);
      }
    }

    // 🔹 BREAK (agent only)
    if (type === "break") {
      if (user.status === "On Break") return cancelAction("Available", "Break Canceled", "User manually canceled break", "Break canceled");

      const inBreakShift =
        isInShift(currentDecimalTime, applicable?.shift1StartHour, applicable?.shift1EndHour) ||
        isInShift(currentDecimalTime, applicable?.shift2StartHour, applicable?.shift2EndHour);

      if (!inBreakShift) return logAndRespond("Break Rejected", "Outside allowed break time window", "Break not allowed at this time", 400);

      const totalCoachAgents = await User.count({ where: { role: "agent", CoachGroup: user.CoachGroup, status: { [Op.not]: "Off" } } });
      const availableCoachAgents = await User.count({ where: { role: "agent", CoachGroup: user.CoachGroup, status: "Available" } });
      const percentAvailable = totalCoachAgents > 0 ? (availableCoachAgents / totalCoachAgents) * 100 : 0;
      const minAvailability = applicable?.minAvailability || 80;

      if (percentAvailable < minAvailability) return logAndRespond("Break Rejected", "Min availability not met", `Not enough agents available (${percentAvailable.toFixed(1)}% < ${minAvailability}%)`, 400);

      user.status = "On Break";
      await user.save();
      await updateCanTakeBreak(req.io);
      return logAndRespond("Break Started", "Agent started break", "Break started");
    }

    // 🔹 BRIEFING (supervisor only)
    if (type === "brief") {
      if (user.role !== "supervisor") return res.status(403).json({ message: "Only supervisors can start briefing" });

      const inBriefingShift =
        isInShift(currentDecimalTime, applicable?.briefingShift1StartHour, applicable?.briefingShift1EndHour) ||
        isInShift(currentDecimalTime, applicable?.briefingShift2StartHour, applicable?.briefingShift2EndHour);

      if (!inBriefingShift) return logAndRespond("Briefing Rejected", "Outside allowed briefing window", "Briefing not allowed at this time", 400);

      // Fetch all agents in the same coach group
      const groupAgents = await User.findAll({ where: { role: "agent", CoachGroup: user.CoachGroup } });
      const updatedAgents = [];

      for (const agent of groupAgents) {
        const targetStatus = agent.status === "Briefing" ? "Available" : "Briefing";
        if (agent.status === targetStatus) continue;

        agent.status = targetStatus;
        await agent.save();
        updatedAgents.push({ userId: agent.userId, status: agent.status });

        await createUserLog({
          userId: agent.userId,
          actionRemark: agent.status === "Briefing" ? "Briefing Started by Supervisor" : "Briefing Canceled by Supervisor",
          actionReason: "Supervisor toggled briefing",
          actionEndTime: new Date(),
        });
      }

      if (req.io) {
        updatedAgents.forEach((u) => req.io.emit("statusChanged", { userId: u.userId, status: u.status }));
      }

      return res.status(200).json({
        message: `Supervisor toggled briefing for ${updatedAgents.length} agents`,
        updatedAgents,
      });
    }
  } catch (err) {
    console.error("Error toggling status:", err);
    res.status(500).json({ message: "Server error toggling status" });
  }
}

module.exports = {
  getConfiguration,
  updateConfiguration,
  updateCanTakeBreak,
  overrideUserStatus,
  getAllConfigurations,
  toggleWhitelist,
  toggleStatus,
};
