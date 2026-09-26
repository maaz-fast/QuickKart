const SystemSetting = require('../models/SystemSetting');

/**
 * Dynamic Vercel-compatible Password Protection for Swagger API Docs
 */
async function getSwaggerPassword() {
  try {
    const setting = await SystemSetting.findOne({ key: 'swagger_password' });
    if (setting && setting.value) {
      return setting.value;
    }
  } catch (err) {
    // Database fallback
  }
  return process.env.SWAGGER_PASSWORD || 'quickkart2026';
}

function parseCookies(request) {
  const list = {};
  const rc = request.headers.cookie;

  if (rc) {
    rc.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      list[parts.shift().trim()] = decodeURIComponent(parts.join('='));
    });
  }

  return list;
}

const swaggerAuth = async (req, res, next) => {
  const currentPassword = await getSwaggerPassword();

  // Allow static assets / logged-in sessions
  const cookies = parseCookies(req);
  const authCookie = cookies['quickkart_swagger_auth'];

  // Check query parameter (e.g. /api-docs?pass=quickkart2026)
  if (req.query.pass === currentPassword || req.query.key === currentPassword) {
    res.setHeader('Set-Cookie', `quickkart_swagger_auth=${currentPassword}; Path=/; HttpOnly; Max-Age=86400`);
    return next();
  }

  // Check valid cookie
  if (authCookie === currentPassword) {
    return next();
  }

  // Handle HTML Form Submit
  if (req.method === 'POST' && req.body && req.body.swagger_password) {
    if (req.body.swagger_password === currentPassword) {
      res.setHeader('Set-Cookie', `quickkart_swagger_auth=${currentPassword}; Path=/; HttpOnly; Max-Age=86400`);
      return res.redirect('/api-docs/');
    } else {
      return res.status(200).send(renderLoginPage('Invalid Password! Please try again.'));
    }
  }

  // Render Login Page
  return res.status(200).send(renderLoginPage());
};

function renderLoginPage(errorMsg = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QuickKart API Documentation - Protected</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    body { background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; width: 100%; max-width: 420px; padding: 2.5rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
    .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(99, 102, 241, 0.1); color: #818cf8; padding: 6px 12px; border-radius: 9999px; font-size: 0.825rem; font-weight: 600; margin-bottom: 1.5rem; border: 1px solid rgba(99, 102, 241, 0.2); }
    h1 { font-size: 1.5rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
    p { font-size: 0.875rem; color: #94a3b8; margin-bottom: 1.75rem; line-height: 1.5; }
    .error { background: rgba(239, 68, 68, 0.15); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 500; margin-bottom: 1.25rem; }
    .form-group { margin-bottom: 1.5rem; }
    label { display: block; font-size: 0.825rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; }
    input[type="password"] { width: 100%; background: #0f172a; border: 1px solid #475569; border-radius: 8px; padding: 0.85rem 1rem; color: #ffffff; font-size: 1rem; outline: none; transition: border-color 0.2s; }
    input[type="password"]:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2); }
    button { width: 100%; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff; border: none; border-radius: 8px; padding: 0.9rem; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s, transform 0.1s; }
    button:hover { opacity: 0.95; }
    button:active { transform: scale(0.99); }
    .footer { text-align: center; margin-top: 1.5rem; font-size: 0.775rem; color: #64748b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">🔒 Protected Endpoint</div>
    <h1>QuickKart API Docs</h1>
    <p>Please enter the access password to view the interactive API documentation.</p>

    ${errorMsg ? `<div class="error">${errorMsg}</div>` : ''}

    <form method="POST" action="/api-docs/">
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="swagger_password" placeholder="Enter password..." required autofocus />
      </div>
      <button type="submit">Unlock Documentation</button>
    </form>

    <div class="footer">QuickKart API v1.0 • Protected Access</div>
  </div>
</body>
</html>`;
}

module.exports = swaggerAuth;
