const handleSuccess = (res, data, message = "Request was successful.", statusCode = 200) => {
    return res.status(statusCode).json({
        meta: {
            success: true,
            message,
        },
        result: data,
    });
};

const handleError = (res, message = "internal Server Error", statusCode = 500, errors = null) => {
    return res.status(statusCode).json({
        meta: {
            success: false,
            message,
            errors,
        },
    });
};

module.exports = {
    handleSuccess,
    handleError,
};