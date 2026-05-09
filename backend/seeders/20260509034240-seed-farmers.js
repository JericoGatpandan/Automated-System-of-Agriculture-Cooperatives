'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Farmers', [
      {
        farmerID: 1,
        userID: 3,
        firstName: 'Juan',
        middleName: 'Reyes',
        lastName: 'Dela Cruz',
        suffixName: null,
        farmName: 'Dela Cruz Farm',
        farmLocation: 'Bula, CamSur',
        isDeleted: false,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
      },
      {
        farmerID: 2,
        userID: 5,
        firstName: 'Pedro',
        middleName: 'Lim',
        lastName: 'Santos',
        suffixName: 'Jr.',
        farmName: 'Santos Organic Farm',
        farmLocation: 'Pili, CamSur',
        isDeleted: false,
        createdAt: new Date('2024-03-05'),
        updatedAt: new Date('2024-03-05'),
      },
      {
        farmerID: 3,
        userID: 7,
        firstName: 'Maria',
        middleName: 'Cruz',
        lastName: 'Villanueva',
        suffixName: null,
        farmName: 'Villanueva Rice Farm',
        farmLocation: 'Magarao, CamSur',
        isDeleted: false,
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-03-10'),
      },
      {
        farmerID: 4,
        userID: 9,
        firstName: 'Roberto',
        middleName: null,
        lastName: 'Navarro',
        suffixName: null,
        farmName: 'Navarro Farm',
        farmLocation: 'Gainza, CamSur',
        isDeleted: false,
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15'),
      },
      {
        farmerID: 5,
        userID: 11,
        firstName: 'Ligaya',
        middleName: 'Morales',
        lastName: 'Garcia',
        suffixName: null,
        farmName: 'Garcia Coco Farm',
        farmLocation: 'Bula, CamSur',
        isDeleted: false,
        createdAt: new Date('2024-04-01'),
        updatedAt: new Date('2024-04-01'),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Farmers', null, {});
  },
};
