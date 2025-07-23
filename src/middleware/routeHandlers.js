// Health check endpoint
const healthCheck = (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
};

// 404 handler
const notFoundHandler = (req, res) => {
    res.status(404).json({
        status: 'failed',
        message: 'Route not found mate :/'
    });
};

// Global error handler
const globalErrorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            status: 'failed',
            message: 'Validation error',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'failed',
            message: 'Invalid token'
        });
    }

    // Default error
    res.status(err.status || 500).json({
        status: 'failed',
        message: err.message || 'Internal server error'
    });
};

module.exports = { 
    healthCheck, 
    notFoundHandler, 
    globalErrorHandler 
};