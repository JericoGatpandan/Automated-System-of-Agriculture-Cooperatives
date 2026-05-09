'use strict';

/**
 * Seed FarmerAccounts.
 *
 * Per the Cardinalities doc: each Farmer may have multiple FarmerAccounts
 * (one per cooperative they belong to). We derive these from the
 * FarmerCooperative memberships in sample-table.md.
 *
 * farmerCoopID 1 → farmer 1, coop 3
 * farmerCoopID 2 → farmer 2, coop 1
 * farmerCoopID 3 → farmer 3, coop 2
 * farmerCoopID 4 → farmer 4, coop 5
 * farmerCoopID 5 → farmer 5, coop 4 (inactive — account still exists)
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('FarmerAccounts', [
      {
        farmerAccountID: 1,
        farmerID: 1,
        primaryCoopID: 3,
        createdDate: new Date('2022-06-01'),
        status: 'active',
        createdAt: new Date('2022-06-01'),
        updatedAt: new Date('2022-06-01'),
      },
      {
        farmerAccountID: 2,
        farmerID: 2,
        primaryCoopID: 1,
        createdDate: new Date('2021-09-15'),
        status: 'active',
        createdAt: new Date('2021-09-15'),
        updatedAt: new Date('2021-09-15'),
      },
      {
        farmerAccountID: 3,
        farmerID: 3,
        primaryCoopID: 2,
        createdDate: new Date('2023-01-10'),
        status: 'active',
        createdAt: new Date('2023-01-10'),
        updatedAt: new Date('2023-01-10'),
      },
      {
        farmerAccountID: 4,
        farmerID: 4,
        primaryCoopID: 5,
        createdDate: new Date('2023-03-20'),
        status: 'active',
        createdAt: new Date('2023-03-20'),
        updatedAt: new Date('2023-03-20'),
      },
      {
        farmerAccountID: 5,
        farmerID: 5,
        primaryCoopID: 4,
        createdDate: new Date('2022-11-05'),
        status: 'inactive',
        createdAt: new Date('2022-11-05'),
        updatedAt: new Date('2022-11-05'),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('FarmerAccounts', null, {});
  },
};
