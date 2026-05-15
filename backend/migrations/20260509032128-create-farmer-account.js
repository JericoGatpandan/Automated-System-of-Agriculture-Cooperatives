"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("FarmerAccounts", {
      farmerAccountID: {
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
      primaryCoopID: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "PrimaryCooperatives",
          key: "primaryCoopID",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      createdDate: {
        type: Sequelize.DATE,
      },
      status: {
        type: Sequelize.STRING,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("FarmerAccounts");
  },
};
