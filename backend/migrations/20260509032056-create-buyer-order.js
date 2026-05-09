"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("BuyerOrders", {
      orderID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      managedBy: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "userID",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      buyerName: {
        type: Sequelize.STRING,
      },
      buyerCompany: {
        type: Sequelize.STRING,
      },
      buyerContact: {
        type: Sequelize.STRING,
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
      requestedQuantity: {
        type: Sequelize.INTEGER,
      },
      urgencyLevel: {
        type: Sequelize.STRING,
      },
      orderDate: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable("BuyerOrders");
  },
};
