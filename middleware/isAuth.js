const jwt = require('jsonwebtoken');
const { handleError } = require('../utils/common_utils');
const UsersModel = require('../routes/users/model');

const isAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return handleError(res, "Access denied. No token provided", 401);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await UsersModel.findById(decoded.userId).select('-password');
      console.log("🚀 ~ isAuth ==>", user)
      if (!user) {
        return handleError(res, "Token invalid. User not found", 401);
      }

      req.user = {
        userId: user._id.toString(),
        email: user.email,
        isAdmin: user.isAdmin,
        firstName: user.firstName,
        lastName: user.lastName
      };

      next();

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return handleError(res, "Token expired", 401);
      }
      if (error.name === 'JsonWebTokenError') {
        return handleError(res, "Invalid token", 401);
      }
      throw error;
    }

  } catch (error) {
    console.error("Auth middleware error:", error);
    return handleError(res, "Authentication failed", 500, error.message);
  }
};

module.exports = isAuth;
