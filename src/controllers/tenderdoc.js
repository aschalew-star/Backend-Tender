const prisma = require('../config/db.js');
const asynerror = require('../utili/asyncerror.js');
const handleError = require('../utili/errorhandle.js');




// Get purchased tender documents
const getPurchasedTenderDocs = asynerror(async (req, res, next) => {
  const { id, type } = req.user;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const search = req.query.search ? String(req.query.search).trim() : '';
  const typeFilter = req.query.type ? String(req.query.type).toUpperCase() : 'ALL';

  if (!id || type !== 'customer') {
    return next(new handleError('User authentication failed or invalid user type', 401));
  }

  if (page < 1 || limit < 1) {
    return next(new handleError('Page and limit must be positive numbers', 400));
  }

  if (typeFilter !== 'ALL' && !Object.values(PRICETYPE).includes(typeFilter)) {
    return next(new handleError(`Invalid type. Allowed types are: ${Object.values(PRICETYPE).join(', ')}`, 400));
  }

  const skip = (page - 1) * limit;

  try {
    const where = {
      customers: { some: { id: parseInt(id) } }, // Filter for documents purchased by the customer
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { title: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(typeFilter !== 'ALL' && { type: typeFilter }),
    };

    const [tenderDocs, total] = await Promise.all([
      prisma.tenderDoc.findMany({
        where,
        select: {
          id: true,
          name: true,
          title: true,
          file: true,
          price: true,
          type: true,
          createdAt: true,
          tenderId: true,
          customers: { select: { id: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tenderDoc.count({ where }),
    ]);

    const formattedTenderDocs = tenderDocs.map(doc => ({
      ...doc,
      createdAt: doc.createdAt.toISOString().split('T')[0],
      customers: doc.customers.length,
    }));

    res.json({
      data: formattedTenderDocs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalDocs: total,
        limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching purchased tender documents:', error);
    return next(new handleError('Error fetching purchased tender documents', 500));
  }
});

// Get purchased bidding documents
const getPurchasedBiddingDocs = asynerror(async (req, res, next) => {
  const { id, type } = req.user;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const search = req.query.search ? String(req.query.search).trim() : '';
  const typeFilter = req.query.type ? String(req.query.type).toUpperCase() : 'ALL';

  if (!id || type !== 'customer') {
    return next(new handleError('User authentication failed or invalid user type', 401));
  }

  if (page < 1 || limit < 1) {
    return next(new handleError('Page and limit must be positive numbers', 400));
  }

  if (typeFilter !== 'ALL' && !Object.values(PRICETYPE).includes(typeFilter)) {
    return next(new handleError(`Invalid type. Allowed types are: ${Object.values(PRICETYPE).join(', ')}`, 400));
  }

  const skip = (page - 1) * limit;

  try {
    const where = {
      customers: { some: { id: parseInt(id) } }, // Filter for documents purchased by the customer
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(typeFilter !== 'ALL' && { type: typeFilter }),
    };

    const [biddingDocs, total] = await Promise.all([
      prisma.biddingDoc.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          company: true,
          file: true,
          price: true,
          type: true,
          tenderId: true,
          customers: { select: { id: true } },
        },
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      prisma.biddingDoc.count({ where }),
    ]);

    const formattedBiddingDocs = biddingDocs.map(doc => ({
      ...doc,
      customers: doc.customers.length,
    }));

    res.json({
      data: formattedBiddingDocs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalDocs: total,
        limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching purchased bidding documents:', error);
    return next(new handleError('Error fetching purchased bidding documents', 500));
  }
});

// Get customer notifications
const getCustomerNotifications = asynerror(async (req, res, next) => {
  const { id, type } = req.user;

  if (!id || type !== 'customer') {
    return next(new handleError('User authentication failed or invalid user type', 401));
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        customerId: parseInt(id),
      },
      select: {
        id: true,
        message: true,
        isRead: true,
        type: true,
        tenderId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedNotifications = notifications.map(notification => ({
      ...notification,
      createdAt: notification.createdAt.toISOString().split('T')[0],
    }));

    res.json({
      data: formattedNotifications,
    });
  } catch (error) {
    console.error('Error fetching customer notifications:', error);
    return next(new handleError('Error fetching customer notifications', 500));
  }
});

module.exports = {
  getPurchasedTenderDocs,
  getPurchasedBiddingDocs,
  getCustomerNotifications,
};