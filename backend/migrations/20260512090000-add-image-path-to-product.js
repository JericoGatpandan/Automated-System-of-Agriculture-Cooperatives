"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Products", "imagePath", {
      type: Sequelize.TEXT,
      allowNull: true,
      after: "qualityGrade",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Products", "imagePath");
  },
};
