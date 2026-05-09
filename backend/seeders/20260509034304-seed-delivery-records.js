'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('DeliveryRecords', [
      {
        deliveryID: 1,
        orderID: 1,
        managedBy: 1,
        consolidationDate: new Date('2024-09-20'),
        deliveryDate: new Date('2024-09-22'),
        totalTransactionAmount: 45000.00,
        commissionRateFederation: 0.03,
        commissionRateCoop: 0.05,
        status: 'delivered',
        notes: 'Full delivery for Order 1',
        createdAt: new Date('2024-09-20'),
        updatedAt: new Date('2024-09-22'),
      },
      {
        deliveryID: 2,
        orderID: 2,
        managedBy: 1,
        consolidationDate: new Date('2024-09-25'),
        deliveryDate: new Date('2024-09-27'),
        totalTransactionAmount: 25000.00,
        commissionRateFederation: 0.03,
        commissionRateCoop: 0.05,
        status: 'delivered',
        notes: 'PhilRice delivery',
        createdAt: new Date('2024-09-25'),
        updatedAt: new Date('2024-09-27'),
      },
      {
        deliveryID: 3,
        orderID: 3,
        managedBy: 1,
        consolidationDate: new Date('2024-09-28'),
        deliveryDate: null,
        totalTransactionAmount: 7500.00,
        commissionRateFederation: 0.03,
        commissionRateCoop: 0.05,
        status: 'pending',
        notes: 'Vegetable delivery pending',
        createdAt: new Date('2024-09-28'),
        updatedAt: new Date('2024-09-28'),
      },
      {
        deliveryID: 4,
        orderID: 4,
        managedBy: 1,
        consolidationDate: new Date('2024-09-18'),
        deliveryDate: new Date('2024-09-19'),
        totalTransactionAmount: 10000.00,
        commissionRateFederation: 0.03,
        commissionRateCoop: 0.05,
        status: 'delivered',
        notes: 'Corn delivery complete',
        createdAt: new Date('2024-09-18'),
        updatedAt: new Date('2024-09-19'),
      },
      {
        deliveryID: 5,
        orderID: 1,
        managedBy: 1,
        consolidationDate: new Date('2024-09-22'),
        deliveryDate: new Date('2024-09-23'),
        totalTransactionAmount: 15000.00,
        commissionRateFederation: 0.03,
        commissionRateCoop: 0.05,
        status: 'delivered',
        notes: 'Partial delivery - Order 1',
        createdAt: new Date('2024-09-22'),
        updatedAt: new Date('2024-09-23'),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('DeliveryRecords', null, {});
  },
};
