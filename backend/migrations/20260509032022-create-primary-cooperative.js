"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("PrimaryCooperatives", {
      primaryCoopID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userID: {
        allowNull: false,
        type: Sequelize.INTEGER,
        unique: true,
        references: {
          model: "Users",
          key: "userID",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      coopName: {
        type: Sequelize.STRING,
      },
      barangay: {
        type: Sequelize.STRING,
      },
      municipality: {
        type: Sequelize.STRING,
      },
      phone: {
        type: Sequelize.STRING,
      },
      registrationNumber: {
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
    await queryInterface.dropTable("PrimaryCooperatives");
  },
};
