'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const passwordHash = await bcrypt.hash('Pass@123', 10); // hash the password

    await queryInterface.bulkInsert('Users', [
      {
        userId: 15,
        firstName: 'Daniel',
        middleName: 'T',
        lastName: 'Tebkew',
        email: 'daniel@example.com',
        phone: 911234567,
        role: 'supervisor',
        delegatedRole: null,
        channel: 'Main',
        skill: 'Management',
        coachGroup: 'Group1',
        supervisorGroup: 'Sup1',
        managerGroup: 'Mgr1',
        site: 'Addis',
        director: 'Director1',
        staffStatus: true,
        whiteList: true,
        password: passwordHash,
        failedLoginAttempts: 0,
        accountStatus: false,
        lockedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { userId: 5 }, {});
  }
};
