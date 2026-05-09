# Sequelize CLI Seeder Generate Commands

Notes:

- Run these in order because of foreign key dependencies.
- These commands only create empty seed files; you will fill them with sample data.

```bash
npx sequelize-cli seed:generate --name seed-roles
npx sequelize-cli seed:generate --name seed-users
npx sequelize-cli seed:generate --name seed-primary-cooperatives
npx sequelize-cli seed:generate --name seed-farmers
npx sequelize-cli seed:generate --name seed-crop-types
npx sequelize-cli seed:generate --name seed-products
npx sequelize-cli seed:generate --name seed-farmer-cooperatives
npx sequelize-cli seed:generate --name seed-farmer-accounts
npx sequelize-cli seed:generate --name seed-buyer-orders
npx sequelize-cli seed:generate --name seed-coop-assignments
npx sequelize-cli seed:generate --name seed-farmer-fulfillments
npx sequelize-cli seed:generate --name seed-delivery-records
npx sequelize-cli seed:generate --name seed-sales-records
npx sequelize-cli seed:generate --name seed-fee-records
npx sequelize-cli seed:generate --name seed-loan-records
npx sequelize-cli seed:generate --name seed-printed-statements
```
