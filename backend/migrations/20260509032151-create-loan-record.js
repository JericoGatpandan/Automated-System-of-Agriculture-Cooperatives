"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("LoanRecords", {
      loanRecordID: {
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
      loanAmount: {
        type: Sequelize.DECIMAL,
      },
      purpose: {
        type: Sequelize.STRING,
      },
      releaseDate: {
        type: Sequelize.DATE,
      },
      dueDate: {
        type: Sequelize.DATE,
      },
      amountRepaid: {
        type: Sequelize.DECIMAL,
      },
      outstandingBalance: {
        type: Sequelize.DECIMAL,
      },
      status: {
        type: Sequelize.STRING,
      },
      approvedBy: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "userID",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
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
    await queryInterface.dropTable("LoanRecords");
  },
};
