// middleware/roleCheck.js
const ROLES = require('../models/RoleEnum');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    const hasRequiredRole = roles.some(role => req.user.roles.includes(role));
    
    if (!hasRequiredRole) {
      return res.status(403).json({ 
        message: `User role ${req.user.roles} is not authorized to access this route` 
      });
    }

    next();
  };
};

module.exports = { authorize };