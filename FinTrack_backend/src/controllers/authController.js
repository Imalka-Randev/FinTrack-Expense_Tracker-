const authService = require('../services/authService');
const { generateToken } = require('../utils/jwt');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if secret is configured
    if (!process.env.JWT_SECRET) {
      const error = new Error('Server configuration error: JWT_SECRET missing');
      error.statusCode = 500;
      throw error;
    }

    const user = await authService.registerUser({ 
      name: name.trim(), 
      email: email.trim().toLowerCase(), 
      password 
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      return next(new Error('Email already exists'));
    }
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!process.env.JWT_SECRET) {
      const error = new Error('Server configuration error: JWT_SECRET missing');
      error.statusCode = 500;
      throw error;
    }

    const user = await authService.loginUser(email.trim().toLowerCase(), password);
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.id);

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
