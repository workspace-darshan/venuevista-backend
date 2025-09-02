const isProvider = (req, res, next) => {
    if (req.user && req.user.userType === 'provider') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied' });
    }
};

module.exports = isProvider