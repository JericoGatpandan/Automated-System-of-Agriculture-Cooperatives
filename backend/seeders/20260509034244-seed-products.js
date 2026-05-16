"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Products", [
      {
        productID: 1,
        farmerID: 1,
        cropTypeID: 1,
        unitPrice: 50.0,
        availableQuantity: 1200,
        qualityGrade: "Grade A",
        isDeleted: false,
        createdAt: new Date("2026-05-10"),
        updatedAt: new Date("2026-05-10"),
      },
      {
        productID: 2,
        farmerID: 2,
        cropTypeID: 4,
        unitPrice: 48.0,
        availableQuantity: 900,
        qualityGrade: "Grade A",
        isDeleted: false,
        createdAt: new Date("2026-05-11"),
        updatedAt: new Date("2026-05-11"),
      },
      {
        productID: 3,
        farmerID: 3,
        cropTypeID: 1,
        unitPrice: 46.0,
        availableQuantity: 1000,
        qualityGrade: "Grade A",
        isDeleted: false,
        createdAt: new Date("2026-05-11"),
        updatedAt: new Date("2026-05-11"),
      },
      {
        productID: 4,
        farmerID: 4,
        cropTypeID: 2,
        unitPrice: 30.0,
        availableQuantity: 600,
        qualityGrade: "Grade A",
        isDeleted: false,
        createdAt: new Date("2026-05-12"),
        updatedAt: new Date("2026-05-12"),
      },
      {
        productID: 5,
        farmerID: 5,
        cropTypeID: 3,
        unitPrice: 22.0,
        availableQuantity: 800,
        qualityGrade: "Grade A",
        isDeleted: false,
        createdAt: new Date("2026-05-12"),
        updatedAt: new Date("2026-05-12"),
      },
      {
        productID: 6,
        farmerID: 8,
        cropTypeID: 4,
        unitPrice: 20.0,
        availableQuantity: 500,
        qualityGrade: "Grade B",
        isDeleted: false,
        createdAt: new Date("2026-05-13"),
        updatedAt: new Date("2026-05-13"),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Products", null, {});
  },
};
