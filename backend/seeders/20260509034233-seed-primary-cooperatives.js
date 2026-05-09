'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('PrimaryCooperatives', [
      {
        primaryCoopID: 1,
        userID: 2,
        coopName: 'CamSur Multi-Purpose Cooperative (CMPC)',
        barangay: 'Poblacion',
        municipality: 'Pili',
        phone: '9171234567',
        registrationNumber: 'CDA-9520-001',
        isDeleted: false,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        primaryCoopID: 2,
        userID: 4,
        coopName: 'Magarao Multi-Purpose Cooperative (MMPC)',
        barangay: 'Magarao Centro',
        municipality: 'Magarao',
        phone: '9182345678',
        registrationNumber: 'CDA-9520-002',
        isDeleted: false,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
      },
      {
        primaryCoopID: 3,
        userID: 6,
        coopName: 'San Agustin-San Ramon Agrarian Reform Farmers Cooperative (SARFC)',
        barangay: 'San Agustin',
        municipality: 'Bula',
        phone: '9193456789',
        registrationNumber: 'CDA-9520-003',
        isDeleted: false,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
      },
      {
        primaryCoopID: 4,
        userID: 8,
        coopName: 'Lirag Agrarian Reform Farmer Beneficiaries Cooperative (LARFBCO)',
        barangay: 'Lirag',
        municipality: 'Bula',
        phone: '9204567890',
        registrationNumber: 'CDA-9520-004',
        isDeleted: false,
        createdAt: new Date('2024-02-05'),
        updatedAt: new Date('2024-02-05'),
      },
      {
        primaryCoopID: 5,
        userID: 10,
        coopName: 'Sampaloc Multi-Purpose Cooperative (SMPC)',
        barangay: 'Sampaloc',
        municipality: 'Gainza',
        phone: '9215678901',
        registrationNumber: 'CDA-9520-005',
        isDeleted: false,
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10'),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('PrimaryCooperatives', null, {});
  },
};
