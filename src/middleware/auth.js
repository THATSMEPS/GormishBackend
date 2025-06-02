const supabase = require('../config/supabase');
const { errorResponse } = require('../utils/responseHandler');

// Dummy token configuration for development testing
const DUMMY_TOKEN = 'dummy-test-token-123';
const isDevelopment = process.env.NODE_ENV === 'development';

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return errorResponse(res, 'No authorization token provided', 401);
    }

    // Check for dummy token in development mode
    if (isDevelopment && authHeader === `Bearer ${DUMMY_TOKEN}`) {
      console.log('Using dummy token authentication');
      req.user = {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'user',
        aud: 'authenticated'
      };
      return next();
    }

    // Original authentication logic
    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      return errorResponse(res, 'Invalid or expired token', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 'Authentication error', 500, error);
  }
};

module.exports = {
  authenticateToken,
  // Export dummy token for testing purposes
  DUMMY_TOKEN
};
