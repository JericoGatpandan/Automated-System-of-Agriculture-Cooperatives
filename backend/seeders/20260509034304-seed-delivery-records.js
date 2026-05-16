'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('DeliveryRecords', [
      {
        deliveryID: 1,
        orderID: 1,
        managedBy: 1,
        consolidationDate: new Date('2026-05-10'),
        deliveryDate: new Date('2026-05-12'),
        totalTransactionAmount: 45000.00,
        commissionRateFederation: 0.03,
        commissionRateCoop: 0.05,
        status: 'delivered',
        notes: 'Full delivery for Order 1',
        createdAt: new Date('2026-05-10'),
        updatedAt: new Date('2026-05-12'),
      },
      {
        deliveryID: 2,
        orderID: 2,
        managedBy: 1,
        consolidationDate: new Date('2026-05-12'),
        deliveryDate: new Date('2026-05-14'),
        totalTransactionAmount: 25000.00,
        commissionRateFederation: 0.03,
        commissionRateCoop: 0.05,
        status: 'delivered',
        notes: 'PhilRice delivery',
        createdAt: new Date('2026-05-12'),
        updatedAt: new Date('2026-05-14'),
      },
      {
        deliveryID: 3,
        orderID: 3,
        managedBy: 1,
        consolidationDate: new Date('2026-05-14'),
        deliveryDate: null,
        totalTransactionAmount: 7500.00,
        commissionRateFederation: 0.03,
        commissionRateCoop: 0.05,
        status: 'pending',
        notes: 'Vegetable delivery pending',
        createdAt: new Date('2026-05-14'),
        updatedAt: new Date('2026-05-14'),
      },
      {
        deliveryID: 4,
        orderID: 4,
        managedBy: 1,
        consolidationDate: new Date('2026-05-08'),
        deliveryDate: new Date('2026-05-09'),
        totalTransactionAmount: 12500.00,
        commissionRateFederation: 0.03,
        commissionRateCoop: 0.05,
        status: 'delivered',
        notes: 'Corn delivery complete',
        createdAt: new Date('2026-05-08'),
        updatedAt: new Date('2026-05-09'),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('DeliveryRecords', null, {});
  },
};
