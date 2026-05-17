"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "profilePicture", {
      type: Sequelize.STRING(500),
      allowNull: true,
      defaultValue: null,
      after: "password_hash",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "profilePicture");
  },
};
