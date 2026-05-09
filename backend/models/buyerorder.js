"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BuyerOrder extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      BuyerOrder.belongsTo(models.User, {
        foreignKey: "managedBy",
        as: "manager",
      });
      BuyerOrder.belongsTo(models.CropType, { foreignKey: "cropTypeID" });
      BuyerOrder.hasMany(models.CoopAssignment, { foreignKey: "orderID" });
      BuyerOrder.hasMany(models.DeliveryRecord, { foreignKey: "orderID" });
    }
  }
  BuyerOrder.init(
    {
      orderID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      managedBy: DataTypes.INTEGER,
      buyerName: DataTypes.STRING,
      buyerCompany: DataTypes.STRING,
      buyerContact: DataTypes.STRING,
      cropTypeID: DataTypes.INTEGER,
      requestedQuantity: DataTypes.INTEGER,
      urgencyLevel: DataTypes.STRING,
      orderDate: DataTypes.DATE,
      status: DataTypes.STRING,
      notes: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "BuyerOrder",
    },
  );
  return BuyerOrder;
};
