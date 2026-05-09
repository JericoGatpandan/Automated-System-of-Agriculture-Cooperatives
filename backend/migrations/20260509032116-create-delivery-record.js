"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("DeliveryRecords", {
      deliveryID: {
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
      consolidationDate: {
        type: Sequelize.DATE,
      },
      deliveryDate: {
        type: Sequelize.DATE,
      },
      totalTransactionAmount: {
        type: Sequelize.DECIMAL,
      },
      commissionRateFederation: {
        type: Sequelize.DECIMAL,
      },
      commissionRateCoop: {
        type: Sequelize.DECIMAL,
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
    await queryInterface.dropTable("DeliveryRecords");
  },
};
