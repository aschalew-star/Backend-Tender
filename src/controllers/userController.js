const prisma = require('../config/db.js');
const jwt = require('jsonwebtoken');
const { UserRole } = require('@prisma/client');
const asynerror = require('../utili/asyncerror.js');
const bcrypt = require('bcryptjs');
const handleError = require('../utili/errorhandle.js');

const createUser = asynerror(async (req, res, next) => {
  const {
    email,
    firstName,
    lastName,
    password,
    phoneNo,
    role: reqRole,
  } = req.body;

  const role = reqRole || UserRole.CUSTOMER; // Default to CUSTOMER if not provided

  if (!email || !firstName || !lastName || !password) {
    return next(new handleError("Email, first name, last name, and password are required", 400));
  }

  if (role && !Object.values(UserRole).includes(role)) {
    return next(new handleError(`Invalid role. Allowed roles are: ${Object.values(UserRole).join(", ")}`, 400));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  if (role === UserRole.CUSTOMER) {
    const existingCustomer = await prisma.customer.findUnique({ where: { email } });
    if (existingCustomer) {
      return next(new handleError("Customer with this email already exists", 400));
    }

    const customer = await prisma.customer.create({
      data: { email, firstName, lastName, password: hashedPassword, phone: phoneNo, role },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    const token = jwt.sign({ id: customer.id, role: customer.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true }).json(customer);
  } else {
    const existingUser = await prisma.systemUser.findUnique({ where: { email } });
    if (existingUser) {
      return next(new handleError("System user with this email already exists", 400));
    }

    const systemUser = await prisma.systemUser.create({
      data: { email, firstName, lastName, password: hashedPassword, phoneNo, role },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    const token = jwt.sign({ id: systemUser.id, role: systemUser.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true }).json(systemUser);
  }
});

const loginUser = asynerror(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new handleError("Email and password are required", 400));
  }

  const customer = await prisma.customer.findUnique({ where: { email } });
  if (customer) {
    const isMatch = await bcrypt.compare(password, customer.password);
    if (isMatch) {
      const token = jwt.sign({ id: customer.id, role: customer.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
      res.cookie("token", token, { httpOnly: true }).json(customer);
    } else {
      return next(new handleError("Invalid password", 401));
    }
  } else {
    const systemUser = await prisma.systemUser.findUnique({ where: { email } });
    if (systemUser) {
      const isMatch = await bcrypt.compare(password, systemUser.password);
      if (isMatch) {
        const token = jwt.sign({ id: systemUser.id, role: systemUser.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.cookie("token", token, { httpOnly: true }).json(systemUser);
      } else {
        return next(new handleError("Invalid password", 401));
      }
    } else {
      return next(new handleError("User not found", 404));
    }
  }
});

const getAllCustomerUsers = asynerror(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const search = req.query.search ? String(req.query.search).trim() : '';
  const subscription = req.query.subscription;

  if (page < 1 || limit < 1) {
    return next(new handleError("Page and limit must be positive numbers", 400));
  }

  const skip = (page - 1) * limit;

  const where = {
    AND: [
      search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      subscription === 'subscribed'
        ? { isSubscribed: true }
        : subscription === 'free'
        ? { isSubscribed: false }
        : {},
    ],
  };

  try {
    const [customers, total, totalCustomers, totalSubscribed, totalFree, totalPayments] = await Promise.all([
      prisma.customer.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          isSubscribed: true,
          endDate: true,
          createdAt: true,
        },
        skip,
        take: limit,
      }),
      prisma.customer.count({ where }),
      prisma.customer.count(),
      prisma.customer.count({ where: { isSubscribed: true } }),
      prisma.customer.count({ where: { isSubscribed: false } }),
      prisma.payment.count(),
    ]);

    const formattedCustomers = customers.map((customer) => ({
      ...customer,
      endDate: customer.endDate ? customer.endDate.toISOString().split('T')[0] : null,
      createdAt: customer.createdAt.toISOString().split('T')[0],
    }));

    res.json({
      customers: formattedCustomers,
      total,
      stats: {
        totalCustomers,
        totalSubscribed,
        totalFree,
        totalPayments,
      },
    });
  } catch (error) {
    return next(new handleError("Error fetching customers", 500));
  }
});

// Get all customers for PaymentForm
const getCustomersForPaymentForm = asynerror(async (req, res, next) => {
  const search = req.query.search ? String(req.query.search).trim() : '';
  const subscription = req.query.subscription;

  const where = {
    AND: [
      search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      subscription === 'subscribed'
        ? { isSubscribed: true }
        : subscription === 'free'
        ? { isSubscribed: false }
        : {},
    ],
  };

  try {
    const customers = await prisma.customer.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    const formattedCustomers = (customers || []).map((customer) => ({
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
    }));

    res.json(formattedCustomers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return next(new handleError('Error fetching customers', 500));
  }
});

// get customer by email
 const getCustomerByEmail = asynerror(async (req, res, next) => {
  const email = req.query.email ? String(req.query.email).trim() : '';

  try {
    // Find customer by exact email match
    const customer = await prisma.customer.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isSubscribed: true,
        endDate: true,
        createdAt: true,
      },
    });

    // Calculate stats
    const [totalCustomers, totalSubscribed, totalPayments] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({
        where: { isSubscribed: true },
      }),
      prisma.customer.count({
        where: { endDate: { not: null } },
      }),
    ]);

    const stats = {
      totalCustomers,
      totalSubscribed,
      totalFree: totalCustomers - totalSubscribed,
      totalPayments,
    };

    res.json({
      customer,
      total: customer ? 1 : 0,
      stats,
    });
  } catch (error) {
    console.error('Error searching customer:', error);
    return next(new handleError('Server error while searching customer', 500));
  }
});



// const getUserById = asynerror(async (req, res, next) => {
//   const { id } = req.params;
//   const userRole = req.user.role;
//   if (!id) {
//     return next(new handleError('User ID is required', 400));
//   }
//   if (isNaN(id)) {
//     return next(new handleError('Invalid User ID', 400));
//   }

//   if (userRole === UserRole.CUSTOMER) {
//     const customer = await prisma.customer.findUnique({
//       where: { id: parseInt(id) },
//       select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true, updatedAt: true },
//     });
//     if (!customer) {
//       return next(new handleError('Customer not found', 404));
//     }
//     return res.json(customer);
//   } else {
//     const systemUser = await prisma.systemUser.findUnique({
//       where: { id: parseInt(id) },
//       select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true, updatedAt: true },
//     });
//     if (!systemUser) {
//       return next(new handleError('System user not found', 404));
//     }
//     return res.json(systemUser);
//   }
// });
const getSystemUsers = asynerror(async (req, res, next) => {
  const { page = 1, limit = 15, search, role } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {};
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (role && role !== 'all') {
    if (!Object.values(UserRole).includes(role)) {
      return next(new handleError(`Invalid role. Allowed roles are: ${Object.values(UserRole).join(', ')}`, 400));
    }
    where.role = role;
  }

  try {
    let users, total, totalUsers, totalSuperusers, totalAdmins, totalDataEntry;
    if (!limit || limit === '0') {
      [users, totalUsers, totalSuperusers, totalAdmins, totalDataEntry] = await Promise.all([
        prisma.systemUser.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                tendersPosted: true,
                tendersApproved: true,
                paymentsApproved: true,
              },
            },
          },
        }),
        prisma.systemUser.count(),
        prisma.systemUser.count({ where: { role: 'SUPERUSER' } }),
        prisma.systemUser.count({ where: { role: 'ADMIN' } }),
        prisma.systemUser.count({ where: { role: 'DATAENTRY' } }),
      ]);
      total = users.length;
    } else {
      [users, total, totalUsers, totalSuperusers, totalAdmins, totalDataEntry] = await Promise.all([
        prisma.systemUser.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                tendersPosted: true,
                tendersApproved: true,
                paymentsApproved: true,
              },
            },
          },
        }),
        prisma.systemUser.count({ where }),
        prisma.systemUser.count(),
        prisma.systemUser.count({ where: { role: 'SUPERUSER' } }),
        prisma.systemUser.count({ where: { role: 'ADMIN' } }),
        prisma.systemUser.count({ where: { role: 'DATAENTRY' } }),
      ]);
    }

    const formattedUsers = users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNo: user.phoneNo,
      role: user.role,
      createdAt: user.createdAt.toISOString().split('T')[0],
      tendersPosted: user._count.tendersPosted,
      tendersApproved: user._count.tendersApproved,
      paymentsApproved: user._count.paymentsApproved,
    }));

    res.status(200).json({
      users: formattedUsers,
      total,
      stats: {
        totalUsers,
        totalSuperusers,
        totalAdmins,
        totalDataEntry,
      },
    });
  } catch (error) {
    console.error('Error fetching system users:', error);
    return next(new handleError('Error fetching system users', 500));
  }
});


const updateSystemUser = asynerror(async (req, res, next) => {
  const { id } = req.params;
  const { firstName, lastName, email, phoneNo, role, password } = req.body;

  if (!id || isNaN(id)) {
    return next(new handleError('Valid User ID is required', 400));
  }

  if (role && !Object.values(UserRole).includes(role)) {
    return next(new handleError(`Invalid role. Allowed roles are: ${Object.values(UserRole).join(', ')}`, 400));
  }

  const existingUser = await prisma.systemUser.findUnique({ where: { id: parseInt(id) } });
  if (!existingUser) {
    return next(new handleError('System user not found', 404));
  }

  const data = {
    firstName: firstName || existingUser.firstName,
    lastName: lastName || existingUser.lastName,
    email: email || existingUser.email,
    phoneNo: phoneNo || existingUser.phoneNo,
    role: role || existingUser.role,
  };

  if (password) {
    data.password = await bcrypt.hash(password, 10);
  }

  const updatedSystemUser = await prisma.systemUser.update({
    where: { id: parseInt(id) },
    data,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phoneNo: true,
      role: true,
      createdAt: true,
    },
  });

  res.json({
    ...updatedSystemUser,
    createdAt: updatedSystemUser.createdAt.toISOString().split('T')[0],
  });
});

const deleteSystemUser = asynerror(async (req, res, next) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return next(new handleError('Valid User ID is required', 400));
  }

  const existingUser = await prisma.systemUser.findUnique({ where: { id: parseInt(id) } });
  if (!existingUser) {
    return next(new handleError('System user not found', 404));
  }

  await prisma.systemUser.delete({ where: { id: parseInt(id) } });
  res.json({ message: 'System user deleted successfully' });
});

// const updateUser = asynerror(async (req, res, next) => {
//   const { id } = req.params;
//   const { email, firstName, lastName, phoneNo, role } = req.body;

//   if (!id || isNaN(id)) {
//     return next(new handleError('Valid User ID is required', 400));
//   }

//   if (role && !Object.values(UserRole).includes(role)) {
//     return next(new handleError(`Invalid role. Allowed roles are: ${Object.values(UserRole).join(', ')}`, 400));
//   }

//   if (role === UserRole.CUSTOMER) {
//     const existingCustomer = await prisma.customer.findUnique({ where: { id: parseInt(id) } });
//     if (!existingCustomer) {
//       return next(new handleError('Customer not found', 404));
//     }

//     const updatedCustomer = await prisma.customer.update({
//       where: { id: parseInt(id) },
//       data: { email, firstName, lastName, phone: phoneNo, role },
//       select: { id: true, email: true, firstName: true, lastName: true, role: true },
//     });
//     res.json(updatedCustomer);
//   } else {
//     const existingUser = await prisma.systemUser.findUnique({ where: { id: parseInt(id) } });
//     if (!existingUser) {
//       return next(new handleError('System user not found', 404));
//     }
//     const updatedSystemUser = await prisma.systemUser.update({
//       where: { id: parseInt(id) },
//       data: { email, firstName, lastName, phoneNo, role },
//       select: { id: true, email: true, firstName: true, lastName: true, role: true },
//     });
//     res.json(updatedSystemUser);
//   }
// });

// const deleteUser = asynerror(async (req, res, next) => {
//   const { id } = req.params;
//   const userRole = req.user.role;

//   if (!id || isNaN(id)) {
//     return next(new handleError('Valid User ID is required', 400));
//   }

//   if (userRole === UserRole.CUSTOMER) {
//     const existingCustomer = await prisma.customer.findUnique({ where: { id: parseInt(id) } });
//     if (!existingCustomer) {
//       return next(new handleError('Customer not found', 404));
//     }
//     await prisma.customer.delete({ where: { id: parseInt(id) } });
//     return res.json({ message: 'Customer deleted successfully' });
//   } else {
//     const existingUser = await prisma.systemUser.findUnique({ where: { id: parseInt(id) } });
//     if (!existingUser) {
//       return next(new handleError('System user not found', 404));
//     }
//     await prisma.systemUser.delete({ where: { id: parseInt(id) } });
//     return res.json({ message: 'System user deleted successfully' });
//   }
// });

// const forgetPassword = asynerror(async (req, res, next) => {
//   const { email } = req.body;
//   if (!email) {
//     return next(new handleError('Email is required', 400));
//   }
//   const existingUser = await prisma.systemUser.findUnique({ where: { email } });
//   if (existingUser) {
//     const token = jwt.sign({ id: existingUser.id, role: existingUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     return res.cookie('token', token, { httpOnly: true }).json(existingUser);
//   }
//   const existingCustomer = await prisma.customer.findUnique({ where: { email } });
//   if (!existingCustomer) {
//     return next(new handleError('User not found', 404));
//   }
//   const token = jwt.sign({ id: existingCustomer.id, role: existingCustomer.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
//   return res.cookie('token', token, { httpOnly: true }).json(existingCustomer);
// });

// const changePassword = asynerror(async (req, res, next) => {
//   const { oldPassword, newPassword } = req.body;
//   const userId = req.user.id;

//   if (!oldPassword || !newPassword) {
//     return next(new handleError('Old and new passwords are required', 400));
//   }

//   const user = await prisma.systemUser.findUnique({ where: { id: userId } });
//   if (user) {
//     const isMatch = await bcrypt.compare(oldPassword, user.password);
//     if (!isMatch) {
//       return next(new handleError('Old password is incorrect', 400));
//     }
//     const hashedNewPassword = await bcrypt.hash(newPassword, 10);
//     await prisma.systemUser.update({ where: { id: userId }, data: { password: hashedNewPassword } });
//     return res.json({ message: 'Password changed successfully' });
//   }
//   const customer = await prisma.customer.findUnique({ where: { id: userId } });
//   if (!customer) {
//     return next(new handleError('User not found', 404));
//   }
//   const isMatch = await bcrypt.compare(oldPassword, customer.password);
//   if (!isMatch) {
//     return next(new handleError('Old password is incorrect', 400));
//   }
//   const hashedNewPassword = await bcrypt.hash(newPassword, 10);
//   await prisma.customer.update({ where: { id: userId }, data: { password: hashedNewPassword } });
//   return res.json({ message: 'Password changed successfully' });
// });

// const logout = asynerror(async (req, res, next) => {
//   res.clearCookie('token').json({ message: 'Logged out successfully' });
// });

// const getAllActiveSubscribedUsers = asynerror(async (req, res, next) => {
//   const activeUsers = await prisma.customer.findMany({
//     where: {
//       isSubscribed: true,
//     },
//     select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true, updatedAt: true },
//   });
//   if (activeUsers.length === 0) {
//     return next(new handleError('No active subscribed users found', 404));
//   }
//   res.status(200).json({
//     activeUsers,
//   });
// });

// const getAllUnsubscribedUsers = asynerror(async (req, res, next) => {
//   const unsubscribedUsers = await prisma.customer.findMany({
//     where: {
//       isSubscribed: false,
//     },
//     select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true, updatedAt: true },
//   });
//   if (unsubscribedUsers.length === 0) {
//     return next(new handleError('No unsubscribed users found', 404));
//   }
//   res.status(200).json({
//     unsubscribedUsers,
//   });
// });

module.exports = {
  createUser,
  loginUser,
  getSystemUsers,
  updateSystemUser,
  deleteSystemUser,
  getAllCustomerUsers,
  getCustomersForPaymentForm,
 getCustomerByEmail
  // getUserById,
  // getAllUsers,
  // updateUser,
  // deleteUser,
  // forgetPassword,
  // changePassword,
  // logout,
  // getAllActiveSubscribedUsers,
  // getAllUnsubscribedUsers,
};