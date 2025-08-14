const express=require('express');
const {  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
    } = require('../controllers/notification');

const notification = express.Router();


notification.get('/all', getNotifications);
notification.put('/mark-all-read', markAllNotificationsRead);
notification.put('/:id/read', markNotificationRead);
notification.delete('/:id', deleteNotification);
// notification.get('/getpayment/:id', deletePayment);
// notification.patch('/:id/approve',approvePayment)
// notification.patch('/:id/rejected',rejectPayment)

module.exports=notification;