'use strict';

/**
 * Seed SalesRecords.
 *
 * Commission = 8% (3% Federation + 5% Coop).
 *
 * Farmer Account → Coop mapping:
 *   1 → Farmer 1, Coop 1    |  7  → Farmer 7, Coop 7    | 13 → Farmer 1, Coop 13
 *   2 → Farmer 2, Coop 2    |  8  → Farmer 8, Coop 8    | 14 → Farmer 2, Coop 14
 *   3 → Farmer 3, Coop 3    |  9  → Farmer 9, Coop 9    | 15 → Farmer 3, Coop 15
 *   4 → Farmer 4, Coop 4    |  10 → Farmer 10, Coop 10  | 16 → Farmer 4, Coop 5
 *   5 → Farmer 5, Coop 5    |  11 → Farmer 11, Coop 11  | 17 → Farmer 6, Coop 4
 *   6 → Farmer 6, Coop 6    |  12 → Farmer 12, Coop 12  | 18 → Farmer 5, Coop 1
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('SalesRecords', [
      // ══════════════════════════════════════════════════
      //  ORIGINAL: Deliveries 1, 2, 4 (May 2026)
      // ══════════════════════════════════════════════════
      { salesRecordID: 1,  farmerAccountID: 1,  deliveryID: 1,  grossAmount: 9000,    commissionAmount: 720,    netAmount: 8280,    transactionDate: new Date('2026-05-12'), remarks: 'Farmer 1 – Delivery 1', createdAt: new Date('2026-05-12'), updatedAt: new Date('2026-05-12') },
      { salesRecordID: 2,  farmerAccountID: 18, deliveryID: 1,  grossAmount: 9000,    commissionAmount: 720,    netAmount: 8280,    transactionDate: new Date('2026-05-12'), remarks: 'Farmer 5 – Delivery 1', createdAt: new Date('2026-05-12'), updatedAt: new Date('2026-05-12') },
      { salesRecordID: 3,  farmerAccountID: 17, deliveryID: 1,  grossAmount: 15750,   commissionAmount: 1260,   netAmount: 14490,   transactionDate: new Date('2026-05-12'), remarks: 'Farmer 6 – Delivery 1', createdAt: new Date('2026-05-12'), updatedAt: new Date('2026-05-12') },
      { salesRecordID: 4,  farmerAccountID: 2,  deliveryID: 1,  grossAmount: 11250,   commissionAmount: 900,    netAmount: 10350,   transactionDate: new Date('2026-05-12'), remarks: 'Farmer 2 – Delivery 1', createdAt: new Date('2026-05-12'), updatedAt: new Date('2026-05-12') },
      { salesRecordID: 5,  farmerAccountID: 2,  deliveryID: 2,  grossAmount: 25000,   commissionAmount: 2000,   netAmount: 23000,   transactionDate: new Date('2026-05-14'), remarks: 'Farmer 2 – Delivery 2', createdAt: new Date('2026-05-14'), updatedAt: new Date('2026-05-14') },
      { salesRecordID: 6,  farmerAccountID: 4,  deliveryID: 4,  grossAmount: 12500,   commissionAmount: 1000,   netAmount: 11500,   transactionDate: new Date('2026-05-09'), remarks: 'Farmer 4 – Delivery 4', createdAt: new Date('2026-05-09'), updatedAt: new Date('2026-05-09') },

      // ══════════════════════════════════════════════════
      //  HISTORICAL: Deliveries 5–12 (Jan–Apr, Coops 1–6)
      // ══════════════════════════════════════════════════
      { salesRecordID: 7,  farmerAccountID: 1,  deliveryID: 5,  grossAmount: 15000,   commissionAmount: 1200,   netAmount: 13800,   transactionDate: new Date('2026-01-18'), remarks: 'Farmer 1 – Jan Metro', createdAt: new Date('2026-01-18'), updatedAt: new Date('2026-01-18') },
      { salesRecordID: 8,  farmerAccountID: 2,  deliveryID: 5,  grossAmount: 15000,   commissionAmount: 1200,   netAmount: 13800,   transactionDate: new Date('2026-01-18'), remarks: 'Farmer 2 – Jan Metro', createdAt: new Date('2026-01-18'), updatedAt: new Date('2026-01-18') },
      { salesRecordID: 9,  farmerAccountID: 4,  deliveryID: 6,  grossAmount: 12000,   commissionAmount: 960,    netAmount: 11040,   transactionDate: new Date('2026-01-28'), remarks: 'Farmer 4 – Jan SM', createdAt: new Date('2026-01-28'), updatedAt: new Date('2026-01-28') },
      { salesRecordID: 10, farmerAccountID: 3,  deliveryID: 6,  grossAmount: 8000,    commissionAmount: 640,    netAmount: 7360,    transactionDate: new Date('2026-01-28'), remarks: 'Farmer 3 – Jan SM', createdAt: new Date('2026-01-28'), updatedAt: new Date('2026-01-28') },
      { salesRecordID: 11, farmerAccountID: 1,  deliveryID: 7,  grossAmount: 18750,   commissionAmount: 1500,   netAmount: 17250,   transactionDate: new Date('2026-02-15'), remarks: 'Farmer 1 – Feb Puregold', createdAt: new Date('2026-02-15'), updatedAt: new Date('2026-02-15') },
      { salesRecordID: 12, farmerAccountID: 18, deliveryID: 7,  grossAmount: 18750,   commissionAmount: 1500,   netAmount: 17250,   transactionDate: new Date('2026-02-15'), remarks: 'Farmer 5 – Feb Puregold', createdAt: new Date('2026-02-15'), updatedAt: new Date('2026-02-15') },
      { salesRecordID: 13, farmerAccountID: 5,  deliveryID: 8,  grossAmount: 10000,   commissionAmount: 800,    netAmount: 9200,    transactionDate: new Date('2026-02-25'), remarks: 'Farmer 5 – Feb Robinsons', createdAt: new Date('2026-02-25'), updatedAt: new Date('2026-02-25') },
      { salesRecordID: 14, farmerAccountID: 6,  deliveryID: 8,  grossAmount: 8000,    commissionAmount: 640,    netAmount: 7360,    transactionDate: new Date('2026-02-25'), remarks: 'Farmer 6 – Feb Robinsons', createdAt: new Date('2026-02-25'), updatedAt: new Date('2026-02-25') },
      { salesRecordID: 15, farmerAccountID: 1,  deliveryID: 9,  grossAmount: 22500,   commissionAmount: 1800,   netAmount: 20700,   transactionDate: new Date('2026-03-12'), remarks: 'Farmer 1 – Mar Walter Mart', createdAt: new Date('2026-03-12'), updatedAt: new Date('2026-03-12') },
      { salesRecordID: 16, farmerAccountID: 2,  deliveryID: 9,  grossAmount: 22500,   commissionAmount: 1800,   netAmount: 20700,   transactionDate: new Date('2026-03-12'), remarks: 'Farmer 2 – Mar Walter Mart', createdAt: new Date('2026-03-12'), updatedAt: new Date('2026-03-12') },
      { salesRecordID: 17, farmerAccountID: 4,  deliveryID: 10, grossAmount: 15000,   commissionAmount: 1200,   netAmount: 13800,   transactionDate: new Date('2026-03-25'), remarks: 'Farmer 4 – Mar DA corn', createdAt: new Date('2026-03-25'), updatedAt: new Date('2026-03-25') },
      { salesRecordID: 18, farmerAccountID: 17, deliveryID: 10, grossAmount: 10000,   commissionAmount: 800,    netAmount: 9200,    transactionDate: new Date('2026-03-25'), remarks: 'Farmer 6 – Mar DA corn', createdAt: new Date('2026-03-25'), updatedAt: new Date('2026-03-25') },
      { salesRecordID: 19, farmerAccountID: 1,  deliveryID: 11, grossAmount: 25000,   commissionAmount: 2000,   netAmount: 23000,   transactionDate: new Date('2026-04-12'), remarks: 'Farmer 1 – Apr Jollibee', createdAt: new Date('2026-04-12'), updatedAt: new Date('2026-04-12') },
      { salesRecordID: 20, farmerAccountID: 2,  deliveryID: 11, grossAmount: 20000,   commissionAmount: 1600,   netAmount: 18400,   transactionDate: new Date('2026-04-12'), remarks: 'Farmer 2 – Apr Jollibee', createdAt: new Date('2026-04-12'), updatedAt: new Date('2026-04-12') },
      { salesRecordID: 21, farmerAccountID: 18, deliveryID: 11, grossAmount: 17500,   commissionAmount: 1400,   netAmount: 16100,   transactionDate: new Date('2026-04-12'), remarks: 'Farmer 5 – Apr Jollibee', createdAt: new Date('2026-04-12'), updatedAt: new Date('2026-04-12') },
      { salesRecordID: 22, farmerAccountID: 5,  deliveryID: 12, grossAmount: 7000,    commissionAmount: 560,    netAmount: 6440,    transactionDate: new Date('2026-04-20'), remarks: 'Farmer 5 – Apr Mercury', createdAt: new Date('2026-04-20'), updatedAt: new Date('2026-04-20') },
      { salesRecordID: 23, farmerAccountID: 3,  deliveryID: 12, grossAmount: 5000,    commissionAmount: 400,    netAmount: 4600,    transactionDate: new Date('2026-04-20'), remarks: 'Farmer 3 – Apr Mercury', createdAt: new Date('2026-04-20'), updatedAt: new Date('2026-04-20') },

      // ══════════════════════════════════════════════════
      //  NEW: Coops 7–15, Account 16 (Deliveries 13–18)
      // ══════════════════════════════════════════════════

      // Delivery 13 (Feb, ₱28k) → Coops 7 & 8
      { salesRecordID: 24, farmerAccountID: 7,  deliveryID: 13, grossAmount: 14000,   commissionAmount: 1120,   netAmount: 12880,   transactionDate: new Date('2026-02-05'), remarks: 'Farmer 7 – Feb rice (Coop 7)', createdAt: new Date('2026-02-05'), updatedAt: new Date('2026-02-05') },
      { salesRecordID: 25, farmerAccountID: 8,  deliveryID: 13, grossAmount: 14000,   commissionAmount: 1120,   netAmount: 12880,   transactionDate: new Date('2026-02-05'), remarks: 'Farmer 8 – Feb rice (Coop 8)', createdAt: new Date('2026-02-05'), updatedAt: new Date('2026-02-05') },

      // Delivery 14 (Mar, ₱35k) → Coops 9, 11, 12
      { salesRecordID: 26, farmerAccountID: 9,  deliveryID: 14, grossAmount: 12000,   commissionAmount: 960,    netAmount: 11040,   transactionDate: new Date('2026-03-04'), remarks: 'Farmer 9 – Mar corn (Coop 9)', createdAt: new Date('2026-03-04'), updatedAt: new Date('2026-03-04') },
      { salesRecordID: 27, farmerAccountID: 11, deliveryID: 14, grossAmount: 13000,   commissionAmount: 1040,   netAmount: 11960,   transactionDate: new Date('2026-03-04'), remarks: 'Farmer 11 – Mar corn (Coop 11)', createdAt: new Date('2026-03-04'), updatedAt: new Date('2026-03-04') },
      { salesRecordID: 28, farmerAccountID: 12, deliveryID: 14, grossAmount: 10000,   commissionAmount: 800,    netAmount: 9200,    transactionDate: new Date('2026-03-04'), remarks: 'Farmer 12 – Mar corn (Coop 12)', createdAt: new Date('2026-03-04'), updatedAt: new Date('2026-03-04') },

      // Delivery 15 (Apr, ₱42k) → Coops 13, 14, 15
      { salesRecordID: 29, farmerAccountID: 13, deliveryID: 15, grossAmount: 16000,   commissionAmount: 1280,   netAmount: 14720,   transactionDate: new Date('2026-04-06'), remarks: 'Farmer 1 – Apr rice (Coop 13)', createdAt: new Date('2026-04-06'), updatedAt: new Date('2026-04-06') },
      { salesRecordID: 30, farmerAccountID: 14, deliveryID: 15, grossAmount: 14000,   commissionAmount: 1120,   netAmount: 12880,   transactionDate: new Date('2026-04-06'), remarks: 'Farmer 2 – Apr rice (Coop 14)', createdAt: new Date('2026-04-06'), updatedAt: new Date('2026-04-06') },
      { salesRecordID: 31, farmerAccountID: 15, deliveryID: 15, grossAmount: 12000,   commissionAmount: 960,    netAmount: 11040,   transactionDate: new Date('2026-04-06'), remarks: 'Farmer 3 – Apr rice (Coop 15)', createdAt: new Date('2026-04-06'), updatedAt: new Date('2026-04-06') },

      // Delivery 16 (Apr, ₱22k) → Coops 7 & 8 second batch
      { salesRecordID: 32, farmerAccountID: 7,  deliveryID: 16, grossAmount: 11000,   commissionAmount: 880,    netAmount: 10120,   transactionDate: new Date('2026-04-25'), remarks: 'Farmer 7 – Apr rice 2nd (Coop 7)', createdAt: new Date('2026-04-25'), updatedAt: new Date('2026-04-25') },
      { salesRecordID: 33, farmerAccountID: 8,  deliveryID: 16, grossAmount: 11000,   commissionAmount: 880,    netAmount: 10120,   transactionDate: new Date('2026-04-25'), remarks: 'Farmer 8 – Apr rice 2nd (Coop 8)', createdAt: new Date('2026-04-25'), updatedAt: new Date('2026-04-25') },

      // Delivery 17 (May, ₱30k) → Coops 9, 11, 12
      { salesRecordID: 34, farmerAccountID: 9,  deliveryID: 17, grossAmount: 10000,   commissionAmount: 800,    netAmount: 9200,    transactionDate: new Date('2026-05-05'), remarks: 'Farmer 9 – May corn (Coop 9)', createdAt: new Date('2026-05-05'), updatedAt: new Date('2026-05-05') },
      { salesRecordID: 35, farmerAccountID: 11, deliveryID: 17, grossAmount: 12000,   commissionAmount: 960,    netAmount: 11040,   transactionDate: new Date('2026-05-05'), remarks: 'Farmer 11 – May corn (Coop 11)', createdAt: new Date('2026-05-05'), updatedAt: new Date('2026-05-05') },
      { salesRecordID: 36, farmerAccountID: 12, deliveryID: 17, grossAmount: 8000,    commissionAmount: 640,    netAmount: 7360,    transactionDate: new Date('2026-05-05'), remarks: 'Farmer 12 – May corn (Coop 12)', createdAt: new Date('2026-05-05'), updatedAt: new Date('2026-05-05') },

      // Delivery 18 (May, ₱18k) → Coop 5 (Account 16 = Farmer 4 in Coop 5)
      { salesRecordID: 37, farmerAccountID: 16, deliveryID: 18, grossAmount: 18000,   commissionAmount: 1440,   netAmount: 16560,   transactionDate: new Date('2026-05-08'), remarks: 'Farmer 4 – May rice (Coop 5 cross)', createdAt: new Date('2026-05-08'), updatedAt: new Date('2026-05-08') },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('SalesRecords', null, {});
  },
};
