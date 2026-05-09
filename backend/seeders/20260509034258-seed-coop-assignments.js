'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('CoopAssignments', [
      {
        assignmentID: 1,
        orderID: 1,
        primaryCoopID: 3,
        assignedBy: 1,
        assignedDate: new Date('2024-09-02'),
        quantityRequired: 800,
        status: 'matched',
        createdAt: new Date('2024-09-02'),
        updatedAt: new Date('2024-09-02'),
      },
      {
        assignmentID: 2,
        orderID: 1,
        primaryCoopID: 4,
        assignedBy: 1,
        assignedDate: new Date('2024-09-02'),
        quantityRequired: 700,
        status: 'matched',
        createdAt: new Date('2024-09-02'),
        updatedAt: new Date('2024-09-02'),
      },
      {
        assignmentID: 3,
        orderID: 1,
        primaryCoopID: 1,
        assignedBy: 1,
        assignedDate: new Date('2024-09-02'),
        quantityRequired: 500,
        status: 'ready',
        createdAt: new Date('2024-09-02'),
        updatedAt: new Date('2024-09-02'),
      },
      {
        assignmentID: 4,
        orderID: 2,
        primaryCoopID: 2,
        assignedBy: 1,
        assignedDate: new Date('2024-09-06'),
        quantityRequired: 1000,
        status: 'pending',
        createdAt: new Date('2024-09-06'),
        updatedAt: new Date('2024-09-06'),
      },
      {
        assignmentID: 5,
        orderID: 3,
        primaryCoopID: 5,
        assignedBy: 1,
        assignedDate: new Date('2024-09-11'),
        quantityRequired: 300,
        status: 'pending',
        createdAt: new Date('2024-09-11'),
        updatedAt: new Date('2024-09-11'),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('CoopAssignments', null, {});
  },
};
