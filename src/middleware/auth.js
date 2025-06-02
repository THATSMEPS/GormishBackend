const supabase = require('../config/supabase');
const { errorResponse } = require('../utils/responseHandler');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return errorResponse(res, 'No authorization token provided', 401);
    }

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
  authenticateToken
};
