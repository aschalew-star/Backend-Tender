const winston = require('winston');
const { PrismaClient } = require('@prisma/client');
const asynerror = require('../utili/asyncerror.js');
const handleError = require('../utili/errorhandle.js');

const prisma = new PrismaClient();

// Create Subcategory
const createSubcategory = asynerror(async (req, res, next) => {
  const { name, categoryname } = req.body;

  try {
    let category = await prisma.category.findUnique({
      where: { name: categoryname }, // Don't use parseInt on string name
    });

    // If category doesn't exist, create it
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categoryname,
          // createdBy: req.user.id,
        },
      });
    }

    // Create the subcategory
    const newSubcategory = await prisma.subcategory.create({
      data: {
        name,
        categoryId: category.id,
        createdBy: req.user.id,
        createdAt: new Date(),
      },
    });

    res.status(201).json({
      status: 'success',
      data: newSubcategory,
      message: 'Subcategory created successfully',
    });
  } catch (error) {
    winston.error(`Error creating subcategory: ${error.message}`, { error });
    if (error.code === 'P2002') {
      return next(new handleError('Subcategory name already exists for this category', 400));
    }
    return next(new handleError(`Failed to create subcategory: ${error.message}`, 500));
  }
});


// // Get All Subcategories
// const getAllSubcategories = asynerror(async (req, res, next) => {
//   const { page = 1, limit = 10, categoryId } = req.query;
//   const skip = (parseInt(page) - 1) * parseInt(limit);

//   const where = categoryId ? { categoryId: parseInt(categoryId) } : {};

//   try {
//     const [subcategories, total] = await Promise.all([
//       prisma.subcategory.findMany({
//         where,
//         skip,
//         take: parseInt(limit),
//         include: { category: { select: { id: true, name: true } } },
//         orderBy: { createdAt: 'desc' },
//       }),
//       prisma.subcategory.count({ where }),
//     ]);

//     res.json({
//       status: 'success',
//       data: subcategories,
//       meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) },
//     });
//   } catch (error) {
//     winston.error(`Error fetching subcategories: ${error.message}`, { error });
//     return next(new handleError(`Failed to fetch subcategories: ${error.message}`, 500));
//   }
// });

// // Get Single Subcategory
// const getSubcategoryById = asynerror(async (req, res, next) => {
//   await param('id').isInt().withMessage('Subcategory ID must be an integer').run(req);
//   await validate(req, res, async () => {
//     try {
//       const subcategory = await prisma.subcategory.findUnique({
//         where: { id: parseInt(req.params.id) },
//         include: { category: { select: { id: true, name: true } } },
//       });

//       if (!subcategory) {
//         return next(new handleError('Subcategory not found', 404));
//       }

//       res.json({ status: 'success', data: subcategory });
//     } catch (error) {
//       winston.error(`Error fetching subcategory: ${error.message}`, { error });
//       return next(new handleError(`Failed to fetch subcategory: ${error.message}`, 500));
//     }
//   });
// });

// // Update Subcategory
// const updateSubcategory = asynerror(async (req, res, next) => {
//   await subcategoryValidation(req, res, () => {});
//   await validate(req, res, async () => {
//     const { id } = req.params;
//     const { name, categoryId } = req.body;

//     try {
//       const category = await prisma.category.findUnique({ where: { id: parseInt(categoryId) } });
//       if (!category) {
//         return next(new handleError('Category not found', 404));
//       }

//       const subcategory = await prisma.$transaction(async (tx) => {
//         const updatedSubcategory = await tx.subcategory.update({
//           where: { id: parseInt(id) },
//           data: {
//             name,
//             categoryId: parseInt(categoryId),
//             createdAt: new Date(),
//           },
//         });

//         await tx.activityLog.create({
//           data: {
//             method: 'PUT',
//             role: req.user.role,
//             action: 'UPDATE_SUBCATEGORY',
//             userId: req.user.id,
//             detail: `Updated subcategory: ${name} (ID: ${updatedSubcategory.id})`,
//             createdAt: new Date(),
//           },
//         });

//         return updatedSubcategory;
//       });

//       res.json({ status: 'success', data: subcategory, message: 'Subcategory updated successfully' });
//     } catch (error) {
//       winston.error(`Error updating subcategory: ${error.message}`, { error });
//       if (error.code === 'P2025') {
//         return next(new handleError('Subcategory not found', 404));
//       }
//       if (error.code === 'P2002') {
//         return next(new handleError('Subcategory name already exists for this category', 400));
//       }
//       return next(new handleError(`Failed to update subcategory: ${error.message}`, 500));
//     }
//   });
// });

// Delete Subcategory
// const deleteSubcategory = asynerror(async (req, res, next) => {
//   await param('id').isInt().withMessage('Subcategory ID must be an integer').run(req);
//   await validate(req, res, async () => {
//     try {
//       await prisma.$transaction(async (tx) => {
//         const subcategory = await tx.subcategory.findUnique({ where: { id: parseInt(req.params.id) } });
//         if (!subcategory) {
//           return next(new handleError('Subcategory not found', 404));
//         }

//         await tx.subcategory.delete({ where: { id: parseInt(req.params.id) } });

//         await tx.activityLog.create({
//           data: {
//             method: 'DELETE',
//             role: req.user.role,
//             action: 'DELETE_SUBCATEGORY',
//             userId: req.user.id,
//             detail: `Deleted subcategory ID: ${req.params.id}`,
//             createdAt: new Date(),
//           },
//         });
//       });

//       res.status(204).json({ status: 'success', message: 'Subcategory deleted successfully' });
//     } catch (error) {
//       winston.error(`Error deleting subcategory: ${error.message}`, { error });
//       return next(new handleError(`Failed to delete subcategory: ${error.message}`, 500));
//     }
//   });
// });

module.exports = {
  createSubcategory,
  // getAllSubcategories,
  // getSubcategoryById,
  // updateSubcategory,
  // deleteSubcategory,
};