"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("CoopAssignments", {
      assignmentID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      orderID: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "BuyerOrders",
          key: "orderID",
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
      assignedBy: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "userID",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      assignedDate: {
        type: Sequelize.DATE,
      },
      quantityRequired: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("CoopAssignments");
  },
};
