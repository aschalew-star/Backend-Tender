const path = require('path');
const fs = require('fs').promises;
const prisma = require('../config/db');

// Helper: URL validation
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Helper: Validate status
const isValidStatus = (status) => ['active', 'inactive', 'pending'].includes(status);

// Helper: Validate date
const isValidDate = (date) => {
  try {
    return !isNaN(new Date(date).getTime());
  } catch {
    return false;
  }
};

// Helper: Validate file type
const isValidImage = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  return file && validTypes.includes(file.mimetype);
};

// GET all ads with pagination
exports.getAllAdvertisements = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const [ads, total] = await Promise.all([
      prisma.advertisement.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { systemUser: { select: { id: true, firstName: true, lastName: true } } },
      }),
      prisma.advertisement.count(),
    ]);

    res.json({
      data: ads,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching advertisements:', error);
    res.status(500).json({ message: 'Failed to fetch advertisements' });
  }
};
// CREATE new ad
exports.createAdvertisement = async (req, res) => {
  const { title, url, status, startDate, endDate, createdBy } = req.body; // get createdBy from frontend
  const file = req.file;

  // Validation
  if (!file || !isValidImage(file)) {
    return res.status(400).json({ message: 'A valid image (JPEG/PNG/GIF) is required' });
  }
  if (!title || title.trim().length === 0) {
    return res.status(400).json({ message: 'Title is required' });
  }
  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ message: 'Valid URL is required' });
  }
  if (!status || !isValidStatus(status)) {
    return res.status(400).json({ message: 'Status must be active, inactive, or pending' });
  }
  if (!startDate || !isValidDate(startDate)) {
    return res.status(400).json({ message: 'Valid start date is required' });
  }
  if (!endDate || !isValidDate(endDate)) {
    return res.status(400).json({ message: 'Valid end date is required' });
  }
  if (new Date(endDate) < new Date(startDate)) {
    return res.status(400).json({ message: 'End date must be after start date' });
  }
  if (!createdBy || isNaN(parseInt(createdBy))) {
    return res.status(400).json({ message: 'Valid creator ID is required' });
  }

  try {
    const imagePath = `/Uploads/Advertisements/${file.filename}`;
    const ad = await prisma.advertisement.create({
      data: {
        title: title.trim(),
        url,
        image: imagePath,
        status,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        systemUser: {
          connect: { id: parseInt(createdBy) }, // <-- connect to existing user
        },
      },
    });
    res.status(201).json({ data: ad });
  } catch (error) {
    console.error('Error creating advertisement:', error);
    res.status(500).json({ message: 'Failed to create advertisement', error: error.message });
  }
};

// UPDATE ad
exports.updateAdvertisement = async (req, res) => {
  const { id } = req.params;
  const { title, url, status, startDate, endDate, createdBy } = req.body;
  const file = req.file;

  // Validation
  if (!title && !url && !status && !startDate && !endDate && !createdBy && !file) {
    return res.status(400).json({ message: 'At least one field is required to update' });
  }
  if (title && title.trim().length === 0) {
    return res.status(400).json({ message: 'Title cannot be empty' });
  }
  if (url && !isValidUrl(url)) {
    return res.status(400).json({ message: 'Invalid URL format' });
  }
  if (status && !isValidStatus(status)) {
    return res.status(400).json({ message: 'Status must be active, inactive, or pending' });
  }
  if (startDate && !isValidDate(startDate)) {
    return res.status(400).json({ message: 'Invalid start date' });
  }
  if (endDate && !isValidDate(endDate)) {
    return res.status(400).json({ message: 'Invalid end date' });
  }
  if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
    return res.status(400).json({ message: 'End date must be after start date' });
  }
  if (createdBy && isNaN(parseInt(createdBy))) {
    return res.status(400).json({ message: 'Invalid creator ID' });
  }
  if (file && !isValidImage(file)) {
    return res.status(400).json({ message: 'A valid image (JPEG/PNG/GIF) is required' });
  }

  try {
    const existingAd = await prisma.advertisement.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existingAd) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (url) updateData.url = url;
    if (status) updateData.status = status;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (createdBy) updateData.createdBy = parseInt(createdBy);
    if (file) {
      if (existingAd.image) {
        const oldPath = path.join(__dirname, '../', existingAd.image);
        await fs.unlink(oldPath).catch(() => console.warn('Failed to delete old file'));
      }
      updateData.image = `/uploads/advertisements/${file.filename}`;
    }

    const ad = await prisma.advertisement.update({
      where: { id: parseInt(id) },
      data: updateData,
    });
    res.json({ data: ad });
  } catch (error) {
    console.error('Error updating advertisement:', error);
    res.status(500).json({ message: 'Failed to update advertisement' });
  }
};

// DELETE ad
exports.deleteAdvertisement = async (req, res) => {
  const { id } = req.params;

  try {
    const ad = await prisma.advertisement.findUnique({
      where: { id: parseInt(id) },
    });
    if (!ad) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }

    if (ad.image) {
      const filePath = path.join(__dirname, '../', ad.image);
      await fs.unlink(filePath).catch(() => console.warn('Failed to delete file'));
    }

    await prisma.advertisement.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Advertisement deleted successfully' });
  } catch (error) {
    console.error('Error deleting advertisement:', error);
    res.status(500).json({ message: 'Failed to delete advertisement' });
  }
};