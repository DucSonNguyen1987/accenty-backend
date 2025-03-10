/*
Classe pour créer des erreurs personalisées
*/

const { message } = require("antd");

class AppError extends Error {
    constructor( message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status= `${statusCode}`.startsWith('4') ? 'fail' :'error';
        this.isOperational = true; // Erreur opérationnelle, fiable

        Error.captureStackTrace(this, this.constructor);
    }
}

/*
Wrapper pour capturer les erreurs asynchrones
*/

const catchAsync = fn => {
    return (req,res, next) => {
        fn(req, res, next).catch(next);
    };
};

/*
Gestion des erreurs ValidationError de Mongoose
*/

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Données invalides. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

/*
Gestion des erreurs de champ dupliqué pour MongoDB
*/

const handleDuplicateFieldsDB = err =>{
    const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Valeur dupliquée : ${value}. Veuillez utiliser une autre valeur.`;
    return new AppError(message, 400);
};

/*
Gestion des erreurs CastError de Mongoose
*/

const handleCastErrorDB = err => {
    const message = `Valeur invalide ${err.path} : ${err.value}`;
    return new AppError(message, 400);
};

/*
Gestion des erreurs JWT
*/

const handleJWTError = () => new AppError('Token invalide. Veuillez vous reconnecter.', 401);

/*
Gestion des erreurs d'expiration JWT
*/

const handleJWTExpiredError = () => new AppError('Votre token a expiré. Veuillez vous reconnecter', 401);

/*
Envoi d'erreurs en dev
*/

const sendErrorDev = (err, res)=> {
    res.status(err, statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

/*
Envoi d'erreurs en prod
*/

const sendErrorProd= (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } 
    // Erreur de programmation ou inconnue : ne pas fuiter les détails
    else {
        // Log pour le dev
        console.error('ERREUR 💥', err);
        // Message générique
        res.status(500).json({
            status: 'error',
            message : 'une erreur est survenue. Veuillez réessayer plus tard.'
        });
    }
};

/*
Middleware global de gestion 
*/

const globalErrorHandler = (err, req, res, next) => {
    err.status = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development'){
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production'){
        let error = {...err};
        error.message = err.message;

        // Erreurs spécifiques à Mongoose et MongoDB
        if (err.name === 'CastError') error = handleCastErrorDB(err);
        if (err.code === '11000') error = handleDuplicateFieldsDB(err);
        if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
        if(err.name === 'JsonWebTokenError') error = handleJWTError(err);
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError(err);

        sendErrorProd(error, res);
    }
}