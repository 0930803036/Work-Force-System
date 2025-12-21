// exportData.js
const fs = require("fs");
const { sequelize, User } = require("./models"); // adjust path if needed

async function exportData() {
  try {
    // Get all users (your admin included)
    const users = await User.findAll({ raw: true });
    
    // Save to JSON file
    fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
    console.log("Users exported to users.json");

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

exportData();
