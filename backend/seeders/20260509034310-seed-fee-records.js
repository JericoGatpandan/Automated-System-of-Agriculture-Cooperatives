'use strict';

/**
 * Seed FeeRecords.
 *
 * Per the Cardinalities doc, each SalesRecord generates multiple FeeRecords —
 * one per commission component:
 *   1. federationFee (3% of gross)
 *   2. coopFee (5% of gross)
 *   3. capitalContribution (fixed 2% of gross)
 *   4. capitalRetention (fixed 1% of gross)
 *
 * We generate 4 fee records per sales record.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const salesData = [
      { salesRecordID: 1, farmerAccountID: 1, gross: 9000, date: '2026-05-12' },
      { salesRecordID: 2, farmerAccountID: 18, gross: 9000, date: '2026-05-12' },
      { salesRecordID: 3, farmerAccountID: 17, gross: 15750, date: '2026-05-12' },
      { salesRecordID: 4, farmerAccountID: 2, gross: 11250, date: '2026-05-12' },
      { salesRecordID: 5, farmerAccountID: 2, gross: 25000, date: '2026-05-14' },
      { salesRecordID: 6, farmerAccountID: 4, gross: 12500, date: '2026-05-09' },
    ];

    const feeTypes = [
      { feeType: 'federationFee', rate: 0.03 },
      { feeType: 'coopFee', rate: 0.05 },
      { feeType: 'capitalContribution', rate: 0.02 },
      { feeType: 'capitalRetention', rate: 0.01 },
    ];

    const records = [];
    let id = 1;

    for (const sale of salesData) {
      for (const fee of feeTypes) {
        records.push({
          feeRecordID: id++,
          farmerAccountID: sale.farmerAccountID,
          salesRecordID: sale.salesRecordID,
          feeType: fee.feeType,
          rate: fee.rate,
          amount: parseFloat((sale.gross * fee.rate).toFixed(2)),
          status: 'recorded',
          createdAt: new Date(sale.date),
          updatedAt: new Date(sale.date),
        });
      }
    }

    await queryInterface.bulkInsert('FeeRecords', records);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('FeeRecords', null, {});
  },
};
