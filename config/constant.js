require("dotenv").config();

exports.dbConfig = {
    url: process.env.MONGODB_URI_LOCAL,
    dbName: process.env.LOCAL_DB,
};

exports.secretKey = process.env.JWT_SECRET

// exports.MAIN_URL = process.env.FRONTEND_URL_LOCAL;
exports.WEBSITE_URL = process.env.WEBSITE_URL_LOCAL;
