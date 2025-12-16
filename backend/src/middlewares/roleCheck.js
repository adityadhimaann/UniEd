import ApiError from '../utils/ApiError.js';
import { PERMISSIONS } from '../config/constants.js';

export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden('You do not have permission to access this resource');
    }

    next();
  };
};

export const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const userRole = req.user.role;
    const userPermissions = PERMISSIONS[userRole] || [];

    // Admin has all permissions
    if (userRole === 'admin' || userPermissions.includes('all:permissions')) {
      return next();
    }

    if (!userPermissions.includes(requiredPermission)) {
      throw ApiError.forbidden(`Permission denied: ${requiredPermission}`);
    }

    next();
  };
};

export const checkResourceOwnership = (resourceField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    const resourceOwnerId = req[resourceField] || req.params[resourceField] || req.body[resourceField];

    if (!resourceOwnerId || resourceOwnerId.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('You can only access your own resources');
    }

    next();
  };
};
