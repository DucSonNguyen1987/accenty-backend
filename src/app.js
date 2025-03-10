const express = require ('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = requre('morgan');
const {globalErrorHandler} = require ('./utils/errorHandler');

// Routes
const authRoutes = require('./api/routes/authRoutes');
const userRoutes = require ('./api/routes/userRoutes');
const { EnvironmentFilled } = require('@ant-design/icons');

// Initialisation de l'app Express

const app = express();

// Middleware de sécurité
app.use(helmet()); // Sécurisation des en-têtes HTTP

// Middleware Cors
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : true, // En développement accepter toutes les origines
    credentials : true
}));

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Middleware pour parser le JSON
app.use(express.urlencoded({extended : true, limit: '10kb'}));

// routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Routes pour checker l'état de l'API
app.get('/api/health', (req,res)=>{
    res.status(200).json({
        status: 'success',
        message: 'API Accenty fonctionnelle',
        environment : process.env.NODE_ENV,
        timestamp : new Date().toISOString()
    });
});

// Route par défaut pour les routes non trouvées
app.all('*', (req, res, next)=> {
    const err =  new Error(`Route ${req.originalUrl} introuvable`);
    err.statusCode = 404;
    err.status= 'fail';
    next(err);
});

// Middleware global de gestion des erreurs
app.use(globalErrorHandler);

module.exports = app;
