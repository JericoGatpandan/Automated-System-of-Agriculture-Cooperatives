"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("PrintedStatements", {
      printedStatementID: {
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
      periodStart: {
        type: Sequelize.DATE,
      },
      periodEnd: {
        type: Sequelize.DATE,
      },
      generatedBy: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "userID",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      generatedDate: {
        type: Sequelize.DATE,
      },
      totalGrossSales: {
        type: Sequelize.DECIMAL,
      },
      totalCommission: {
        type: Sequelize.DECIMAL,
      },
      totalShareCapital: {
        type: Sequelize.DECIMAL,
      },
      totalLoans: {
        type: Sequelize.DECIMAL,
      },
      netBalance: {
        type: Sequelize.DECIMAL,
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
    await queryInterface.dropTable("PrintedStatements");
  },
};
