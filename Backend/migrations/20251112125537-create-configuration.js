'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Configurations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      channel: {
        type: Sequelize.STRING
      },
      skill: {
        type: Sequelize.STRING
      },
      managerGroup: {
        type: Sequelize.STRING
      },
      supervisorGroup: {
        type: Sequelize.STRING
      },
      coachGroup: {
        type: Sequelize.STRING
      },
      teamAvailability: {
        type: Sequelize.INTEGER
      },
      shiftName: {
        type: Sequelize.STRING
      },
      startTime: {
        type: Sequelize.TIME
      },
      endTime: {
        type: Sequelize.TIME
      },
      statusName: {
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
    await queryInterface.dropTable('Configurations');
  }
};