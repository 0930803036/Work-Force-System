const bcrypt = require("bcrypt");
const { User } = require("../../models");

// Reset password (admin only)
const resetPassword = async (req, res) => {
  const { userId } = req.params;
  const { newPassword } = req.body;

  try {
    // 1️⃣ Validate password length
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // 2️⃣ Find user
    const user = await User.findOne({ where: { userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3️⃣ Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4️⃣ Update password
    await user.update({ password: hashedPassword });

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { resetPassword };