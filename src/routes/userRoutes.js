const express = require('express');
const { createUser,
  getAllCustomerUsers,deleteSystemUser,
  getSystemUsers, updateSystemUser,
  getCustomerByEmail,updateUser,deletecustomer,
    loginUser,getCustomersForPaymentForm
    // , getUserById, getAllUsers, updateUser, deleteUser, forgetPassword, changePassword
} = require('../controllers/userController.js');

// const { restrictToRoles } = require('../middleware/rolebasedauth.js');

const router = express.Router();
// restrictToRoles(['SUPERUSER', 'ADMIN']),
router.post('/create',  createUser);
// router.get('/alluser', restrictToRoles(['SUPERUSER', 'ADMIN']), getAllUsers);
// router.get('/getuser/:id', restrictToRoles(['SUPERUSER', 'ADMIN', 'CUSTOMER']), getUserById);
router.post('/login', loginUser);
router.get('/customers', getAllCustomerUsers);
router.get('/systemuser',   getSystemUsers);
router.get('/email',   getCustomerByEmail);
router.put('/systemuser/:id', updateSystemUser);
router.get('/payform', getCustomersForPaymentForm);
router.put('/updateUser/:id', updateUser);
router.delete('/deletesystem/:id', deleteSystemUser);
router.delete('/deletecustomer/:id', deletecustomer);


// router.post('/forget-password', forgetPassword);
// router.post('/change-password', restrictToRoles(['SUPERUSER', 'ADMIN', 'CUSTOMER', 'DATAENTRY']), changePassword);
// router.get('/:id', restrictToRoles(['SUPERUSER', 'ADMIN', 'CUSTOMER']), getUserById);
// router.get('/', restrictToRoles(['SUPERUSER', 'ADMIN']), getAllUsers);
// router.put('/:id', restrictToRoles(['SUPERUSER', 'ADMIN']), updateUser);
// router.delete('/:id', restrictToRoles(['SUPERUSER', 'ADMIN']), deleteUser);

module.exports = router;
