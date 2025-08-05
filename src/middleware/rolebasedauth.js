const jwt = require('jsonwebtoken');
const prisma = require('../config/db.js');
const { UserRole } = require('@prisma/client');
const handleError = require('../utili/errorhandle.js');

const restrictToRoles = (allowedRoles) => {
  return async (req, res, next) => {
    const method = req.method;
    const path = req.originalUrl || req.url;
    const token = req.cookies?.token;

    if (!token) {
      return next(new handleError('Authentication required. Please log in to access this resource.', 401));
    }

    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let user = null;

      if (decoded.role === UserRole.CUSTOMER) {
        user = await prisma.customer.findUnique({
          where: { id: decoded.id },
          select: { id: true, email: true, role: true },
        });
      } else {
        user = await prisma.systemUser.findUnique({
          where: { id: decoded.id },
          select: { id: true, email: true, role: true },
        });
      }

      if (!user) {
        return next(new handleError('User not found', 401));
      }

      req.user = user;

      if (!allowedRoles.includes(user.role)) {
        await prisma.activityLog.create({
          data: {
            [user.role === UserRole.CUSTOMER ? 'customerId' : 'userId']: user.id,
            method,
            role: user.role,
            entityType: 'ROUTE_ACCESS',
            detail: `Access denied for ${user.role} on ${path}`,
          },
        });

        return next(new handleError(`Access denied for ${user.role} role. This action requires one of these roles: ${allowedRoles.join(', ')}.`, 403));
      }

      await prisma.activityLog.create({
        data: {
          [user.role === UserRole.CUSTOMER ? 'customerId' : 'userId']: user.id,
          method,
          role: user.role,
          entityType: 'ROUTE_ACCESS',
          detail: `Access granted for ${user.role} on ${path}`,
        },
      });

      next();
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return next(new handleError('Token expired. Please log in again.', 403));
      }

      if (err instanceof jwt.JsonWebTokenError) {
        return next(new handleError('Invalid token. Please log in again.', 403));
      }

      console.error('Authentication error:', err);
      return next(new handleError('Internal server error. Please try again later.', 500));
    }
  };
};

module.exports = { restrictToRoles };