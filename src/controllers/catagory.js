const express = require('express');
const winston = require('winston');
const { PrismaClient } = require('@prisma/client');
const { categoryValidation, validate } = require('../validators/category');
const { restrictToSystemUser } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Create Category
router.post('/', restrictToSystemUser, categoryValidation, validate, async (req, res) => {
  try {
    const { name } = req.body;

    const category = await prisma.$transaction(async (tx) => {
      const newCategory = await tx.category.create({
        data: {
          name,
          createdAt: new Date(),
        },
      });

      await tx.activityLog.create({
        data: {
          method: 'POST',
          role: req.user.role,
          action: 'CREATE_CATEGORY',
          userId: req.user.id,
          detail: `Created category: ${name} (ID: ${newCategory.id})`,
          createdAt: new Date(),
        },
      });

      return newCategory;
    });

    res.status(201).json({
      status: 'success',
      data: category,
      message: 'Category created successfully',
    });
  } catch (error) {
    winston.error(`Error creating category: ${error.message}`, { error });
    if (error.code === 'P2002') {
      return res.status(400).json({ status: 'error', error: 'Category name already exists' });
    }
    res.status(500).json({ status: 'error', error: 'Failed to create category' });
  }
});

// Get All Categories
router.get('/', restrictToSystemUser, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.category.count(),
    ]);

    res.json({
      status: 'success',
      data: categories,
      meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    winston.error(`Error fetching categories: ${error.message}`, { error });
    res.status(500).json({ status: 'error', error: 'Failed to fetch categories' });
  }
});

// Get Single Category
router.get('/:id', restrictToSystemUser, [
  param('id').isInt().withMessage('Category ID must be an integer'),
], validate, async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!category) {
      return res.status(404).json({ status: 'error', error: 'Category not found' });
    }

    res.json({ status: 'success', data: category });
  } catch (error) {
    winston.error(`Error fetching category: ${error.message}`, { error });
    res.status(500).json({ status: 'error', error: 'Failed to fetch category' });
  }
});

// Update Category
router.put('/:id', restrictToSystemUser, categoryValidation, validate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await prisma.$transaction(async (tx) => {
      const updatedCategory = await tx.category.update({
        where: { id: parseInt(id) },
        data: {
          name,
          createdAt: new Date(),
        },
      });

      await tx.activityLog.create({
        data: {
          method: 'PUT',
          role: req.user.role,
          action: 'UPDATE_CATEGORY',
          userId: req.user.id,
          detail: `Updated category: ${name} (ID: ${updatedCategory.id})`,
          createdAt: new Date(),
        },
      });

      return updatedCategory;
    });

    res.json({ status: 'success', data: category, message: 'Category updated successfully' });
  } catch (error) {
    winston.error(`Error updating category: ${error.message}`, { error });
    if (error.code === 'P2025') {
      return res.status(404).json({ status: 'error', error: 'Category not found' });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ status: 'error', error: 'Category name already exists' });
    }
    res.status(500).json({ status: 'error', error: 'Failed to update category' });
  }
});

// Delete Category
router.delete('/:id', restrictToSystemUser, [
  param('id').isInt().withMessage('Category ID must be an integer'),
], validate, async (req, res) => {
  try {
    await prisma.$transaction(async (tx) => {
      const category = await tx.category.findUnique({ where: { id: parseInt(req.params.id) } });
      if (!category) {
        throw new Error('Category not found');
      }

      await tx.category.delete({ where: { id: parseInt(req.params.id) } });

      await tx.activityLog.create({
        data: {
          method: 'DELETE',
          role: req.user.role,
          action: 'DELETE_CATEGORY',
          userId: req.user.id,
          detail: `Deleted category ID: ${req.params.id}`,
          createdAt: new Date(),
        },
      });
    });

    res.status(204).json({ status: 'success', message: 'Category deleted successfully' });
  } catch (error) {
    winston.error(`Error deleting category: ${error.message}`, { error });
    if (error.message === 'Category not found') {
      return res.status(404).json({ status: 'error', error: 'Category not found' });
    }
    res.status(500).json({ status: 'error', error: 'Failed to delete category' });
  }
});

module.exports = router;