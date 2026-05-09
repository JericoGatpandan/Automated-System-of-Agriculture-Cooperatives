'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('FarmerCooperatives', [
      {
        farmerCoopID: 1,
        farmerID: 1,
        primaryCoopID: 3,
        joinedDate: new Date('2022-06-01'),
        status: 'active',
        createdAt: new Date('2022-06-01'),
        updatedAt: new Date('2022-06-01'),
      },
      {
        farmerCoopID: 2,
        farmerID: 2,
        primaryCoopID: 1,
        joinedDate: new Date('2021-09-15'),
        status: 'active',
        createdAt: new Date('2021-09-15'),
        updatedAt: new Date('2021-09-15'),
      },
      {
        farmerCoopID: 3,
        farmerID: 3,
        primaryCoopID: 2,
        joinedDate: new Date('2023-01-10'),
        status: 'active',
        createdAt: new Date('2023-01-10'),
        updatedAt: new Date('2023-01-10'),
      },
      {
        farmerCoopID: 4,
        farmerID: 4,
        primaryCoopID: 5,
        joinedDate: new Date('2023-03-20'),
        status: 'active',
        createdAt: new Date('2023-03-20'),
        updatedAt: new Date('2023-03-20'),
      },
      {
        farmerCoopID: 5,
        farmerID: 5,
        primaryCoopID: 4,
        joinedDate: new Date('2022-11-05'),
        status: 'inactive',
        createdAt: new Date('2022-11-05'),
        updatedAt: new Date('2022-11-05'),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('FarmerCooperatives', null, {});
  },
};
