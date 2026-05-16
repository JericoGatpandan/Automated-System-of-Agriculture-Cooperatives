"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const seededAt = new Date("2026-05-16");

    await queryInterface.bulkInsert("CropTypes", [
      {
        cropTypeID: 1,
        cropName: "Rice",
        category: "Grain",
        createdAt: seededAt,
        updatedAt: seededAt,
      },
      {
        cropTypeID: 2,
        cropName: "Corn",
        category: "Grain",
        createdAt: seededAt,
        updatedAt: seededAt,
      },
      {
        cropTypeID: 3,
        cropName: "Coconut",
        category: "Plantation Crop",
        createdAt: seededAt,
        updatedAt: seededAt,
      },
      {
        cropTypeID: 4,
        cropName: "Vegetables",
        category: "Horticulture",
        createdAt: seededAt,
        updatedAt: seededAt,
      },
      {
        cropTypeID: 5,
        cropName: "Pandan",
        category: "Industrial Crop",
        createdAt: seededAt,
        updatedAt: seededAt,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("CropTypes", null, {});
  },
};
