const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

exports.authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  console.log('Auth middleware - Token present:', !!token);
  console.log('Auth middleware - JWT_SECRET:', JWT_SECRET ? 'Set' : 'Not set');
  
  if (!token) {
    console.log('Auth middleware - No token provided');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Auth middleware - Token decoded successfully:', { userId: decoded.userId || decoded.id, role: decoded.role });
    req.user = decoded; // decoded = { id: ..., role: ..., iat: ..., exp: ... }
    next();
  } catch (err) {
    console.log('Auth middleware - Token verification failed:', err.message);
    console.log('Auth middleware - Token expiration:', err.name === 'TokenExpiredError' ? 'Yes' : 'No');
    res.status(401).json({ message: 'Invalid token' });
  }
};
