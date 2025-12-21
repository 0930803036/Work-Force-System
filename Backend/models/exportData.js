// // Backend/models/exportData.js
// const fs = require("fs");
// const { sequelize, User } = require("./index"); // ✅ FIXED PATH

// async function exportData() {
//   try {
//     await sequelize.authenticate();

//     // Get all users (admin included)
//     const users = await User.findAll({ raw: true });

//     // Save to JSON file (project root)
//     fs.writeFileSync(
//       "users.json",
//       JSON.stringify(users, null, 2)
//     );

//     console.log("✅ Users exported to users.json");
//     process.exit(0);
//   } catch (err) {
//     console.error("❌ Export failed:", err);
//     process.exit(1);
//   }
// }

// exportData();
