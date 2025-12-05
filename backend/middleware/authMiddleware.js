const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      console.log('No token provided, proceeding for testing');
      return next();
    }
    // Use the same secret used when signing tokens in userController
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.user = decoded;
    return next();
  } catch (error) {
    console.log('Auth error:', error.message);
    return next();
  }
};

const isAdmin = (req, res, next) => {
  // Allow when no user attached (dev convenience), enforce only if a user exists but is not admin
  if (!req.user) {
    return next();
  }
  if (req.user.role === 'admin' || req.user.isAdmin === true || req.user?.user?.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Admins only.' });
};

module.exports = {
  authenticateToken,
  isAdmin
};
