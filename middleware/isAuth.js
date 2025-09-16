const jwt = require("jsonwebtoken");
const { handleError } = require("../utils/common_utils");
const UsersModel = require("../routes/users/model");
const ProvidersModel = require("../routes/providers/model");

const isAuth = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return handleError(res, "Access denied. No token provided", 401);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("🚀 ~ isAuth ~ decoded:", decoded)
      if (decoded.providerId) {
        const provider = await ProvidersModel.findById(
          decoded.providerId
        ).select("email phone isActive isApproved");
        console.log("provider", provider)
        if (!provider) {
          return handleError(res, "Token invalid. Provider not found", 401);
        }
        req.provider = {
          providerId: provider._id.toString(),
          email: provider?.email,
          isAdmin: provider?.isAdmin ?? false,
          firstName: provider?.firstName,
          lastName: provider?.lastName,
        };
      } else {
        const user = await UsersModel.findById(decoded.userId).select(
          "-password"
        );
        if (!user) {
          return handleError(res, "Token invalid. User not found", 401);
        }
        req.user = {
          userId: user._id.toString(),
          email: user?.email,
          isAdmin: user?.isAdmin ?? false,
          firstName: user?.firstName,
          lastName: user?.lastName,
        };
      }

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return handleError(res, "Token expired", 401);
      }
      if (error.name === "JsonWebTokenError") {
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
