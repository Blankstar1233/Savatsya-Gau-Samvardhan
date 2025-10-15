import jwt from 'jsonwebtoken';

export function authenticateJWT(req, res, next) {
  console.log('=== JWT AUTHENTICATION DEBUG ===');
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader ? `${authHeader.substring(0, 20)}...` : 'Missing');
  
  if (!authHeader) {
    console.log('No authorization header provided');
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  console.log('Extracted token:', token ? `${token.substring(0, 20)}...` : 'No token');
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('JWT verification error:', err.name, err.message);
      return res.status(403).json({ error: 'Invalid token', details: err.message });
    }
    console.log('JWT verification successful, user:', user);
    req.user = user;
    next();
  });
}

export function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) return res.sendStatus(403);
  next();
}
