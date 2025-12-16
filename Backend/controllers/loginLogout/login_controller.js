const { User, Request, Shift } = require("../../models/index.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getIO } = require("../../socket/socket.js");
require("dotenv").config();

const MAX_FAILED_ATTEMPTS = 3;
const AUTO_UNLOCK_MINUTES = 5;
const TOLERANCE_MINUTES = 30;

// ---------------------------
// Detect shift based on local time (using shiftStart only)
// ---------------------------
const detectShift = (localTime, shifts, toleranceMinutes = TOLERANCE_MINUTES) => {
  const minutesOfDay = localTime.getHours() * 60 + localTime.getMinutes();
  console.log("Local time minutes of day:", minutesOfDay);

  for (const shift of shifts) {
    const [startH, startM] = shift.shiftStart.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const tolStart = startMinutes - toleranceMinutes;
    const tolEnd = startMinutes + toleranceMinutes;

    console.log(`Shift "${shift.shiftName}": start=${startMinutes}, tolStart=${tolStart}, tolEnd=${tolEnd}`);

    if (minutesOfDay >= tolStart && minutesOfDay <= tolEnd) {
      console.log("Matched shift:", shift.shiftName);
      return shift.shiftName;
    }
  }

  console.log("No shift matched");
  return null;
};

// ---------------------------
// Update all requests of the day with detected shift
// ---------------------------
const updateShiftsForToday = async (userId, shifts) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const requests = await Request.findAll({
    where: {
      userId,
      statusCreatedAt: { $gte: startOfDay, $lte: endOfDay },
    },
  });

  for (const req of requests) {
    const localTime = new Date(req.statusCreatedAt); // use local 24h time
    const shiftName = detectShift(localTime, shifts);
    if (shiftName) {
      await req.update({ shiftName });
      console.log(`Updated request ${req.id} to shift: ${shiftName}`);
    }
  }
};

// ---------------------------
// Login function
// ---------------------------
const login = async (req, res) => {
  try {
    const { userId, password } = req.body;

    // 1️⃣ Validate user
    const user = await User.findOne({ where: { userId } });
    if (!user) return res.status(401).json({ message: "Invalid userId" });

    // 2️⃣ Check staffStatus
    if (!user.staffStatus) {
      return res.status(403).json({
        message: "Staff status is inactive. Please contact the administrator.",
      });
    }

    // 3️⃣ Check if account is locked
    if (user.accountStatus) {
      if (user.lockedAt) {
        const lockedDuration = (new Date() - new Date(user.lockedAt)) / 60000;
        if (lockedDuration >= AUTO_UNLOCK_MINUTES) {
          await user.update({ accountStatus: false, failedLoginAttempts: 0, lockedAt: null });
        } else {
          const remaining = Math.ceil(AUTO_UNLOCK_MINUTES - lockedDuration);
          return res.status(403).json({
            message: `Your account is locked. Try again in ${remaining} minute(s).`,
          });
        }
      } else {
        return res.status(403).json({
          message: "Your account is locked. Please contact the administrator.",
        });
      }
    }

    // 4️⃣ Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      let attempts = (user.failedLoginAttempts || 0) + 1;
      let updates = { failedLoginAttempts: attempts };
      if (attempts >= MAX_FAILED_ATTEMPTS) {
        updates.accountStatus = true;
        updates.lockedAt = new Date();
      }
      await user.update(updates);

      return res.status(401).json({
        message:
          attempts >= MAX_FAILED_ATTEMPTS
            ? `Account locked due to ${MAX_FAILED_ATTEMPTS} failed login attempts. Try again in ${AUTO_UNLOCK_MINUTES} minutes.`
            : `Invalid password. You have ${MAX_FAILED_ATTEMPTS - attempts} attempt(s) left.`,
      });
    }

    // 5️⃣ Successful login: reset failed attempts & locked status
    if (user.failedLoginAttempts > 0 || user.accountStatus || user.lockedAt) {
      await user.update({ failedLoginAttempts: 0, accountStatus: false, lockedAt: null });
    }

    // 6️⃣ Generate JWT token
    const token = jwt.sign(
      { userId: user.userId, role: user.role, delegatedRole: user.delegatedRole },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 7️⃣ Get all shifts
    const shifts = await Shift.findAll({ order: [["shiftStart", "ASC"]] });
    if (!shifts || shifts.length === 0) {
      return res.status(500).json({ message: "No shifts configured" });
    }

    // 8️⃣ Create login record first
    const statusCreatedAt = new Date();
    const request = await Request.create({
      userId: user.userId,
      loginLogout: "Login",
      statusName: "Available",
      statusCreatedAt,
    });

    // 9️⃣ Detect shift for current login
    const localTime = new Date(request.statusCreatedAt); // local 24h time
    const shiftName = detectShift(localTime, shifts);

    // 10️⃣ Update login request
    await request.update({ shiftName });

    // 11️⃣ Update all other requests of the day
    await updateShiftsForToday(user.userId, shifts);

    console.log("Request created:", request.toJSON());

    // 12️⃣ Emit socket event
    try {
      getIO().emit("userLoggedIn", {
        userId: user.userId,
        name: `${user.firstName} ${user.lastName}`,
        statusName: "Available",
        shiftName,
      });
    } catch (err) {
      console.warn("Socket emit failed:", err.message);
    }

    // 13️⃣ Return success response
    return res.status(200).json({
      message: "Login successful",
      userId: user.userId,
      role: user.role,
      delegatedRole: user.delegatedRole,
      shiftName,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { login };
