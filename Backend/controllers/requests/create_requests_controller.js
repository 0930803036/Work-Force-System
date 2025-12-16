const { Request, User, Configuration, Status } = require("../../models");
const { calculateTeamAvailability } = require("./team_Availability_controller");
const { Op } = require("sequelize");

// Get latest applicable configuration for a user and statusName
// -----------------------------
async function getLatestApplicableConfig(user, statusName) {
  const configs = await Configuration.findAll({
    where: { statusName },
    order: [["createdAt", "DESC"]],
  });

  if (!configs || configs.length === 0) return null;

  for (const cfg of configs) {
    const match =
      (cfg.coachGroup && user.coachGroup && String(cfg.coachGroup) === String(user.coachGroup)) ||
      (cfg.supervisorGroup && user.supervisorGroup && String(cfg.supervisorGroup) === String(user.supervisorGroup)) ||
      (cfg.managerGroup && user.managerGroup && String(cfg.managerGroup) === String(user.managerGroup)) ||
      (cfg.skill && user.skill && String(cfg.skill) === String(user.skill)) ||
      (cfg.channel && user.channel && String(cfg.channel) === String(user.channel)) ||
      (cfg.shiftName && user.shiftName && String(cfg.shiftName) === String(user.shiftName));

    if (match) return cfg;
  }

  return configs[0]; // fallback to newest
}

// -----------------------------
// Create request
const createRequest = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { statusName } = req.body;
    const now = new Date();

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!statusName) return res.status(400).json({ error: "statusName is required" });

    const requester = await User.findOne({ where: { userId } });
    if (!requester) return res.status(404).json({ error: "User not found" });

    const statusRecord = await Status.findOne({ where: { statusName } });
    if (!statusRecord) return res.status(400).json({ error: `Invalid statusName: ${statusName}` });

    const agentOnlyStatuses = ["Emergency Briefing", "Request Break"];
    const isCoach = requester.role === "coach";

    // -------------------------
    // Determine target users
    // -------------------------
    let targetUsers = [];
    if (isCoach) {
      // Coach toggles ANY status for all agents
      targetUsers = await User.findAll({
        where: { coachGroup: requester.coachGroup, role: "agent" }
      });
    } else {
      // Agent toggles only self
      targetUsers = [requester];

      // Agent restriction logic unchanged
      if (statusName !== "Available" && !agentOnlyStatuses.includes(statusName)) {
        return res.status(403).json({ error: `Agent cannot toggle status: ${statusName}` });
      }
    }

    const results = [];

    for (const user of targetUsers) {
      let validStatusName = statusRecord.statusName;

      // Close previous active request
      const previousActive = await Request.findOne({
        where: { userId: user.userId, statusEnd: null },
        order: [["statusCreatedAt", "DESC"]],
      });

      if (previousActive) {
        const durationMs = now - new Date(previousActive.statusCreatedAt);
        previousActive.statusEnd = now;
        previousActive.duration = Math.round(durationMs / 60000);
        await previousActive.save();
      }

      // Inherit last shiftName
      let shiftName = null;
      const lastDetectedShift = await Request.findOne({
        where: { userId: user.userId, shiftName: { [Op.ne]: null } },
        order: [["statusCreatedAt", "DESC"]],
      });
      shiftName = lastDetectedShift?.shiftName || null;

      // ------------------ Determine approval ------------------
      let approvalStatus = "Pending";
      let approvedBy = null;
      let rejectionReason = null;

      if (validStatusName === "Available") {
        approvalStatus = "Approved";
        approvedBy = "System";
      } else if (!user.whiteList) {
        const config = await getLatestApplicableConfig(user, validStatusName);

        if (statusName === "Emergency Briefing") {
          approvalStatus = "Pending";
        } else if (statusName === "Request Break") {
          if (config) {
            const reqMin = now.getHours() * 60 + now.getMinutes();
            const [sHour, sMin] = config.startTime?.split(":").map(Number) || [];
            const [eHour, eMin] = config.endTime?.split(":").map(Number) || [];

            if (sHour != null && eHour != null) {
              const startMinutes = sHour * 60 + sMin;
              const endMinutes = eHour * 60 + eMin;

              const outOfRange =
                endMinutes < startMinutes
                  ? !(reqMin >= startMinutes || reqMin < endMinutes)
                  : !(reqMin >= startMinutes && reqMin < endMinutes);

              if (outOfRange) {
                rejectionReason = `Time mismatch (${now.getHours()}:${now.getMinutes()}) not between ${config.startTime}-${config.endTime}`;
                approvalStatus = "Rejected";
                approvedBy = "System";
              }
            }

            if (!rejectionReason) {
              const TA = await calculateTeamAvailability(user.coachGroup);
              if (TA < config.teamAvailability) {
                rejectionReason = `Team availability ${TA.toFixed(2)}% < required ${config.teamAvailability}%`;
                approvalStatus = "Rejected";
                approvedBy = "System";
              } else {
                approvalStatus = "Approved";
                approvedBy = "System";
              }
            }
          } else {
            approvalStatus = "Pending";
          }
        } else {
          if (config?.startTime && config?.endTime) {
            const reqMin = now.getHours() * 60 + now.getMinutes();
            const [sHour, sMin] = config.startTime.split(":").map(Number);
            const [eHour, eMin] = config.endTime.split(":").map(Number);

            const startMinutes = sHour * 60 + sMin;
            const endMinutes = eHour * 60 + eMin;

            const outOfRange =
              endMinutes < startMinutes
                ? !(reqMin >= startMinutes || reqMin < endMinutes)
                : !(reqMin >= startMinutes && reqMin < endMinutes);

            if (outOfRange) {
              approvalStatus = "Rejected";
              approvedBy = "System";
              rejectionReason = `Time mismatch (${now.getHours()}:${now.getMinutes()}) not between ${config.startTime}-${config.endTime}`;
            } else {
              approvalStatus = "Approved";
              approvedBy = "System";
            }
          } else {
            approvalStatus = "Approved";
            approvedBy = "System";
          }
        }
      } else {
        approvalStatus = "Approved";
        approvedBy = "System";
      }

      if (approvalStatus === "Rejected") validStatusName = "Available";

      // ------------------ Create request ------------------
      const createData = {
        userId: user.userId,
        loginLogout: null,
        statusName: validStatusName,
        statusCreatedAt: now,
        shiftName,
        approvalStatus,
        ApprovalTime: approvalStatus === "Approved" ? now : null,
        approvedBy,
        statusEnd: null,
        duration: null,
        reason: rejectionReason,
      };

      if (Request.rawAttributes.showTimer) {
        createData.showTimer = approvalStatus === "Approved";
      }

      const newRequest = await Request.create(createData);
      results.push(newRequest);
    }

    return res.status(201).json(results);
  } catch (err) {
    console.error("❌ ERROR creating request:", err);
    return res.status(500).json({ error: "Failed to create request", details: err.message });
  }
};

// Approve or reject Emergency Briefing
const approveEmergencyBriefing = async (req, res) => {
  try {
    const coachId = req.user?.userId;
    const { userId } = req.params;   // <-- CHANGED: now taken from params
    const { action } = req.body;     // "approve" or "reject"

    if (!coachId)
      return res.status(401).json({ error: "Unauthorized" });

    if (!userId)
      return res.status(400).json({ error: "userId param is required" });

    if (!["approve", "reject"].includes(action))
      return res.status(400).json({ error: "Invalid action" });

    const coach = await User.findOne({ where: { userId: coachId } });
    if (!coach || coach.role !== "coach")
      return res.status(403).json({ error: "Only coaches can approve Emergency Briefing" });

    // Find the latest Emergency Briefing request for this user
    const request = await Request.findOne({
      where: { userId, statusName: "Emergency Briefing" },
      order: [["createdAt", "DESC"]],
    });

    if (!request)
      return res.status(404).json({ error: "No Emergency Briefing request found for this user" });

    // Validate coach group
    const agent = await User.findOne({ where: { userId } });
    if (!agent || agent.coachGroup !== coach.coachGroup)
      return res.status(403).json({ error: "Cannot approve requests outside your coach group" });

    // Update request approval status
    request.approvalStatus = action === "approve" ? "Approved" : "Rejected";
    request.approvedBy = `${coach.firstName} ${coach.lastName}`;
    request.ApprovalTime = new Date();

    await request.save();

    return res.status(200).json(request);

  } catch (err) {
    console.error("❌ ERROR approving Emergency Briefing:", err);
    return res.status(500).json({ error: "Failed to approve request", details: err.message });
  }
};

module.exports = { createRequest ,approveEmergencyBriefing};
