"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CropType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CropType.hasMany(models.Product, { foreignKey: "cropTypeID" });
      CropType.hasMany(models.BuyerOrder, { foreignKey: "cropTypeID" });
    }
  }
  CropType.init(
    {
      cropTypeID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      cropName: DataTypes.STRING,
      category: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "CropType",
    },
  );
  return CropType;
};
