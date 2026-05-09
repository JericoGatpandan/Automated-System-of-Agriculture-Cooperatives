"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DeliveryRecord extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      DeliveryRecord.belongsTo(models.BuyerOrder, { foreignKey: "orderID" });
      DeliveryRecord.belongsTo(models.User, {
        foreignKey: "managedBy",
        as: "manager",
      });
      DeliveryRecord.hasMany(models.SalesRecord, { foreignKey: "deliveryID" });
    }
  }
  DeliveryRecord.init(
    {
      deliveryID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      orderID: DataTypes.INTEGER,
      managedBy: DataTypes.INTEGER,
      consolidationDate: DataTypes.DATE,
      deliveryDate: DataTypes.DATE,
      totalTransactionAmount: DataTypes.DECIMAL,
      commissionRateFederation: DataTypes.DECIMAL,
      commissionRateCoop: DataTypes.DECIMAL,
      status: DataTypes.STRING,
      notes: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "DeliveryRecord",
    },
  );
  return DeliveryRecord;
};
