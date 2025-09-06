const { handleError } = require("../utils/common_utils");

const isAdmin = (req, res, next) => {
    if (!req.user) {
        return handleError(res, "Authentication required", 401);
    }

    if (!req.user.isAdmin) {
        return handleError(res, "Access denied. Admin privileges required", 403);
    }
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied' });
    }
};

module.exports = isAdmin