const jwt = require ('jsonwebtoken');
const User = requre ('../db/models/User.js');
const {AppError} = require ('../utils/errorHandler');

/*
Service d'authentification poiur gérer l'inscription, la connexion etc...
*/

class AuthService {

    // Inscription d'un nouvel user

    async register (userData) {
        // Check si le user existe déja
        
        const existingUser = await User.findOne({
            $or : [
                {email : userData.email},
                {useename : userData.username}
            ]
        });

        if (existingUser) {
            throw new AppError ('Cet email ou nom d\'utilisateur est déjà utilisé', 400);
        }

        // Créer un nouvel user
        const newUser = await User.create(userData);

        // Générer un token JWT
        const token = this.generateToken(newUser._id, newUser.role);

        return {
            user : newUser,
            token
        };
    }

    // Connexion d'un user

    async login (email, password) {
        // Check si le user existe
        const user = await User.findOne({email});

        if(!user || !(await user.comparePassword(password))) {
            throw new AppError( 'Email ou mot de passe incorrect', 401);
        }

        if (!user.isActive) {
            throw new AppError('Ce compte a été désactivé', 403);
        }

        // Génère un Token
        const token = this.generateToken(user._id, user.role);

        return { user, token};
    }

    // Génération d'un token
    generateToken(userId, role) {
        return jwt.sign(
            {id: userId, role},
            process.env.JWT_SECRET,
            {expiresIn: '7d'}
        );
    }

    // Récupération des user datas par son ID
    async getUserById (userId) {
        const user = await User.findById(userId);

        if(!user) {
            throw new AppError('Utilisateur non trouvé', 404)
        }

        return user;
    }

    //MAJ du MDP
    async updatePassword (userId, currentPassword, newPassword) {
        const user = await User.findById(userId);

        if(!user) {
            throw new AppError('Utilisateur non trouvé', 404);
        }

        // Check si le MDP actuel est correct
        if (!(await user.comparePassword(currentPassword))) {
            throw new AppError('Mot de passe actuel incorrect', 401);
        }

        // MAJ du MDP
        user.password = newPassword;
        await user.save();
        return user;
    }
}

module.exports = new AuthService();