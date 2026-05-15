"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Farmer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Farmer.belongsTo(models.User, { foreignKey: "userID" });
      Farmer.hasMany(models.Product, { foreignKey: "farmerID" });
      Farmer.hasMany(models.FarmerFulfillment, { foreignKey: "farmerID" });
      Farmer.hasMany(models.FarmerAccount, { foreignKey: "farmerID" });
      Farmer.hasMany(models.FarmerCooperative, { foreignKey: "farmerID" });
    }
  }
  Farmer.init(
    {
      farmerID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userID: DataTypes.INTEGER,
      firstName: DataTypes.STRING,
      middleName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      suffixName: DataTypes.STRING,
      farmName: DataTypes.STRING,
      municipality: DataTypes.STRING,
      barangay: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      isDeleted: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Farmer",
    },
  );
  return Farmer;
};
