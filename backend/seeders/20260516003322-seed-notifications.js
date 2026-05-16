'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date("2026-05-16");
    await queryInterface.bulkInsert('Notifications', [
      {
        recipientRole: 'FACCS Admin',
        recipientID: 1,
        type: 'ORDER_NEW',
        message: 'New order received from NFA Regional Office.',
        referenceId: 1,
        isRead: false,
        createdAt: now,
        updatedAt: now
      },
      {
        recipientRole: 'Coop Officer',
        recipientID: 2,
        type: 'ASSIGNMENT_NEW',
        message: 'New assignment for Order #1 assigned to CMPC.',
        referenceId: 1,
        isRead: false,
        createdAt: now,
        updatedAt: now
      },
      {
        recipientRole: 'Farmer',
        recipientID: 1,
        type: 'DELIVERY_COMPLETED',
        message: 'Delivery #1 has been marked as delivered. Check your ledger.',
        referenceId: 1,
        isRead: true,
        createdAt: now,
        updatedAt: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Notifications', null, {});
  }
};
