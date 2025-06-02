const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
};
