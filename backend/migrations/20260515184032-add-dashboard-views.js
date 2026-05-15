"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Create vw_admin_dashboard_stats
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE VIEW vw_admin_dashboard_stats AS
        SELECT
          (SELECT COUNT(*) FROM PrimaryCooperatives WHERE isDeleted=0) AS totalCooperatives,
          (SELECT COUNT(*) FROM Farmers WHERE isDeleted=0) AS totalFarmers,
          (SELECT COUNT(*) FROM BuyerOrders WHERE status='pending') AS pendingOrders,
          (SELECT COALESCE(SUM(totalTransactionAmount), 0) FROM DeliveryRecords WHERE status='delivered') AS totalSalesVolume;
      `, { transaction });

      // Create vw_coop_dashboard_stats
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE VIEW vw_coop_dashboard_stats AS
        SELECT 
          pc.primaryCoopID,
          pc.coopName,
          (SELECT COUNT(*) FROM FarmerCooperatives fc WHERE fc.primaryCoopID = pc.primaryCoopID AND fc.status='active') AS activeFarmers,
          (SELECT COUNT(*) FROM CoopAssignments ca WHERE ca.primaryCoopID = pc.primaryCoopID AND ca.status='pending') AS pendingAssignments,
          (SELECT COALESCE(SUM(lr.outstandingBalance), 0) FROM LoanRecords lr JOIN FarmerAccounts fa ON lr.farmerAccountID = fa.farmerAccountID WHERE fa.primaryCoopID = pc.primaryCoopID AND lr.status IN ('active', 'partial', 'overdue')) AS totalLoansOut,
          (SELECT COALESCE(SUM(sr.grossAmount), 0) FROM SalesRecords sr JOIN FarmerAccounts fa ON sr.farmerAccountID = fa.farmerAccountID WHERE fa.primaryCoopID = pc.primaryCoopID) AS totalCoopSales
        FROM PrimaryCooperatives pc
        WHERE pc.isDeleted=0;
      `, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(`DROP VIEW IF EXISTS vw_coop_dashboard_stats;`, { transaction });
      await queryInterface.sequelize.query(`DROP VIEW IF EXISTS vw_admin_dashboard_stats;`, { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
