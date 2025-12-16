const { Request } = require("../../models");
const { getIO } = require("../../socket/socket.js");

const logout = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const now = new Date();
    const reason = req.body?.reason || "User logged out";

    // 🔹 Find the latest login record for this user
    const lastLogin = await Request.findOne({
      where: { userId, loginLogout: "Login" },
      order: [["statusCreatedAt", "DESC"]],
    });

    if (lastLogin) {
      // Calculate session duration
      const durationMs = now - new Date(lastLogin.statusCreatedAt);
      const durationMinutes = Math.round(durationMs / 60000);

      // Update last login record with logout time and session duration
      lastLogin.statusEnd = now;
      lastLogin.duration = durationMinutes;
      await lastLogin.save();
    }

    // 🔹 Create logout record
    const logoutRecord = await Request.create({
      userId,
      loginLogout: "Logout",
      statusName: "Offline",
      reason: reason || "User logged out",
      statusCreatedAt: now,
      statusEnd: now,
    });

    // 🔹 Emit socket event for frontend real-time update
    try {
      getIO().emit("userLoggedOut", {
        userId,
        statusName: "Offline",
        timestamp: now,
      });
    } catch (socketErr) {
      console.error("Socket emit error:", socketErr);
    }

    return res.json({
      message: "User logged out successfully",
      logoutRecord,
    });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ error: "Failed to logout" });
  }
};

module.exports = { logout };
