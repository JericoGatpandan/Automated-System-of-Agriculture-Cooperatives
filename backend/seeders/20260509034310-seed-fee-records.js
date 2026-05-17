'use strict';

/**
 * Seed FeeRecords.
 *
 * Each SalesRecord generates 4 FeeRecords:
 *   1. federationFee (3% of gross)
 *   2. coopFee (5% of gross)
 *   3. capitalContribution (2% of gross)
 *   4. capitalRetention (1% of gross)
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const salesData = [
      // ── Coops 1–6: original + historical ──
      { salesRecordID: 1,  farmerAccountID: 1,  gross: 9000,   date: '2026-05-12' },
      { salesRecordID: 2,  farmerAccountID: 18, gross: 9000,   date: '2026-05-12' },
      { salesRecordID: 3,  farmerAccountID: 17, gross: 15750,  date: '2026-05-12' },
      { salesRecordID: 4,  farmerAccountID: 2,  gross: 11250,  date: '2026-05-12' },
      { salesRecordID: 5,  farmerAccountID: 2,  gross: 25000,  date: '2026-05-14' },
      { salesRecordID: 6,  farmerAccountID: 4,  gross: 12500,  date: '2026-05-09' },
      { salesRecordID: 7,  farmerAccountID: 1,  gross: 15000,  date: '2026-01-18' },
      { salesRecordID: 8,  farmerAccountID: 2,  gross: 15000,  date: '2026-01-18' },
      { salesRecordID: 9,  farmerAccountID: 4,  gross: 12000,  date: '2026-01-28' },
      { salesRecordID: 10, farmerAccountID: 3,  gross: 8000,   date: '2026-01-28' },
      { salesRecordID: 11, farmerAccountID: 1,  gross: 18750,  date: '2026-02-15' },
      { salesRecordID: 12, farmerAccountID: 18, gross: 18750,  date: '2026-02-15' },
      { salesRecordID: 13, farmerAccountID: 5,  gross: 10000,  date: '2026-02-25' },
      { salesRecordID: 14, farmerAccountID: 6,  gross: 8000,   date: '2026-02-25' },
      { salesRecordID: 15, farmerAccountID: 1,  gross: 22500,  date: '2026-03-12' },
      { salesRecordID: 16, farmerAccountID: 2,  gross: 22500,  date: '2026-03-12' },
      { salesRecordID: 17, farmerAccountID: 4,  gross: 15000,  date: '2026-03-25' },
      { salesRecordID: 18, farmerAccountID: 17, gross: 10000,  date: '2026-03-25' },
      { salesRecordID: 19, farmerAccountID: 1,  gross: 25000,  date: '2026-04-12' },
      { salesRecordID: 20, farmerAccountID: 2,  gross: 20000,  date: '2026-04-12' },
      { salesRecordID: 21, farmerAccountID: 18, gross: 17500,  date: '2026-04-12' },
      { salesRecordID: 22, farmerAccountID: 5,  gross: 7000,   date: '2026-04-20' },
      { salesRecordID: 23, farmerAccountID: 3,  gross: 5000,   date: '2026-04-20' },
      // ── Coops 7–15 + Account 16 ──
      { salesRecordID: 24, farmerAccountID: 7,  gross: 14000,  date: '2026-02-05' },
      { salesRecordID: 25, farmerAccountID: 8,  gross: 14000,  date: '2026-02-05' },
      { salesRecordID: 26, farmerAccountID: 9,  gross: 12000,  date: '2026-03-04' },
      { salesRecordID: 27, farmerAccountID: 11, gross: 13000,  date: '2026-03-04' },
      { salesRecordID: 28, farmerAccountID: 12, gross: 10000,  date: '2026-03-04' },
      { salesRecordID: 29, farmerAccountID: 13, gross: 16000,  date: '2026-04-06' },
      { salesRecordID: 30, farmerAccountID: 14, gross: 14000,  date: '2026-04-06' },
      { salesRecordID: 31, farmerAccountID: 15, gross: 12000,  date: '2026-04-06' },
      { salesRecordID: 32, farmerAccountID: 7,  gross: 11000,  date: '2026-04-25' },
      { salesRecordID: 33, farmerAccountID: 8,  gross: 11000,  date: '2026-04-25' },
      { salesRecordID: 34, farmerAccountID: 9,  gross: 10000,  date: '2026-05-05' },
      { salesRecordID: 35, farmerAccountID: 11, gross: 12000,  date: '2026-05-05' },
      { salesRecordID: 36, farmerAccountID: 12, gross: 8000,   date: '2026-05-05' },
      { salesRecordID: 37, farmerAccountID: 16, gross: 18000,  date: '2026-05-08' },
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
