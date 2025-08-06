// server/controllers/payment.js
const prisma = require('../config/db.js');
const handleError = require('../utili/errorhandle.js');
const asynerror = require('../utili/asyncerror.js');
const winston = require('winston'); // Assuming winston is used for logging as in original code

/**
 * Create a new payment
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const createPayment = asynerror(async (req, res, next) => {
  try {
    const { customerId, bankId, price, howLong } = req.body;

    const customer = await prisma.customer.findUnique({ where: { id: parseInt(customerId) } });
    if (!customer) {
      return next(new handleError('Customer not found', 404));
    }

    const bank = await prisma.bank.findUnique({ where: { id: parseInt(bankId) } });
    if (!bank) {
      return next(new handleError('Bank not found', 404));
    }

    const payment = await prisma.$transaction(async (tx) => {
      const newPayment = await tx.payment.create({
        data: {
          customerId: parseInt(customerId),
          bankId: parseInt(bankId),
          price: parseFloat(price),
          howLong,
          // approvedById: req.user.role === 'SUPERUSER' || req.user.role === 'ADMIN' ? req.user.id : null,
          // approvedAt: req.user.role === 'SUPERUSER' || req.user.role === 'ADMIN' ? new Date() : null,
        },
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          bank: { select: { id: true, name: true } },
          approvedBy: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      // await tx.activityLog.create({
      //   data: {
      //     method: 'POST',
      //     role: req.user.role,
      //     action: 'CREATE_PAYMENT',
      //     userId: req.user.id,
      //     customerId: parseInt(customerId),
      //     detail: `Created payment ID: ${newPayment.id} for customer ID: ${customerId}`,
      //     createdAt: new Date(),
      //   },
      // });

      return newPayment;
    });

    res.status(201).json({
      status: 'success',
      data: payment,
      message: 'Payment created successfully',
    });
  } catch (error) {
    winston.error(`Error creating payment: ${error.message}`, { error });
    return next(new handleError('Failed to create payment', 500));
  }
});

/**
 * Get all payments with pagination
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getAllPayments = asynerror(async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const skip = (parsedPage - 1) * parsedLimit;

    if (parsedPage < 1 || parsedLimit < 1) {
      return next(new handleError('Page and limit must be positive numbers', 400));
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        skip,
        take: parsedLimit,
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          bank: { select: { id: true, name: true } },
          approvedBy: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { id: 'desc' },
      }),
      prisma.payment.count(),
    ]);

    res.json({
      status: 'success',
      data: payments,
      meta: { total, page: parsedPage, limit: parsedLimit, totalPages: Math.ceil(total / parsedLimit) },
    });
  } catch (error) {
    winston.error(`Error fetching payments: ${error.message}`, { error });
    return next(new handleError('Failed to fetch payments', 500));
  }
});

/**
 * Get a single payment by ID
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getPaymentById = asynerror(async (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return next(new handleError('Valid Payment ID is required', 400));
  }

  try {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
        bank: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!payment) {
      return next(new handleError('Payment not found', 404));
    }

    res.json({ status: 'success', data: payment });
  } catch (error) {
    winston.error(`Error fetching payment: ${error.message}`, { error });
    return next(new handleError('Failed to fetch payment', 500));
  }
});

/**
 * Approve a payment by ID
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const approvePayment = asynerror(async (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return next(new handleError('Valid Payment ID is required', 400));
  }

  if (req.user.role !== 'SUPERUSER' && req.user.role !== 'ADMIN') {
    return next(new handleError('Only SUPERUSER or ADMIN can approve payments', 403));
  }

  try {
    const payment = await prisma.$transaction(async (tx) => {
      const existingPayment = await tx.payment.findUnique({
        where: { id },
        include: { customer: true },
      });
      if (!existingPayment) {
        throw new handleError('Payment not found', 404);
      }

      const updatedPayment = await tx.payment.update({
        where: { id },
        data: {
          approvedById: req.user.id,
          approvedAt: new Date(),
        },
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          bank: { select: { id: true, name: true } },
          approvedBy: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      await tx.activityLog.create({
        data: {
          method: 'PUT',
          role: req.user.role,
          action: 'APPROVE_PAYMENT',
          userId: req.user.id,
          customerId: existingPayment.customerId,
          detail: `Approved payment ID: ${updatedPayment.id} for customer ID: ${existingPayment.customerId}`,
          createdAt: new Date(),
        },
      });

      return updatedPayment;
    });

    res.json({ status: 'success', data: payment, message: 'Payment approved successfully' });
  } catch (error) {
    winston.error(`Error approving payment: ${error.message}`, { error });
    return next(error instanceof handleError ? error : new handleError('Failed to approve payment', 500));
  }
});

/**
 * Delete a payment by ID
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const deletePayment = asynerror(async (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return next(new handleError('Valid Payment ID is required', 400));
  }

  try {
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { id } });
      if (!payment) {
        throw new handleError('Payment not found', 404);
      }

      await tx.payment.delete({ where: { id } });

      await tx.activityLog.create({
        data: {
          method: 'DELETE',
          role: req.user.role,
          action: 'DELETE_PAYMENT',
          userId: req.user.id,
          customerId: payment.customerId,
          detail: `Deleted payment ID: ${id}`,
          createdAt: new Date(),
        },
      });
    });

    res.status(204).send();
  } catch (error) {
    winston.error(`Error deleting payment: ${error.message}`, { error });
    return next(error instanceof handleError ? error : new handleError('Failed to delete payment', 500));
  }
});



module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  approvePayment,
  deletePayment,
};