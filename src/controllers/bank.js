const prisma = require('../config/db.js');
const handleError = require('../utili/errorhandle.js');
const asynerror = require('../utili/asyncerror.js');

/**
 * Create a new bank
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const createBank = asynerror(async (req, res, next) => {
  const { name, account, logo } = req.body;

  if (!name || !account) {
    return next(new handleError('Bank name and account are required', 400));
  }

  const bank = await prisma.$transaction(async (tx) => {
    const newBank = await tx.bank.create({
      data: {
        name,
        account,
        logo,
      },
    });

    // // Log activity
    // await tx.activityLog.create({
    //   data: {
    //     method: 'POST',
    //     role: req.user.role,
    //     action: 'CREATE_BANK',
    //     userId: req.user.id,
    //     detail: `Created bank: ${name} (ID: ${newBank.id})`,
    //   },
    // });

    return newBank;
  });

  res.status(201).json({
    status: 'success',
    data: bank,
    message: 'Bank created successfully',
  });
});

/**
 * Get all banks with pagination and optional search
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getAllBanks = asynerror(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);
  const skip = (parsedPage - 1) * parsedLimit;

  if (parsedPage < 1 || parsedLimit < 1) {
    return next(new handleError('Page and limit must be positive numbers', 400));
  }

  const [banks, total] = await Promise.all([
    prisma.bank.findMany({
      skip,
      take: parsedLimit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.bank.count(),
  ]);

  res.json({
    status: 'success',
    data: banks,
    meta: { total, page: parsedPage, limit: parsedLimit, totalPages: Math.ceil(total / parsedLimit) },
  });
});

/**
 * Get a single bank by ID
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getBankById = asynerror(async (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return next(new handleError('Valid Bank ID is required', 400));
  }

  const bank = await prisma.bank.findUnique({
    where: { id },
  });

  if (!bank) {
    return next(new handleError('Bank not found', 404));
  }

  res.json({ status: 'success', data: bank });
});

/**
 * Update a bank by ID
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const updateBank = asynerror(async (req, res, next) => {
  const id = parseInt(req.params.id);
  const { name, account, logo } = req.body;

  if (isNaN(id)) {
    return next(new handleError('Valid Bank ID is required', 400));
  }

  if (!name && !account && !logo) {
    return next(new handleError('At least one field to update (name, account, or logo) is required', 400));
  }

  try {
    const bank = await prisma.$transaction(async (tx) => {
      const updatedBank = await tx.bank.update({
        where: { id },
        data: { name, account, logo },
      });

      // Log activity
      // await tx.activityLog.create({
      //   data: {
      //     method: 'PUT',
      //     role: req.user.role,
      //     action: 'UPDATE_BANK',
      //     userId: req.user.id,
      //     detail: `Updated bank: ${name} (ID: ${updatedBank.id})`,
      //   },
      // });

      return updatedBank;
    });

    res.json({ status: 'success', data: bank, message: 'Bank updated successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return next(new handleError('Bank not found', 404));
    }
    throw error;
  }
});

/**
 * Delete a bank by ID
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const deleteBank = asynerror(async (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return next(new handleError('Valid Bank ID is required', 400));
  }

  await prisma.$transaction(async (tx) => {
    const bank = await tx.bank.findUnique({ where: { id } });
    if (!bank) {
      throw new handleError('Bank not found', 404);
    }

    await tx.bank.delete({ where: { id } });

    // // Log activity
    // await tx.activityLog.create({
    //   data: {
    //     method: 'DELETE',
    //     role: req.user.role,
    //     action: 'DELETE_BANK',
    //     userId: req.user.id,
    //     detail: `Deleted bank ID: ${id}`,
    //   },
    // });
  });

  res.status(204).send();
});

// Safe version: src/controllers/bank.js
 const getBanksForPaymentForm = async (req, res, next) => {
  const search = req.query.search ? String(req.query.search).trim() : undefined;

  try {
    const banks = await prisma.bank.findMany({
      where: search
        ? {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : undefined,
      select: {
        id: true,
        name: true,
      },
    });

    res.json(banks);
  } catch (error) {
    console.error('Error fetching banks:', error);
    res.status(500).json({ message: 'Error fetching banks' });
  }
};






module.exports = {
  createBank,
  getAllBanks,
  getBankById,
  updateBank,
getBanksForPaymentForm,
  deleteBank,
};
