var express = require("express");
const routes = express.Router();

const providers = require("./providers");
routes.use('/providers', providers.route);

const users = require("./users");
routes.use('/users', users.route);

module.exports = routes;