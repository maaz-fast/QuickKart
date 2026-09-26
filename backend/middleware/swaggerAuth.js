const basicAuth = require('express-basic-auth');

/**
 * Basic Authentication Middleware for Swagger API Docs
 */
const swaggerUser = process.env.SWAGGER_USER || 'admin';
const swaggerPassword = process.env.SWAGGER_PASSWORD || 'quickkart2026';

const swaggerAuth = basicAuth({
  users: {
    [swaggerUser]: swaggerPassword,
  },
  challenge: true,
  realm: 'QuickKart API Documentation',
  unauthorizedResponse: (req) => 'Access Denied: QuickKart API Documentation requires authentication.',
});

module.exports = swaggerAuth;
