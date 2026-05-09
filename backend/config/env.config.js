import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const {
  PORT, NODE_ENV, SERVER_URL, DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, JWT_SECRET, JWT_EXPIRES_IN
} = process.env;