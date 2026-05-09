"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PrimaryCooperative extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PrimaryCooperative.belongsTo(models.User, { foreignKey: "userID" });
      PrimaryCooperative.hasMany(models.FarmerAccount, {
        foreignKey: "primaryCoopID",
      });
      PrimaryCooperative.hasMany(models.FarmerCooperative, {
        foreignKey: "primaryCoopID",
      });
      PrimaryCooperative.hasMany(models.CoopAssignment, {
        foreignKey: "primaryCoopID",
      });
    }
  }
  PrimaryCooperative.init(
    {
      primaryCoopID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userID: DataTypes.INTEGER,
      coopName: DataTypes.STRING,
      barangay: DataTypes.STRING,
      municipality: DataTypes.STRING,
      phone: DataTypes.STRING,
      registrationNumber: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      isDeleted: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "PrimaryCooperative",
    },
  );
  return PrimaryCooperative;
};
