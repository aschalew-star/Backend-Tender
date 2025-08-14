// server/controllers/payment.js
const prisma = require("../config/db.js");
const handleError = require("../utili/errorhandle.js");
const asynerror = require("../utili/asyncerror.js");
const winston = require("winston"); // Assuming winston is used for logging as in original code

/**
 * Create a new payment
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const createPayment = asynerror(async (req, res, next) => {
  try {
    const { customerId, bankId, price, howLong } = req.body;

    // Validate customer
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(customerId) },
    });
    if (!customer) return next(new handleError("Customer not found", 404));

    // Validate bank
    const bank = await prisma.bank.findUnique({
      where: { id: parseInt(bankId) },
    });
    if (!bank) return next(new handleError("Bank not found", 404));

    let payment;
    let endDate;

    // handle duration (string checks)
    if (howLong !== "TENDER") {
      if (howLong === "THREEMONTHLY") {
        endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 3);
      } else if (howLong === "SIXMONTHLY") {
        endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 6);
      } else if (howLong === "YEARLY") {
        endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      payment = await prisma.$transaction(async (tx) => {
        const newPayment = await tx.payment.create({
          data: {
            customerId: parseInt(customerId),
            bankId: parseInt(bankId),
            price: parseFloat(price),
            howLong,
          },
          include: {
            customer: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            bank: { select: { id: true, name: true } },
            approvedBy: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        });

        // Update customer subscription
        await tx.customer.update({
          where: { id: parseInt(customerId) },
          data: {
            endDate: endDate,
            isSubscribed: true,
          },
        });

        // Upsert reminder to avoid unique constraint error
        await tx.reminder.upsert({
          where: { customerId: parseInt(customerId) },
          update: {},
          create: { customerId: parseInt(customerId) },
        });

        return newPayment;
      });
    } else {
      // If "TENDER"
      payment = await prisma.$transaction(async (tx) => {
        return tx.payment.create({
          data: {
            customerId: parseInt(customerId),
            bankId: parseInt(bankId),
            price: parseFloat(price),
            howLong,
          },
          include: {
            customer: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            bank: { select: { id: true, name: true } },
            approvedBy: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        });
      });
    }

    res.status(201).json({
      status: "success",
      data: payment,
      message: "Payment created successfully",
    });
  } catch (error) {
    console.error("Full error:", error); // for dev debugging
    winston.error(`Error creating payment: ${error.message}`, { error });
    return next(new handleError("Failed to create payment", 500));
  }
});


//get all payments
const getPayments = asynerror(async (req, res, next) => {
  try {
    const { skip = 0, take = 15, search = "", status = "" } = req.query;
    const where = {};
    if (search) {
      where.OR = [
        { customer: { firstName: { contains: search, mode: "insensitive" } } },
        { customer: { lastName: { contains: search, mode: "insensitive" } } },
        { customer: { email: { contains: search, mode: "insensitive" } } },
        { id: { equals: parseInt(search) || undefined } },
      ];
    }
    if (status) {
      where.status = status;
    }
    const payments = await prisma.payment.findMany({
      skip: parseInt(skip),
      take: parseInt(take),
      where,
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        bank: { select: { id: true, name: true } },
        approvedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
    const total = await prisma.payment.count({ where });
    const transformedPayments = payments.map((payment) => ({
      id: payment.id,
      customer: {
        name: payment.customer
          ? `${payment.customer.firstName} ${payment.customer.lastName}`
          : "Unknown Customer",
        email: payment.customer?.email || "N/A",
      },
      price: payment.price || 0,
      bank: { name: payment.bank?.name || "Unknown Bank" },
      approvedAt: payment.approvedAt instanceof Date ? payment.approvedAt.toISOString() : null,
      howLong: payment.howLong || "N/A",
      status: payment.status || "pending",
      createdAt: payment.createdAt instanceof Date ? payment.createdAt.toISOString() : new Date().toISOString(),
    }));
    res.status(200).json({
      status: "success",
      data: { payments: transformedPayments, total },
      message: "Payments fetched successfully",
    });
  } catch (error) {
    console.error("Full error:", error);
    winston.error(`Error fetching payments: ${error.message}`, {
      error,
      query: req.query,
      stack: error.stack,
    });
    return next(new handleError(`Failed to fetch payments: ${error.message}`, 500));
  }
});


// Approve a payment
const approvePayment = asynerror(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approvedAt, status } = req.body;

    // Validate payment
    const paymentExists = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
    });
    if (!paymentExists) {
      winston.warn(`Payment not found: ${id}`, { params: req.params });
      return next(new handleError("Payment not found", 404));
    }

    // Validate status
    if (status !== "approved") {
      winston.warn(`Invalid status for approval: ${status}`, { body: req.body });
      return next(new handleError("Invalid status for approval", 400));
    }

    // Validate approvedAt
    if (!approvedAt || isNaN(new Date(approvedAt).getTime())) {
      winston.warn(`Invalid approvedAt date: ${approvedAt}`, { body: req.body });
      return next(new handleError("Invalid approvedAt date", 400));
    }

    // Validate approvedById (assuming user ID comes from auth context)
    const approvedById = 1; // Replace with req.user.id from auth middleware
    const userExists = await prisma.systemUser.findUnique({
      where: { id: approvedById },
    });
    if (!userExists) {
      winston.warn(`SystemUser not found: ${approvedById}`, { approvedById });
      return next(new handleError("SystemUser not found", 404));
    }

    const payment = await prisma.payment.update({
      where: { id: parseInt(id) },
      data: {
        approvedAt: new Date(approvedAt),
        status,
        approvedById,
      },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        bank: { select: { id: true, name: true } },
        approvedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    const transformedPayment = {
      id: payment.id,
      customer: {
        name: payment.customer
          ? `${payment.customer.firstName} ${payment.customer.lastName}`
          : "Unknown Customer",
        email: payment.customer?.email || "N/A",
      },
      price: payment.price || 0,
      bank: { name: payment.bank?.name || "Unknown Bank" },
      approvedAt: payment.approvedAt instanceof Date ? payment.approvedAt.toISOString() : null,
      howLong: payment.howLong || "N/A",
      status: payment.status || "pending",
      createdAt: payment.createdAt instanceof Date ? payment.createdAt.toISOString() : new Date().toISOString(),
    };

    winston.info(`Payment approved successfully: ${id}`, { paymentId: id });
    res.status(200).json({
      status: "success",
      data: transformedPayment,
      message: "Payment approved successfully",
    });
  } catch (error) {
    console.error("Full error:", error);
    winston.error(`Error approving payment: ${error.message}`, {
      error,
      params: req.params,
      body: req.body,
      stack: error.stack,
    });
    return next(new handleError(`Failed to approve payment: ${error.message}`, 500));
  }
});

// Reject a payment
const rejectPayment = asynerror(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate payment
    const paymentExists = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
    });
    if (!paymentExists) {
      winston.warn(`Payment not found: ${id}`, { params: req.params });
      return next(new handleError("Payment not found", 404));
    }

    // Validate status
    if (status !== "rejected") {
      winston.warn(`Invalid status for rejection: ${status}`, { body: req.body });
      return next(new handleError("Invalid status for rejection", 400));
    }

    const payment = await prisma.payment.update({
      where: { id: parseInt(id) },
      data: { 
        status,
        approvedAt: null, // Clear approvedAt on rejection
        approvedById: null, // Clear approvedById on rejection
      },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        bank: { select: { id: true, name: true } },
        approvedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    const transformedPayment = {
      id: payment.id,
      customer: {
        name: payment.customer
          ? `${payment.customer.firstName} ${payment.customer.lastName}`
          : "Unknown Customer",
        email: payment.customer?.email || "N/A",
      },
      price: payment.price || 0,
      bank: { name: payment.bank?.name || "Unknown Bank" },
      approvedAt: payment.approvedAt instanceof Date ? payment.approvedAt.toISOString() : null,
      howLong: payment.howLong || "N/A",
      status: payment.status || "pending",
      createdAt: payment.createdAt instanceof Date ? payment.createdAt.toISOString() : new Date().toISOString(),
    };

    winston.info(`Payment rejected successfully: ${id}`, { paymentId: id });
    res.status(200).json({
      status: "success",
      data: transformedPayment,
      message: "Payment rejected successfully",
    });
  } catch (error) {
    console.error("Full error:", error);
    winston.error(`Error rejecting payment: ${error.message}`, {
      error,
      params: req.params,
      body: req.body,
      stack: error.stack,
    });
    return next(new handleError(`Failed to reject payment: ${error.message}`, 500));
  }
});
// /**
//  * Get a single payment by ID
//  * @param {import('express').Request} req
//  * @param {import('express').Response} res
//  * @param {import('express').NextFunction} next
//  */
// const getPaymentById = asynerror(async (req, res, next) => {
//   const id = parseInt(req.params.id);

//   if (isNaN(id)) {
//     return next(new handleError("Valid Payment ID is required", 400));
//   }

//   try {
//     const payment = await prisma.payment.findUnique({
//       where: { id },
//       include: {
//         customer: {
//           select: { id: true, firstName: true, lastName: true, email: true },
//         },
//         bank: { select: { id: true, name: true } },
//         approvedBy: { select: { id: true, firstName: true, lastName: true } },
//       },
//     });

//     if (!payment) {
//       return next(new handleError("Payment not found", 404));
//     }

//     res.json({ status: "success", data: payment });
//   } catch (error) {
//     winston.error(`Error fetching payment: ${error.message}`, { error });
//     return next(new handleError("Failed to fetch payment", 500));
//   }
// });

/**
 * Approve a payment by ID (role-based)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const approvePaymentByRole = asynerror(async (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return next(new handleError("Valid Payment ID is required", 400));
  }

  if (req.user.role !== "SUPERUSER" && req.user.role !== "ADMIN") {
    return next(
      new handleError("Only SUPERUSER or ADMIN can approve payments", 403)
    );
  }

  try {
    const payment = await prisma.$transaction(async (tx) => {
      const existingPayment = await tx.payment.findUnique({
        where: { id },
        include: { customer: true },
      });
      if (!existingPayment) {
        throw new handleError("Payment not found", 404);
      }

      const updatedPayment = await tx.payment.update({
        where: { id },
        data: {
          approvedById: req.user.id,
          approvedAt: new Date(),
        },
        include: {
          customer: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          bank: { select: { id: true, name: true } },
          approvedBy: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      await tx.activityLog.create({
        data: {
          method: "PUT",
          role: req.user.role,
          action: "APPROVE_PAYMENT",
          userId: req.user.id,
          customerId: existingPayment.customerId,
          detail: `Approved payment ID: ${updatedPayment.id} for customer ID: ${existingPayment.customerId}`,
          createdAt: new Date(),
        },
      });

      return updatedPayment;
    });

    res.json({
      status: "success",
      data: payment,
      message: "Payment approved successfully",
    });
  } catch (error) {
    winston.error(`Error approving payment: ${error.message}`, { error });
    return next(
      error instanceof handleError
        ? error
        : new handleError("Failed to approve payment", 500)
    );
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
    return next(new handleError("Valid Payment ID is required", 400));
  }

  try {
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { id } });
      if (!payment) {
        throw new handleError("Payment not found", 404);
      }

      await tx.payment.delete({ where: { id } });

      await tx.activityLog.create({
        data: {
          method: "DELETE",
          role: req.user.role,
          action: "DELETE_PAYMENT",
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
    return next(
      error instanceof handleError
        ? error
        : new handleError("Failed to delete payment", 500)
    );
  }
});

module.exports = {
  createPayment,
  // getPaymentById,rejectPayment
  getPayments,rejectPayment,
  approvePayment,
  approvePaymentByRole,
  deletePayment,
};
