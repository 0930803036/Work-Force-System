const express = require("express");
const router = express.Router();
const { User } = require("../models"); // adjust path
const users = require("../users.json");
const bcrypt = require("bcrypt");

router.get("/seed-render-db", async (req, res) => {
  try {
    // Insert each user into Render DB
    for (const u of users) {
      // Re-hash password if needed
      const hashedPassword = await bcrypt.hash(u.password, 10);

      await User.create({
        username: u.username,
        email: u.email,
        password: hashedPassword,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      });
    }

    res.send("All local users seeded to Render DB!");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

module.exports = router;
