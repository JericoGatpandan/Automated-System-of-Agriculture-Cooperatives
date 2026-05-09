'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('CropTypes', [
      { cropTypeID: 1, cropName: 'Rice', category: 'Grain', createdAt: now, updatedAt: now },
      { cropTypeID: 2, cropName: 'Corn', category: 'Grain', createdAt: now, updatedAt: now },
      { cropTypeID: 3, cropName: 'Coconut', category: 'Plantation Crop', createdAt: now, updatedAt: now },
      { cropTypeID: 4, cropName: 'Vegetables', category: 'Horticulture', createdAt: now, updatedAt: now },
      { cropTypeID: 5, cropName: 'Pandan', category: 'Industrial Crop', createdAt: now, updatedAt: now },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('CropTypes', null, {});
  },
};
