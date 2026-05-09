"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Products", {
      productID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      farmerID: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Farmers",
          key: "farmerID",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      cropTypeID: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "CropTypes",
          key: "cropTypeID",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      unitPrice: {
        type: Sequelize.DECIMAL,
      },
      availableQuantity: {
        type: Sequelize.INTEGER,
      },
      qualityGrade: {
        type: Sequelize.STRING,
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Products");
  },
};
