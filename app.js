require("dotenv").config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
const helmet = require("helmet");
var cors = require('cors')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const connectDB = require("./config/db");

const apiRoutes = require("./routes");

var app = express();

// Middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors({
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/uploads', (req, res, next) => {
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    // res.header('Access-Control-Allow-Origin', WEBSITE_URL);
    // res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

// MongoDB & Socket
connectDB();

// Routes
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
    res.send("Express API running");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server running on port ${PORT}`));

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;