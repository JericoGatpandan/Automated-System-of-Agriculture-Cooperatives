'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Products', [
      {
        productID: 1,
        farmerID: 1,
        cropTypeID: 1,
        unitPrice: 25.00,
        availableQuantity: 500,
        qualityGrade: 'Grade A',
        isDeleted: false,
        createdAt: new Date('2024-09-01'),
        updatedAt: new Date('2024-09-01'),
      },
      {
        productID: 2,
        farmerID: 2,
        cropTypeID: 4,
        unitPrice: 15.00,
        availableQuantity: 200,
        qualityGrade: 'Grade B',
        isDeleted: false,
        createdAt: new Date('2024-09-05'),
        updatedAt: new Date('2024-09-05'),
      },
      {
        productID: 3,
        farmerID: 3,
        cropTypeID: 1,
        unitPrice: 24.00,
        availableQuantity: 300,
        qualityGrade: 'Grade A',
        isDeleted: false,
        createdAt: new Date('2024-09-10'),
        updatedAt: new Date('2024-09-10'),
      },
      {
        productID: 4,
        farmerID: 4,
        cropTypeID: 2,
        unitPrice: 18.00,
        availableQuantity: 400,
        qualityGrade: 'Grade A',
        isDeleted: false,
        createdAt: new Date('2024-09-12'),
        updatedAt: new Date('2024-09-12'),
      },
      {
        productID: 5,
        farmerID: 5,
        cropTypeID: 3,
        unitPrice: 12.00,
        availableQuantity: 600,
        qualityGrade: 'Grade B',
        isDeleted: false,
        createdAt: new Date('2024-09-15'),
        updatedAt: new Date('2024-09-15'),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Products', null, {});
  },
};
