const express = require('express');
const authController = require('../controllers/authController');
const {protect} = requre ('../middlewares/auth.js');
const router = express.Router();



// Routes publiques
router.post('/register', authController.register);
router.post('/login', authController.login);


// Routes protégées (nécessitant d'être connecté)
router.use(protect);
router.get('/me', authController.getMe);
router.patch('/update-password', authController.updatePassword);

module.exports = router;
