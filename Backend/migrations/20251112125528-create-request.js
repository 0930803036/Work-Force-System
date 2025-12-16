'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Requests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      // User ID (no DB-level foreign key)
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      loginLogout: {
        type: Sequelize.STRING
      },
      // Status name (no DB-level foreign key)
      statusName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      statusCreatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      // Shift name (no DB-level foreign key)
      shiftName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      approvalStatus: {
        type: Sequelize.STRING
      },
      ApprovalTime: {
        type: Sequelize.DATE
      },
      approvedBy: {
        type: Sequelize.STRING
      },
      statusEnd: {
        type: Sequelize.DATE
      },
      duration: {
        type: Sequelize.INTEGER
      },
      reason: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Requests');
  }
};
