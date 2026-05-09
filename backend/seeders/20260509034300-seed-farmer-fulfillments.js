'use strict';

/**
 * Seed FarmerFulfillments.
 *
 * Note: sample-table.md row 5 has assignedBy=10 (userID 10 = SMPC Coop Officer).
 * This is valid since the Coop Officer for SMPC (coop 5) is the one assigning
 * the fulfillment for assignment 5 which was assigned to their coop.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('FarmerFulfillments', [
      {
        fulfillmentID: 1,
        assignmentID: 1,
        farmerID: 1,
        assignedBy: 6,
        quantityCommitted: 400,
        status: 'confirmed',
        notes: 'Ready for pickup',
        createdAt: new Date('2024-09-05'),
        updatedAt: new Date('2024-09-05'),
      },
      {
        fulfillmentID: 2,
        assignmentID: 1,
        farmerID: 5,
        assignedBy: 6,
        quantityCommitted: 400,
        status: 'ready',
        notes: 'Bagged and labeled',
        createdAt: new Date('2024-09-06'),
        updatedAt: new Date('2024-09-06'),
      },
      {
        fulfillmentID: 3,
        assignmentID: 2,
        farmerID: 3,
        assignedBy: 8,
        quantityCommitted: 700,
        status: 'assigned',
        notes: 'Awaiting farmer confirmation',
        createdAt: new Date('2024-09-07'),
        updatedAt: new Date('2024-09-07'),
      },
      {
        fulfillmentID: 4,
        assignmentID: 3,
        farmerID: 2,
        assignedBy: 2,
        quantityCommitted: 500,
        status: 'confirmed',
        notes: 'Will deliver Sept 20',
        createdAt: new Date('2024-09-08'),
        updatedAt: new Date('2024-09-08'),
      },
      {
        fulfillmentID: 5,
        assignmentID: 5,
        farmerID: 4,
        assignedBy: 10,
        quantityCommitted: 300,
        status: 'assigned',
        notes: 'Fresh harvest available',
        createdAt: new Date('2024-09-12'),
        updatedAt: new Date('2024-09-12'),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('FarmerFulfillments', null, {});
  },
};
