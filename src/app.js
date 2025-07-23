const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

// Database connection
require("./db/mongoose");

// Initialize app
const app = express();
const port = process.env.PORT || 9040;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

app.use(require('./routes/index.routes'));

// Start server
app.listen(port, () => {
    console.log(`SALAH server is running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
});

module.exports = app;