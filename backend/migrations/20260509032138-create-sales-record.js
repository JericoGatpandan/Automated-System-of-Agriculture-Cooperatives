"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("SalesRecords", {
      salesRecordID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      farmerAccountID: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "FarmerAccounts",
          key: "farmerAccountID",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      deliveryID: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "DeliveryRecords",
          key: "deliveryID",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      grossAmount: {
        type: Sequelize.DECIMAL,
      },
      commissionAmount: {
        type: Sequelize.DECIMAL,
      },
      netAmount: {
        type: Sequelize.DECIMAL,
      },
      transactionDate: {
        type: Sequelize.DATE,
      },
      remarks: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable("SalesRecords");
  },
};
