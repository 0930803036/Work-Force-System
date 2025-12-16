'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      firstName: {
        type: Sequelize.STRING
      },
      middleName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.INTEGER
      },
      role: {
        type: Sequelize.STRING
      },
      delegatedRole: {
        type: Sequelize.STRING
      },
      channel: {
        type: Sequelize.STRING
      },
      skill: {
        type: Sequelize.STRING
      },
      coachGroup: {
        type: Sequelize.STRING
      },
      supervisorGroup: {
        type: Sequelize.STRING
      },
      managerGroup: {
        type: Sequelize.STRING
      },
      site: {
        type: Sequelize.STRING
      },
      director: {
        type: Sequelize.STRING
      },
      staffStatus: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      whiteList: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      password: {
        type: Sequelize.STRING
      },
      failedLoginAttempts: {
        type: Sequelize.INTEGER
      },
      accountStatus: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      lockedAt: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('Users');
  }
};