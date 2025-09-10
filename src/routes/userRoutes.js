const express = require('express');
const { createUser,
  getAllCustomerUsers,deleteSystemUser,
  getSystemUsers, updateSystemUser,
  getCustomerByEmail,updateUser,deletecustomer,getMe,
    loginUser,getCustomersForPaymentForm,logoutUser,  getCustomerProfile,
  updateCustomerProfile,
    // , getUserById, getAllUsers, updateUser, deleteUser, forgetPassword, changePassword
} = require('../controllers/userController.js');
const { UserRole } = require('@prisma/client');


const { restrictToRoles } = require('../middleware/rolebasedauth.js');

const router = express.Router();
// restrictToRoles(['SUPERUSER', 'ADMIN']),
router.post('/create',  createUser);
// router.get('/alluser', restrictToRoles(['SUPERUSER', 'ADMIN']), getAllUsers);
// router.get('/getuser/:id', restrictToRoles(['SUPERUSER', 'ADMIN', 'CUSTOMER']), getUserById);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/customers', getAllCustomerUsers);
router.get('/getMe', restrictToRoles([UserRole.SUPERUSER, UserRole.ADMIN, UserRole.CUSTOMER, UserRole.DATAENTRY]),  getMe);
router.get('/systemuser',   getSystemUsers);
router.get('/email',   getCustomerByEmail);
router.put('/updateSystemUser/:id', updateSystemUser);
router.get('/payform', getCustomersForPaymentForm);
router.get('/getCustomerProfile', getCustomerProfile);
router.put('/updateUser/:id', updateUser);
router.put('/updateCustomerProfile/:id', updateCustomerProfile);
router.delete('/deletesystem/:id', deleteSystemUser);
router.delete('/deletecustomer/:id', deletecustomer);


module.exports = router;
