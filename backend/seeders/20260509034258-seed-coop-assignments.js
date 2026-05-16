"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("CoopAssignments", [
      {
        assignmentID: 1,
        orderID: 1,
        primaryCoopID: 1,
        assignedBy: 2,
        assignedDate: new Date("2026-05-02"),
        quantityRequired: 800,
        status: "matched",
        createdAt: new Date("2026-05-02"),
        updatedAt: new Date("2026-05-02"),
      },
      {
        assignmentID: 2,
        orderID: 1,
        primaryCoopID: 4,
        assignedBy: 5,
        assignedDate: new Date("2026-05-02"),
        quantityRequired: 700,
        status: "matched",
        createdAt: new Date("2026-05-02"),
        updatedAt: new Date("2026-05-02"),
      },
      {
        assignmentID: 3,
        orderID: 1,
        primaryCoopID: 2,
        assignedBy: 3,
        assignedDate: new Date("2026-05-02"),
        quantityRequired: 500,
        status: "ready",
        createdAt: new Date("2026-05-02"),
        updatedAt: new Date("2026-05-02"),
      },
      {
        assignmentID: 4,
        orderID: 2,
        primaryCoopID: 2,
        assignedBy: 3,
        assignedDate: new Date("2026-05-04"),
        quantityRequired: 1000,
        status: "assigned",
        createdAt: new Date("2026-05-04"),
        updatedAt: new Date("2026-05-04"),
      },
      {
        assignmentID: 5,
        orderID: 3,
        primaryCoopID: 5,
        assignedBy: 6,
        assignedDate: new Date("2026-05-05"),
        quantityRequired: 300,
        status: "pending",
        createdAt: new Date("2026-05-05"),
        updatedAt: new Date("2026-05-05"),
      },
      {
        assignmentID: 6,
        orderID: 4,
        primaryCoopID: 4,
        assignedBy: 5,
        assignedDate: new Date("2026-05-07"),
        quantityRequired: 500,
        status: "ready",
        createdAt: new Date("2026-05-07"),
        updatedAt: new Date("2026-05-07"),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("CoopAssignments", null, {});
  },
};
