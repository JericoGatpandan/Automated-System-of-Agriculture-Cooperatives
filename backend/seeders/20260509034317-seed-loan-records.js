'use strict';

/**
 * Seed LoanRecords.
 *
 * sample-table.md doesn't include loan sample data, but the spec requires it.
 * We create 3 representative loans across different farmers and statuses
 * to demonstrate the ledger functionality.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('LoanRecords', [
      {
        loanRecordID: 1,
        farmerAccountID: 1,
        loanAmount: 15000.00,
        purpose: 'Rice seedling purchase',
        releaseDate: new Date('2024-06-01'),
        dueDate: new Date('2024-12-01'),
        amountRepaid: 10000.00,
        outstandingBalance: 5000.00,
        status: 'partial',
        approvedBy: 6,
        createdAt: new Date('2024-06-01'),
        updatedAt: new Date('2024-09-22'),
      },
      {
        loanRecordID: 2,
        farmerAccountID: 2,
        loanAmount: 8000.00,
        purpose: 'Fertilizer and pesticide supply',
        releaseDate: new Date('2024-07-15'),
        dueDate: new Date('2024-11-15'),
        amountRepaid: 8000.00,
        outstandingBalance: 0.00,
        status: 'paid',
        approvedBy: 2,
        createdAt: new Date('2024-07-15'),
        updatedAt: new Date('2024-09-23'),
      },
      {
        loanRecordID: 3,
        farmerAccountID: 3,
        loanAmount: 20000.00,
        purpose: 'Farm equipment repair',
        releaseDate: new Date('2024-08-01'),
        dueDate: new Date('2025-02-01'),
        amountRepaid: 0.00,
        outstandingBalance: 20000.00,
        status: 'active',
        approvedBy: 4,
        createdAt: new Date('2024-08-01'),
        updatedAt: new Date('2024-08-01'),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('LoanRecords', null, {});
  },
};
