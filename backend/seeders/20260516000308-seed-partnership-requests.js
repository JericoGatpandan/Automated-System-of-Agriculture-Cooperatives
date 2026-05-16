'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date("2026-05-16");
    await queryInterface.bulkInsert('PartnershipRequests', [
      {
        coopName: 'Bicol Rice Farmers Association',
        contactPerson: 'Ely Buendia',
        email: 'ely.buendia@example.com',
        phone: '09170001111',
        message: 'Interested in joining FACCS federation.',
        status: 'pending',
        createdAt: now,
        updatedAt: now
      },
      {
        coopName: 'CamSur Organic Growers',
        contactPerson: 'Rico Blanco',
        email: 'rico.blanco@example.com',
        phone: '09170002222',
        message: 'Requesting partnership for organic fertilizer distribution.',
        status: 'reviewed',
        createdAt: now,
        updatedAt: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('PartnershipRequests', null, {});
  }
};
