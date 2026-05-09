"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("FarmerFulfillments", {
      fulfillmentID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      assignmentID: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "CoopAssignments",
          key: "assignmentID",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
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
      quantityCommitted: {
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.STRING,
      },
      notes: {
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
    await queryInterface.dropTable("FarmerFulfillments");
  },
};
