'use strict';

/**
 * Seed SalesRecords.
 *
 * Mathematically consistent with DeliveryRecords and FarmerFulfillments.
 * Commission = 8% (3% Federation + 5% Coop).
 *
 * Delivery 1 (Order 1, 2000 units, 45,000 PHP):
 * - Farmer 1 (400 units, Account 1): 9,000 Gross.
 * - Farmer 5 (400 units, Account 18): 9,000 Gross.
 * - Farmer 6 (700 units, Account 17): 15,750 Gross.
 * - Farmer 2 (500 units, Account 2): 11,250 Gross.
 *
 * Delivery 2 (Order 2, 1000 units, 25,000 PHP):
 * - Farmer 2 (1000 units, Account 2): 25,000 Gross.
 *
 * Delivery 4 (Order 4, 500 units, 12,500 PHP):
 * - Farmer 4 (500 units, Account 4): 12,500 Gross.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('SalesRecords', [
      // Delivery 1
      {
        salesRecordID: 1,
        farmerAccountID: 1,
        deliveryID: 1,
        grossAmount: 9000.00,
        commissionAmount: 720.00,
        netAmount: 8280.00,
        transactionDate: new Date('2026-05-12'),
        remarks: 'Farmer 1 share of Delivery 1',
        createdAt: new Date('2026-05-12'),
        updatedAt: new Date('2026-05-12'),
      },
      {
        salesRecordID: 2,
        farmerAccountID: 18,
        deliveryID: 1,
        grossAmount: 9000.00,
        commissionAmount: 720.00,
        netAmount: 8280.00,
        transactionDate: new Date('2026-05-12'),
        remarks: 'Farmer 5 share of Delivery 1',
        createdAt: new Date('2026-05-12'),
        updatedAt: new Date('2026-05-12'),
      },
      {
        salesRecordID: 3,
        farmerAccountID: 17,
        deliveryID: 1,
        grossAmount: 15750.00,
        commissionAmount: 1260.00,
        netAmount: 14490.00,
        transactionDate: new Date('2026-05-12'),
        remarks: 'Farmer 6 share of Delivery 1',
        createdAt: new Date('2026-05-12'),
        updatedAt: new Date('2026-05-12'),
      },
      {
        salesRecordID: 4,
        farmerAccountID: 2,
        deliveryID: 1,
        grossAmount: 11250.00,
        commissionAmount: 900.00,
        netAmount: 10350.00,
        transactionDate: new Date('2026-05-12'),
        remarks: 'Farmer 2 share of Delivery 1',
        createdAt: new Date('2026-05-12'),
        updatedAt: new Date('2026-05-12'),
      },
      // Delivery 2
      {
        salesRecordID: 5,
        farmerAccountID: 2,
        deliveryID: 2,
        grossAmount: 25000.00,
        commissionAmount: 2000.00,
        netAmount: 23000.00,
        transactionDate: new Date('2026-05-14'),
        remarks: 'Farmer 2 delivery for Order 2',
        createdAt: new Date('2026-05-14'),
        updatedAt: new Date('2026-05-14'),
      },
      // Delivery 4
      {
        salesRecordID: 6,
        farmerAccountID: 4,
        deliveryID: 4,
        grossAmount: 12500.00,
        commissionAmount: 1000.00,
        netAmount: 11500.00,
        transactionDate: new Date('2026-05-09'),
        remarks: 'Farmer 4 delivery for Order 4',
        createdAt: new Date('2026-05-09'),
        updatedAt: new Date('2026-05-09'),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('SalesRecords', null, {});
  },
};
