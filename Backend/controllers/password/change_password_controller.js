const bcrypt = require("bcrypt");
const { User } = require("../../models");

const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user?.userId;

  try {
    // 1. Basic validations
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirm password do not match" });
    }

    // 2. Find user
    const user = await User.findOne({ where: { userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // 4. Prevent using the same password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: "New password must be different from old password" });
    }

    // 5. Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { changePassword };

