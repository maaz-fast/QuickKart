/**
 * Basic Authentication Middleware for Swagger API Docs
 */
const swaggerAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="QuickKart API Documentation"');
    return res.status(401).send('Authentication required to access API documentation.');
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
  const [username, password] = credentials.split(':');

  const expectedUser = process.env.SWAGGER_USER || 'admin';
  const expectedPass = process.env.SWAGGER_PASSWORD || 'quickkart2026';

  if (username === expectedUser && password === expectedPass) {
    return next();
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="QuickKart API Documentation"');
  return res.status(401).send('Invalid credentials. Access denied.');
};

module.exports = swaggerAuth;
