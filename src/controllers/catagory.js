const prisma = require('../config/db');

// Helper: Validate status
const isValidStatus = (status) => ['active', 'inactive'].includes(status);

// GET all categories with pagination
exports.getAllCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          systemUser: { select: { id: true, firstName: true, lastName: true } },
          subcategories: { select: { id: true } },
          tenders: { select: { id: true } },
        },
      }),
      prisma.category.count(),
    ]);

    const formattedCategories = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      createdAt: cat.createdAt.toISOString(),
      createdBy: cat.createdBy,
      status: cat.status,
      subcategoryCount: cat.subcategories.length,
      tenderCount: cat.tenders.length,
    }));

    res.json({
      data: formattedCategories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

// CREATE new category
exports.createCategory = async (req, res) => {
  const { name, status } = req.body;
  const createdBy = req.user?.id; // Assume req.user.id from auth middleware

  // Validation
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ message: 'Name is required' });
  }
  if (!status || !isValidStatus(status)) {
    return res.status(400).json({ message: 'Status must be active or inactive' });
  }
  if (!createdBy || isNaN(parseInt(createdBy))) {
    return res.status(400).json({ message: 'Valid creator ID is required' });
  }

  try {
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        status,
        createdBy: parseInt(createdBy),
      },
      include: {
        subcategories: { select: { id: true } },
        tenders: { select: { id: true } },
      },
    });

    res.status(201).json({
      data: {
        id: category.id,
        name: category.name,
        createdAt: category.createdAt.toISOString(),
        createdBy: category.createdBy,
        status: category.status,
        subcategoryCount: category.subcategories.length,
        tenderCount: category.tenders.length,
      },
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Failed to create category' });
  }
};

// UPDATE category
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, status } = req.body;

  // Validation
  if (!name && !status) {
    return res.status(400).json({ message: 'At least one field (name or status) is required' });
  }
  if (name && name.trim().length === 0) {
    return res.status(400).json({ message: 'Name cannot be empty' });
  }
  if (status && !isValidStatus(status)) {
    return res.status(400).json({ message: 'Status must be active or inactive' });
  }

  try {
    const existingCategory = await prisma.category.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (status) updateData.status = status;

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        subcategories: { select: { id: true } },
        tenders: { select: { id: true } },
      },
    });

    res.json({
      data: {
        id: category.id,
        name: category.name,
        createdAt: category.createdAt.toISOString(),
        createdBy: category.createdBy,
        status: category.status,
        subcategoryCount: category.subcategories.length,
        tenderCount: category.tenders.length,
      },
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Failed to update category' });
  }
};

// DELETE category
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
    });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await prisma.category.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Failed to delete category' });
  }
};