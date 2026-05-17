FROM node:20-alpine

WORKDIR /app

# Install dependencies (including devDependencies for sequelize-cli)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Create uploads directory
RUN mkdir -p uploads/products uploads/avatars

EXPOSE 8800

# Wait for DB, run migrations + seeders, then start
CMD ["sh", "-c", "\
  echo 'Waiting for MySQL...' && \
  until node -e \"const mysql = require('mysql2/promise'); \
    (async () => { \
      const c = await mysql.createConnection({ \
        host: process.env.DB_HOST || 'db', \
        user: process.env.DB_USER || 'root', \
        password: process.env.DB_PASSWORD || 'password' \
      }); \
      await c.end(); \
    })()\" 2>/dev/null; do \
    sleep 2; \
  done && \
  echo 'MySQL is ready.' && \
  npx sequelize-cli db:migrate --env docker && \
  npx sequelize-cli db:seed:all --env docker 2>&1 || true && \
  node index.js"]
