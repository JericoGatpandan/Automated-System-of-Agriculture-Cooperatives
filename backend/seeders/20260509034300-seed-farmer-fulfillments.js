'use strict';

/**
 * Seed FarmerFulfillments.
 *
 * Flow:
 * Order 1 (2000 units): Asmt 1 (800), Asmt 2 (700), Asmt 3 (500)
 * Order 2 (1000 units): Asmt 4 (1000)
 * Order 3 (300 units): Asmt 5 (300)
 * Order 4 (500 units): Asmt 6 (500)
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('FarmerFulfillments', [
      // Order 1 (2000 units)
      {
        fulfillmentID: 1,
        assignmentID: 1,
        farmerID: 1,
        assignedBy: 2, // CMPC Officer
        quantityCommitted: 400,
        status: 'confirmed',
        notes: 'Ready for pickup',
        createdAt: new Date('2026-05-03'),
        updatedAt: new Date('2026-05-03'),
      },
      {
        fulfillmentID: 2,
        assignmentID: 1,
        farmerID: 5,
        assignedBy: 2, // CMPC Officer
        quantityCommitted: 400,
        status: 'ready',
        notes: 'Bagged and labeled',
        createdAt: new Date('2026-05-04'),
        updatedAt: new Date('2026-05-04'),
      },
      {
        fulfillmentID: 3,
        assignmentID: 2,
        farmerID: 6,
        assignedBy: 5, // LARFBCO Officer
        quantityCommitted: 700,
        status: 'confirmed',
        notes: 'Ready for Order 1',
        createdAt: new Date('2026-05-05'),
        updatedAt: new Date('2026-05-05'),
      },
      {
        fulfillmentID: 4,
        assignmentID: 3,
        farmerID: 2,
        assignedBy: 3, // MMPC Officer
        quantityCommitted: 500,
        status: 'confirmed',
        notes: 'Ready for Order 1',
        createdAt: new Date('2026-05-06'),
        updatedAt: new Date('2026-05-06'),
      },
      // Order 2 (1000 units)
      {
        fulfillmentID: 5,
        assignmentID: 4,
        farmerID: 2,
        assignedBy: 3, // MMPC Officer
        quantityCommitted: 1000,
        status: 'confirmed',
        notes: 'For PhilRice',
        createdAt: new Date('2026-05-08'),
        updatedAt: new Date('2026-05-08'),
      },
      // Order 3 (300 units)
      {
        fulfillmentID: 6,
        assignmentID: 5,
        farmerID: 4,
        assignedBy: 6, // SMPC Officer
        quantityCommitted: 300,
        status: 'assigned',
        notes: 'Fresh harvest available',
        createdAt: new Date('2026-05-12'),
        updatedAt: new Date('2026-05-12'),
      },
      // Order 4 (500 units)
      {
        fulfillmentID: 7,
        assignmentID: 6,
        farmerID: 4,
        assignedBy: 5, // LARFBCO Officer
        quantityCommitted: 500,
        status: 'confirmed',
        notes: 'Corn ready',
        createdAt: new Date('2026-05-08'),
        updatedAt: new Date('2026-05-08'),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('FarmerFulfillments', null, {});
  },
};
