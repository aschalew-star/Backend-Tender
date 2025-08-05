const prisma = require('../config/db.js');
const handleError = require('../utili/errorhandle.js');
const asynerror = require('../utili/asyncerror.js');

/**
 * Create a new region
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const createRegion = asynerror(async (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    return next(new handleError('Region name is required', 400));
  }

  const region = await prisma.$transaction(async (tx) => {
    const newRegion = await tx.region.create({
      data: {
        name,
        // createdAt is set by Prisma's @default(now())
      },
    });

    // // Optional: Log activity if activityLog model exists
    // await tx.activityLog.create({
    //   data: {
    //     method: 'POST',
    //     // role: req.user.role,
    //     action: 'CREATE_REGION',
    //     // userId: req.user.id,
    //     detail: `Created region: ${name} (ID: ${newRegion.id})`,
    //     createdAt: new Date(),
    //   },
    // });

    return newRegion;
  });

  res.status(201).json({
    status: 'success',
    data: region,
    message: 'Region created successfully',
  });
});

/**
 * Get all regions with pagination and optional search
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getAllRegions = asynerror(async (req, res, next) => {
  const { page = 1, limit = 10, search } = req.query;
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);
  const skip = (parsedPage - 1) * parsedLimit;

  if (parsedPage < 1 || parsedLimit < 1) {
    return next(new handleError('Page and limit must be positive numbers', 400));
  }

  const where = search ? { name: { contains: String(search), mode: 'insensitive' } } : {};

  const [regions, total] = await Promise.all([
    prisma.region.findMany({
      where,
      skip,
      take: parsedLimit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.region.count({ where }),
  ]);

  res.json({
    status: 'success',
    data: regions,
    meta: { total, page: parsedPage, limit: parsedLimit, totalPages: Math.ceil(total / parsedLimit) },
  });
});
/**
 * Get a single region by ID
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getRegionById = asynerror(async (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return next(new handleError('Valid Region ID is required', 400));
  }

  const region = await prisma.region.findUnique({
    where: { id },
  });

  if (!region) {
    return next(new handleError('Region not found', 404));
  }

  res.json({ status: 'success', data: region });
});

/**
 * Update a region by ID
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const updateRegion = asynerror(async (req, res, next) => {
  const id = parseInt(req.params.id);
  const { name } = req.body;

  if (isNaN(id)) {
    return next(new handleError('Valid Region ID is required', 400));
  }

  if (!name) {
    return next(new handleError('Region name is required', 400));
  }

  const region = await prisma.$transaction(async (tx) => {
    const updatedRegion = await tx.region.update({
      where: { id },
      data: { name }, // Do not update createdAt
    });

    // // Optional: Log activity if activityLog model exists
    // await tx.activityLog.create({
    //   data: {
    //     method: 'PUT',
    //     role: req.user.role,
    //     action: 'UPDATE_REGION',
    //     userId: req.user.id,
    //     detail: `Updated region: ${name} (ID: ${updatedRegion.id})`,
    //     createdAt: new Date(),
    //   },
    // });

    return updatedRegion;
  });

  res.json({ status: 'success', data: region, message: 'Region updated successfully' });
});

/**
 * Delete a region by ID
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const deleteRegion = asynerror(async (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return next(new handleError('Valid Region ID is required', 400));
  }

  await prisma.$transaction(async (tx) => {
    const region = await tx.region.findUnique({ where: { id } });
    if (!region) {
      throw new handleError('Region not found', 404);
    }

    await tx.region.delete({ where: { id } });

    // Optional: Log activity if activityLog model exists
    // await tx.activityLog.create({
    //   data: {
    //     method: 'DELETE',
    //     role: req.user.role,
    //     action: 'DELETE_REGION',
    //     userId: req.user.id,
    //     detail: `Deleted region ID: ${id}`,
    //     createdAt: new Date(),
    //   },
    // });
  });

  res.status(204).send(); // No body for 204 status
});

module.exports = {
  createRegion,
  getAllRegions,
  getRegionById,
  updateRegion,
  deleteRegion,
};