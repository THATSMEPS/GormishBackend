const supabase = require('../config/supabase');
const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const register = async (req, res) => {
  try {
    const { email, password, name, phone = '' } = req.body;

    // Check if user already exists
    const existingUser = await prisma.customer.findUnique({
      where: { email }
    });

    if (existingUser) {
      return errorResponse(res, 'User already exists with this email', 400);
    }

    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return errorResponse(res, authError.message, 400);
    }

    // Create customer profile
    const user = await prisma.customer.create({
      data: {
        email,
        name,
        phone
      }
    });

    return successResponse(res, {
      user,
      token: authData.session?.access_token
    }, 'Registration successful', 201);
  } catch (error) {
    return errorResponse(res, 'Error during registration', 500, error);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Get user profile
    const user = await prisma.customer.findUnique({
      where: { email }
    });

    if (!user) {
      return errorResponse(res, 'User profile not found', 404);
    }

    return successResponse(res, {
      user,
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at
      }
    }, 'Login successful');
  } catch (error) {
    return errorResponse(res, 'Error during login', 500, error);
  }
};

const logout = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return errorResponse(res, 'Error during logout', 400);
    }

    return successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    return errorResponse(res, 'Error during logout', 500, error);
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return errorResponse(res, 'Not authenticated', 401);
    }

    const user = await prisma.customer.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return errorResponse(res, 'User profile not found', 404);
    }

    return successResponse(res, user, 'User retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Error retrieving user', 500, error);
  }
};

const googleSignIn = async (req, res) => {
  try {
    const { access_token } = req.body;

    // Sign in with Google OAuth token using Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      access_token
    });

    if (authError) {
      return errorResponse(res, authError.message, 400);
    }

    // Check if user exists in our database
    let user = await prisma.customer.findUnique({
      where: { email: authData.user.email }
    });

    // If user doesn't exist, create a new profile
    if (!user) {
      user = await prisma.customer.create({
        data: {
          email: authData.user.email,
          name: authData.user.user_metadata.full_name,
          phone: '',  // Phone can be updated later
        }
      });
    }

    // Create session that will last for 30 days
    const { data: { session }, error: sessionError } = await supabase.auth.setSession({
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token
    });

    if (sessionError) {
      return errorResponse(res, 'Error creating session', 500);
    }

    return successResponse(res, {
      user,
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at
      }
    }, 'Google sign-in successful');
  } catch (error) {
    return errorResponse(res, 'Error during Google sign-in', 500, error);
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    const { data: { session }, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error) {
      return errorResponse(res, 'Invalid refresh token', 401);
    }

    return successResponse(res, {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at
    }, 'Token refreshed successfully');
  } catch (error) {
    return errorResponse(res, 'Error refreshing token', 500, error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  googleSignIn,
  refreshToken
};
