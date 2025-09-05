const prisma = require('../config/db');

// Helper: Validate status
const isValidStatus = (status) => ['active', 'inactive'].includes(status);

// GET all subcategories with pagination
exports.getAllSubcategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const [subcategories, total] = await Promise.all([
      prisma.subcategory.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true } },
          tenders: { select: { id: true } },
        },
      }),
      prisma.subcategory.count(),
    ]);

    const formattedSubcategories = subcategories.map((sub) => ({
      id: sub.id,
      name: sub.name,
      categoryId: sub.categoryId,
      categoryName: sub.category?.name || 'Unknown',
      createdAt: sub.createdAt.toISOString(),
      createdBy: sub.createdBy,
      status: sub.status,
      tenderCount: sub.tenders.length,
    }));

    res.json({
      data: formattedSubcategories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ message: 'Failed to fetch subcategories' });
  }
};

// GET subcategory by ID
exports.getSubcategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const subcategory = await prisma.subcategory.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: { select: { id: true, name: true } },
        tenders: { select: { id: true } },
      },
    });
    if (!subcategory) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }
    res.json({
      data: {
        id: subcategory.id,
        name: subcategory.name,
        categoryId: subcategory.categoryId,
        categoryName: subcategory.category?.name || 'Unknown',
        createdAt: subcategory.createdAt.toISOString(),
        createdBy: subcategory.createdBy,
        status: subcategory.status,
        tenderCount: subcategory.tenders.length,
      },
    });
  } catch (error) {
    console.error('Error fetching subcategory:', error);
    res.status(500).json({ message: 'Failed to fetch subcategory' });
  }
};


// src/controllers/subcatagory.js
exports.createSubcategory = async (req, res) => {
  const { name, categoryId } = req.body;
  const createdBy = req.user?.id; // From auth middleware

  // Validation
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ message: 'Name is required' });
  }
  if (!categoryId || isNaN(parseInt(categoryId))) {
    return res.status(400).json({ message: 'Valid category ID is required' });
  }
  if (!createdBy || isNaN(parseInt(createdBy))) {
    return res.status(400).json({ message: 'Valid creator ID is required' });
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) },
    });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const subcategory = await prisma.subcategory.create({
      data: {
        name: name.trim(),
        category: { connect: { id: parseInt(categoryId) } },
        systemUser: { connect: { id: parseInt(createdBy) } },
      },
      include: {
        category: { select: { id: true, name: true } },
        tenders: { select: { id: true } },
      },
    });

    res.status(201).json({
      data: {
        id: subcategory.id,
        name: subcategory.name,
        categoryId: subcategory.categoryId,
        categoryName: subcategory.category?.name || 'Unknown',
        createdAt: subcategory.createdAt.toISOString(),
        createdBy: subcategory.systemUser?.id || null,
        tenderCount: subcategory.tenders.length,
      },
    });
  } catch (error) {
    console.error('Error creating subcategory:', error);
    res.status(500).json({ message: 'Failed to create subcategory' });
  }
};



// UPDATE subcategory
exports.updateSubcategory = async (req, res) => {
  const { id } = req.params;
  const { name, categoryId, status } = req.body;

  // Validation
  if (!name && !categoryId && !status) {
    return res.status(400).json({ message: 'At least one field (name, categoryId, or status) is required' });
  }
  if (name && name.trim().length === 0) {
    return res.status(400).json({ message: 'Name cannot be empty' });
  }
  if (categoryId && isNaN(parseInt(categoryId))) {
    return res.status(400).json({ message: 'Valid category ID is required' });
  }
  if (status && !isValidStatus(status)) {
    return res.status(400).json({ message: 'Status must be active or inactive' });
  }

  try {
    const existingSubcategory = await prisma.subcategory.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existingSubcategory) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) },
      });
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (categoryId) updateData.categoryId = parseInt(categoryId);
    if (status) updateData.status = status;

    const subcategory = await prisma.subcategory.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        category: { select: { id: true, name: true } },
        tenders: { select: { id: true } },
      },
    });

    res.json({
      data: {
        id: subcategory.id,
        name: subcategory.name,
        categoryId: subcategory.categoryId,
        categoryName: subcategory.category?.name || 'Unknown',
        createdAt: subcategory.createdAt.toISOString(),
        createdBy: subcategory.createdBy,
        status: subcategory.status,
        tenderCount: subcategory.tenders.length,
      },
    });
  } catch (error) {
    console.error('Error updating subcategory:', error);
    res.status(500).json({ message: 'Failed to update subcategory' });
  }
};

// DELETE subcategory
exports.deleteSubcategory = async (req, res) => {
  const { id } = req.params;

  try {
    const subcategory = await prisma.subcategory.findUnique({
      where: { id: parseInt(id) },
    });
    if (!subcategory) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    await prisma.subcategory.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    res.status(500).json({ message: 'Failed to delete subcategory' });
  }
};