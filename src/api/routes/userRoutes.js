const express = require('express');
const useController = require('../controllers/userController');
const { protect, restrictTo} = require('../middlewares/auth');
const userController = require('../controllers/userController');
const router = express.Router();

// Prtoéger toutes les routes
router.use(protect);

//Routes accessibles aux users standard pour leur propre compte
router.get('/:id', userController.getUserById);
router.patch('/:id', userController.updateUser);
router.patch('/:id/deactivate', userController.deactivateUser);

// Routes accessibles uniquement aux admin
router.get('/', restrictTo('admin'), userController.getAllUsers);
router.patch('/:id/activate', restrictTo('admin'), userController.activateUser);
router.patch('/:id/role', restrictTo('admin'), userController.updateUserRole);
router.delete('/:id', restrictTo('admin'), userController.deleteUser);

module.exports= router;