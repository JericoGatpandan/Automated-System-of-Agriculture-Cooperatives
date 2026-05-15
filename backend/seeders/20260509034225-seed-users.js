"use strict";

const bcrypt = require("bcryptjs");

/**
 * Seed Users table.
 *
 * The sample-table.md shows 5 users but PrimaryCooperatives reference userIDs
 * 2, 4, 6, 8, 10 (Coop Officers) and Farmers reference userIDs 3, 5, 7, 9, 11.
 * We need 11 users total: 1 Admin + 5 Coop Officers + 5 Farmers.
 *
 * All seed accounts share the password "P@ssw0rd2024" for development/testing.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 10 salt rounds — matches bcrypt standard used throughout the project
    const hash = await bcrypt.hash("password", 10);

    await queryInterface.bulkInsert("Users", [
      // ── FACCS Admin ──
      {
        userID: 1,
        roleID: 1,
        email: "faccs.admin@faccs.ph",
        password_hash: hash,
        isDeleted: false,
        createdAt: new Date("2026-05-15"),
        updatedAt: new Date("2026-05-15"),
      }
      // // ── Coop Officers (roleID 2) ──
      // {
      //   userID: 2,
      //   roleID: 2,
      //   email: "cmpc.officer@cmpc.coop",
      //   password_hash: hash,
      //   isDeleted: false,
      //   createdAt: new Date("2024-01-15"),
      //   updatedAt: new Date("2024-01-15"),
      // },
      // {
      //   userID: 4,
      //   roleID: 2,
      //   email: "mmpc.officer@mmpc.coop",
      //   password_hash: hash,
      //   isDeleted: false,
      //   createdAt: new Date("2024-02-10"),
      //   updatedAt: new Date("2024-02-10"),
      // },
      // {
      //   userID: 6,
      //   roleID: 2,
      //   email: "sarfc.officer@sarfc.coop",
      //   password_hash: hash,
      //   isDeleted: false,
      //   createdAt: new Date("2024-02-01"),
      //   updatedAt: new Date("2024-02-01"),
      // },
      // {
      //   userID: 8,
      //   roleID: 2,
      //   email: "larfbco.officer@larfbco.coop",
      //   password_hash: hash,
      //   isDeleted: false,
      //   createdAt: new Date("2024-02-05"),
      //   updatedAt: new Date("2024-02-05"),
      // },
      // {
      //   userID: 10,
      //   roleID: 2,
      //   email: "smpc.officer@smpc.coop",
      //   password_hash: hash,
      //   isDeleted: false,
      //   createdAt: new Date("2024-02-10"),
      //   updatedAt: new Date("2024-02-10"),
      // },
      // // ── Farmers (roleID 3) ──
      // {
      //   userID: 3,
      //   roleID: 3,
      //   email: "juan.dela.cruz@farmer.ph",
      //   password_hash: hash,
      //   isDeleted: false,
      //   createdAt: new Date("2024-02-01"),
      //   updatedAt: new Date("2024-02-01"),
      // },
      // {
      //   userID: 5,
      //   roleID: 3,
      //   email: "pedro.santos@farmer.ph",
      //   password_hash: hash,
      //   isDeleted: false,
      //   createdAt: new Date("2024-03-05"),
      //   updatedAt: new Date("2024-03-05"),
      // },
      // {
      //   userID: 7,
      //   roleID: 3,
      //   email: "maria.villanueva@farmer.ph",
      //   password_hash: hash,
      //   isDeleted: false,
      //   createdAt: new Date("2024-03-10"),
      //   updatedAt: new Date("2024-03-10"),
      // },
      // {
      //   userID: 9,
      //   roleID: 3,
      //   email: "roberto.navarro@farmer.ph",
      //   password_hash: hash,
      //   isDeleted: false,
      //   createdAt: new Date("2024-03-15"),
      //   updatedAt: new Date("2024-03-15"),
      // },
      // {
      //   userID: 11,
      //   roleID: 3,
      //   email: "ligaya.garcia@farmer.ph",
      //   password_hash: hash,
      //   isDeleted: false,
      //   createdAt: new Date("2024-04-01"),
      //   updatedAt: new Date("2024-04-01"),
      // },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {});
  },
};
