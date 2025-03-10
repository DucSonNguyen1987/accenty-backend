const jwt = require('jsonwebtoken');
const User = require ('../../db/models/User');
const {AppError} = require ('../../utils/errorHandler');

/*
Middleware pour protéger les routes necessitant une authentification
*/

exports.protect = async(req, res, next) => {
    try {
        // 1: Check si le token existe
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next( new AppError('Vous n\'êtes pas cnoonecté(e). Veuillez vous connecter pour accéder à cetteressource', 401));
        }

        // 2 : Check si le token est valide

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3 : Check si le user existe toujours

        const currentUser = await User.findById(decoded.id);

        if (!currentUser){
            return next(new AppError('L\'utilisateur associé à ce token n\'existe plus', 401));
        }

        // 4: Check si le user est actif

        if (!currentUser.isActive) {
            return next(new AppError('Ce compte a été désactivé. Veuillez contacter l\'administrateur.', 403));
        }

        // Attacher le User à la requête
        req.user = currentUser;
        next();
    } catch (error) {
        if (error.name === 'JsonWebToken Error') {
            return next( new AppError('Token invalide. Veuillez vous reconnecter', 401));
        }
        if (error.name === 'TokenExpiredError') {
            return next (new AppError('Votre session a expiré. Veuillez vous reconnecter', 401))
        }
        next (error);
    }
};

/*
Middleware pour restreindre l'accès selon le rôle
*/

exports.restrictTo= (...roles) => {
    return (req, res, next) => {
        // le middleware protect s'éxécute avant celui-ci => req.user existe
        if(!roles.includes(req.user.role)) {
            return next  ( new AppError('Vousn\'avez pas la permission d\'effectuer cette action', 403));
        }
        next();
    };
};