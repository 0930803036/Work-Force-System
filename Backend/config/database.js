const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("postgresql://dani:qYPmdHmQyGk1zrkWxKTi4j11r5iGTvSS@dpg-d5215mlactks73ab9l5g-a/bl_management_system", {
  dialect: "postgres",
  protocol: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

module.exports = sequelize;
