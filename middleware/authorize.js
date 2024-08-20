// middleware/authorize.js

const authorize = (roles = []) => {
    return (req, res, next) => {
      const { user } = req;
      
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
  
      next();
    };
  };
  
  module.exports = authorize;
  