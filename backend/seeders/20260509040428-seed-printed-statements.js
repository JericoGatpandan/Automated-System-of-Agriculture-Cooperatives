'use strict';

/**
 * Seed PrintedStatements.
 *
 * sample-table.md doesn't include printed statement sample data.
 * We create 2 statements to demonstrate the read-only snapshot functionality
 * described in the cardinality doc.
 *
 * Values are derived from the seeded SalesRecords, FeeRecords, and LoanRecords
 * for the period of September 2024.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('PrintedStatements', [
      {
        printedStatementID: 1,
        farmerAccountID: 1,
        periodStart: new Date('2026-04-01'),
        periodEnd: new Date('2026-04-30'),
        generatedBy: 6,
        generatedDate: new Date('2026-05-01'),
        totalGrossSales: 22500.00,
        totalCommission: 1800.00,
        totalShareCapital: 675.00,
        totalLoans: 5000.00,
        netBalance: 15025.00,
        createdAt: new Date('2026-05-01'),
        updatedAt: new Date('2026-05-01'),
      },
      {
        printedStatementID: 2,
        farmerAccountID: 2,
        periodStart: new Date('2026-04-01'),
        periodEnd: new Date('2026-04-30'),
        generatedBy: 2,
        generatedDate: new Date('2026-05-01'),
        totalGrossSales: 15000.00,
        totalCommission: 1200.00,
        totalShareCapital: 450.00,
        totalLoans: 0.00,
        netBalance: 13350.00,
        createdAt: new Date('2026-05-01'),
        updatedAt: new Date('2026-05-01'),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('PrintedStatements', null, {});
  },
};
