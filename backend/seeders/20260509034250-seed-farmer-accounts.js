"use strict";

/**
 * Seed FarmerAccounts.
 *
 * Per the Cardinalities doc: each Farmer may have multiple FarmerAccounts
 * (one per cooperative they belong to). We derive these from the
 * FarmerCooperative memberships in sample-table.md.
 *
 * farmerCoopID 1 → farmer 1, coop 1
 * farmerCoopID 2 → farmer 2, coop 2
 * farmerCoopID 3 → farmer 3, coop 3
 * farmerCoopID 4 → farmer 4, coop 4
 * farmerCoopID 5 → farmer 5, coop 5
 * farmerCoopID 6 → farmer 6, coop 6
 * farmerCoopID 7 → farmer 7, coop 7
 * farmerCoopID 8 → farmer 8, coop 8
 * farmerCoopID 9 → farmer 9, coop 9
 * farmerCoopID 10 → farmer 10, coop 10 (inactive)
 * farmerCoopID 11 → farmer 11, coop 11
 * farmerCoopID 12 → farmer 12, coop 12
 * farmerCoopID 13 → farmer 1, coop 13
 * farmerCoopID 14 → farmer 2, coop 14
 * farmerCoopID 15 → farmer 3, coop 15
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("FarmerAccounts", [
      {
        farmerAccountID: 1,
        farmerID: 1,
        primaryCoopID: 1,
        createdDate: new Date("2026-01-15"),
        status: "active",
        createdAt: new Date("2026-01-15"),
        updatedAt: new Date("2026-01-15"),
      },
      {
        farmerAccountID: 2,
        farmerID: 2,
        primaryCoopID: 2,
        createdDate: new Date("2026-01-20"),
        status: "active",
        createdAt: new Date("2026-01-20"),
        updatedAt: new Date("2026-01-20"),
      },
      {
        farmerAccountID: 3,
        farmerID: 3,
        primaryCoopID: 3,
        createdDate: new Date("2026-01-25"),
        status: "active",
        createdAt: new Date("2026-01-25"),
        updatedAt: new Date("2026-01-25"),
      },
      {
        farmerAccountID: 4,
        farmerID: 4,
        primaryCoopID: 4,
        createdDate: new Date("2026-02-01"),
        status: "active",
        createdAt: new Date("2026-02-01"),
        updatedAt: new Date("2026-02-01"),
      },
      {
        farmerAccountID: 5,
        farmerID: 5,
        primaryCoopID: 5,
        createdDate: new Date("2026-02-05"),
        status: "active",
        createdAt: new Date("2026-02-05"),
        updatedAt: new Date("2026-02-05"),
      },
      {
        farmerAccountID: 6,
        farmerID: 6,
        primaryCoopID: 6,
        createdDate: new Date("2026-02-10"),
        status: "active",
        createdAt: new Date("2026-02-10"),
        updatedAt: new Date("2026-02-10"),
      },
      {
        farmerAccountID: 7,
        farmerID: 7,
        primaryCoopID: 7,
        createdDate: new Date("2026-02-12"),
        status: "active",
        createdAt: new Date("2026-02-12"),
        updatedAt: new Date("2026-02-12"),
      },
      {
        farmerAccountID: 8,
        farmerID: 8,
        primaryCoopID: 8,
        createdDate: new Date("2026-02-15"),
        status: "active",
        createdAt: new Date("2026-02-15"),
        updatedAt: new Date("2026-02-15"),
      },
      {
        farmerAccountID: 9,
        farmerID: 9,
        primaryCoopID: 9,
        createdDate: new Date("2026-02-18"),
        status: "active",
        createdAt: new Date("2026-02-18"),
        updatedAt: new Date("2026-02-18"),
      },
      {
        farmerAccountID: 10,
        farmerID: 10,
        primaryCoopID: 10,
        createdDate: new Date("2026-02-20"),
        status: "inactive",
        createdAt: new Date("2026-02-20"),
        updatedAt: new Date("2026-02-20"),
      },
      {
        farmerAccountID: 11,
        farmerID: 11,
        primaryCoopID: 11,
        createdDate: new Date("2026-02-22"),
        status: "active",
        createdAt: new Date("2026-02-22"),
        updatedAt: new Date("2026-02-22"),
      },
      {
        farmerAccountID: 12,
        farmerID: 12,
        primaryCoopID: 12,
        createdDate: new Date("2026-02-25"),
        status: "active",
        createdAt: new Date("2026-02-25"),
        updatedAt: new Date("2026-02-25"),
      },
      {
        farmerAccountID: 13,
        farmerID: 1,
        primaryCoopID: 13,
        createdDate: new Date("2026-02-28"),
        status: "active",
        createdAt: new Date("2026-02-28"),
        updatedAt: new Date("2026-02-28"),
      },
      {
        farmerAccountID: 14,
        farmerID: 2,
        primaryCoopID: 14,
        createdDate: new Date("2026-03-01"),
        status: "active",
        createdAt: new Date("2026-03-01"),
        updatedAt: new Date("2026-03-01"),
      },
      {
        farmerAccountID: 15,
        farmerID: 3,
        primaryCoopID: 15,
        createdDate: new Date("2026-03-05"),
        status: "active",
        createdAt: new Date("2026-03-05"),
        updatedAt: new Date("2026-03-05"),
      },
      {
        farmerAccountID: 16,
        farmerID: 4,
        primaryCoopID: 5,
        createdDate: new Date("2026-03-10"),
        status: "active",
        createdAt: new Date("2026-03-10"),
        updatedAt: new Date("2026-03-10"),
      },
      {
        farmerAccountID: 17,
        farmerID: 6,
        primaryCoopID: 4,
        createdDate: new Date("2026-03-12"),
        status: "active",
        createdAt: new Date("2026-03-12"),
        updatedAt: new Date("2026-03-12"),
      },
      {
        farmerAccountID: 18,
        farmerID: 5,
        primaryCoopID: 1,
        createdDate: new Date("2026-03-15"),
        status: "active",
        createdAt: new Date("2026-03-15"),
        updatedAt: new Date("2026-03-15"),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("FarmerAccounts", null, {});
  },
};
