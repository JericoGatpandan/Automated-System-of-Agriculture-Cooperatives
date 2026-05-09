'use strict';

/**
 * Seed SalesRecords.
 *
 * Per the Cardinalities doc:
 * - SalesRecord is generated when a DeliveryRecord status changes to "delivered"
 * - One DeliveryRecord may generate many SalesRecords (one per fulfilling farmer)
 *
 * We create sales records for the 3 delivered deliveries (IDs 1, 2, 4, 5).
 * Delivery 3 is still "pending" so no sales record is generated for it.
 *
 * Delivery 1 (orderID=1, ₱45,000): fulfilled by farmer 1 (account 1) and farmer 5 (account 5)
 * Delivery 2 (orderID=2, ₱25,000): fulfilled by farmer 3 (account 3)
 * Delivery 4 (orderID=4, ₱10,000): no fulfillment record linked but we model farmer 4 (account 4)
 * Delivery 5 (orderID=1, ₱15,000): partial delivery — farmer 2 (account 2)
 *
 * Commission = commissionRateFederation (3%) + commissionRateCoop (5%) = 8%
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('SalesRecords', [
      {
        salesRecordID: 1,
        farmerAccountID: 1,
        deliveryID: 1,
        grossAmount: 22500.00,
        commissionAmount: 1800.00,
        netAmount: 20700.00,
        transactionDate: new Date('2024-09-22'),
        remarks: 'Farmer 1 share of Delivery 1 (Order 1 - NFA)',
        createdAt: new Date('2024-09-22'),
        updatedAt: new Date('2024-09-22'),
      },
      {
        salesRecordID: 2,
        farmerAccountID: 5,
        deliveryID: 1,
        grossAmount: 22500.00,
        commissionAmount: 1800.00,
        netAmount: 20700.00,
        transactionDate: new Date('2024-09-22'),
        remarks: 'Farmer 5 share of Delivery 1 (Order 1 - NFA)',
        createdAt: new Date('2024-09-22'),
        updatedAt: new Date('2024-09-22'),
      },
      {
        salesRecordID: 3,
        farmerAccountID: 3,
        deliveryID: 2,
        grossAmount: 25000.00,
        commissionAmount: 2000.00,
        netAmount: 23000.00,
        transactionDate: new Date('2024-09-27'),
        remarks: 'Farmer 3 delivery for PhilRice (Order 2)',
        createdAt: new Date('2024-09-27'),
        updatedAt: new Date('2024-09-27'),
      },
      {
        salesRecordID: 4,
        farmerAccountID: 4,
        deliveryID: 4,
        grossAmount: 10000.00,
        commissionAmount: 800.00,
        netAmount: 9200.00,
        transactionDate: new Date('2024-09-19'),
        remarks: 'Farmer 4 corn delivery for Provincial Gov (Order 4)',
        createdAt: new Date('2024-09-19'),
        updatedAt: new Date('2024-09-19'),
      },
      {
        salesRecordID: 5,
        farmerAccountID: 2,
        deliveryID: 5,
        grossAmount: 15000.00,
        commissionAmount: 1200.00,
        netAmount: 13800.00,
        transactionDate: new Date('2024-09-23'),
        remarks: 'Farmer 2 partial delivery for NFA (Order 1)',
        createdAt: new Date('2024-09-23'),
        updatedAt: new Date('2024-09-23'),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('SalesRecords', null, {});
  },
};
