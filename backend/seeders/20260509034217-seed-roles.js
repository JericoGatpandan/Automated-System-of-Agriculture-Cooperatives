'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('Roles', [
      { roleID: 1, roleName: 'FACCS Admin', createdAt: now, updatedAt: now },
      { roleID: 2, roleName: 'Coop Officer', createdAt: now, updatedAt: now },
      { roleID: 3, roleName: 'Farmer', createdAt: now, updatedAt: now },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', null, {});
  },
};
