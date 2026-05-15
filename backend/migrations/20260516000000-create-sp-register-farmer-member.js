"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop procedure if it exists
    await queryInterface.sequelize.query(
      `DROP PROCEDURE IF EXISTS sp_register_farmer_member`,
    );

    // Create the stored procedure
    await queryInterface.sequelize.query(`
      CREATE PROCEDURE sp_register_farmer_member (
        IN v_roleID INT,
        IN v_email VARCHAR(255),
        IN v_password_hash VARCHAR(255),
        IN v_firstName VARCHAR(100),
        IN v_middleName VARCHAR(100),
        IN v_lastName VARCHAR(100),
        IN v_suffixName VARCHAR(50),
        IN v_farmName VARCHAR(255),
        IN v_municipality VARCHAR(40),
        IN v_barangay VARCHAR(40),
        IN v_primaryCoopID INT
      )
      BEGIN
        DECLARE v_userID INT;
        DECLARE v_farmerID INT;

        DECLARE EXIT HANDLER FOR SQLEXCEPTION 
        BEGIN
          ROLLBACK;
          RESIGNAL;
        END;

        START TRANSACTION;

        INSERT INTO Users (
          roleID, 
          email, 
          password_hash, 
          isDeleted, 
          createdAt, 
          updatedAt
        ) VALUES (
          v_roleID, 
          v_email, 
          v_password_hash, 
          0,
          NOW(), 
          NOW()
        );

        SET v_userID = LAST_INSERT_ID();

        INSERT INTO Farmers ( 
          userID, 
          firstName, 
          middleName, 
          lastName, 
          suffixName, 
          farmName, 
          municipality,
          barangay,
          isDeleted, 
          createdAt, 
          updatedAt
        ) VALUES (
          v_userID, 
          v_firstName, 
          v_middleName, 
          v_lastName, 
          v_suffixName, 
          v_farmName, 
          v_municipality,
          v_barangay,
          0, 
          NOW(), 
          NOW()
        );

        SET v_farmerID = LAST_INSERT_ID();

        INSERT INTO FarmerCooperatives ( 
          farmerID, 
          primaryCoopID, 
          joinedDate, 
          status, 
          createdAt, 
          updatedAt
        ) VALUES (
          v_farmerID, 
          v_primaryCoopID, 
          NOW(), 
          'active', 
          NOW(), 
          NOW()
        );

        INSERT INTO FarmerAccounts (
          farmerID, 
          accountStatus, 
          createdAt, 
          updatedAt
        ) VALUES (
          v_farmerID, 
          'Pending', 
          NOW(), 
          NOW()
        );

        COMMIT;
      END
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `DROP PROCEDURE IF EXISTS sp_register_farmer_member`,
    );
  },
};
