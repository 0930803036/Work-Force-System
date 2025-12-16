const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { User } = require("../../models");

const usersBulkUpload = async (req, res) => {
  try {
    // -------------------------
    // Check uploaded file
    // -------------------------
    if (!req.files || !req.files.usersData) {
      return res.status(400).json({ message: "No file uploaded. Expected field: usersData" });
    }

    const file = req.files.usersData;

    // Create uploads folder if not present
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    // Save the uploaded file
    const filePath = path.join(uploadDir, file.name);
    await file.mv(filePath);

    // -------------------------
    // Read Excel file
    // -------------------------
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const users = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (users.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: "Excel file is empty" });
    }

    let insertedUsers = [];

    // -------------------------
    // Insert Users
    // -------------------------
    for (let userData of users) {
      if (!userData.userId) continue; // skip missing IDs

      // Convert empty → null for numeric fields
      const integerFields = ["roleId", "departmentId", "status", "phone", "age"];
      integerFields.forEach((field) => {
        if (userData[field] === "") userData[field] = null;
      });

      // Check if user already exists
      const exists = await User.findOne({ where: { userId: userData.userId } });
      if (exists) continue;

      // Hash password
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password.toString(), 10);
      }

      try {
        const created = await User.create(userData);
        insertedUsers.push(created);
      } catch (err) {
        console.error("Insert error:", err.message, userData);
      }
    }

    // -------------------------
    // Clean up uploaded file
    // -------------------------
    fs.unlinkSync(filePath);

    res.status(200).json({
      message: "Upload successful",
      inserted: insertedUsers.length,
    });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Failed to upload users", error: err.message });
  }
};

module.exports = { usersBulkUpload };
