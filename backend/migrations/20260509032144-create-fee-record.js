"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("FeeRecords", {
      feeRecordID: {
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
      salesRecordID: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "SalesRecords",
          key: "salesRecordID",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      feeType: {
        type: Sequelize.STRING,
      },
      rate: {
        type: Sequelize.DECIMAL,
      },
      amount: {
        type: Sequelize.DECIMAL,
      },
      status: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("FeeRecords");
  },
};
