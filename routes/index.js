var express = require("express");
const routes = express.Router();

const providers = require("./providers");
routes.use('/providers', providers.route);

module.exports = routes;