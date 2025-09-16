var express = require("express");
const routes = express.Router();

const providers = require("./providers");
routes.use('/providers', providers.route);

const users = require("./users");
routes.use('/users', users.route);

const venues = require("./venue");
routes.use('/venues', venues.route);

module.exports = routes;