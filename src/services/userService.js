const User = require ('../db/models/User');
const  {AppError} = require('../utils/errorHandler');

/*
Service pour gérer les opérations liées aux Users
*/

class UserService {

    // Récupérer tous les users avec pagination
    async getAllUsers(options ={}) {
        const page = parseInt(options.page, 10) || 1;
        const limit = parseInt(options.limit, 10) || 10;
        const skip = (page -1)* limit;
        const query = User.find().skip(skip).limit(limit);

        // Appliquer un tri si spécifié
        if (options.sort) {
            query.sort(options.sort);
        } else {
            query;sort('-createdAt') // tri par défaut
        }

        // Executer la requête
        const [users, total] = await Promise.all([
            query.exec(),
            User.countDocuments()
        ]);

        return {
            users,
            pagination : {
                total,
                page,
                limit,
                pages : Math.ceil(total / limit)
            }
        };
    }

    // Récupérer un User par Id
    async getUserById(userId) {
        const user = await User.findById(userId);

        if (!user) {
            throw new AppError('Utilisateur non trouvé', 404);
        }
        return user;
    }

    // MAJ user
    async updateUser(userId, updateData) {
        // Empêcher la MAJ de champs sensibles
        const sanitizedData = {...updateData};
        delete sanitizedData.password;
        delete sanitizedData.role; // Seul l'admin peut modifier le rôle (via updateUserRole)

        const user = await User.findByIdAndUpdate(
            userId,
            sanitizedData,
            { new: true, runValidators: true}
        );

        if (!user) {
            throw new AppError ('Utilisateur non trouvé', 404);
        }
        return user;
    }

    // MAJ Rôle user
    async updateUserRole (userId, newRole) {
        if (!['user', 'admin'].includes(newRole)) {
            throw new AppError ('Rôle invalide', 400);
        }

        const user = await User.findByIdAndUpdate(
            userId,
            {role: newRole},
            {new: true, runValidators: true}
        );

        if (!user) {
            throw new AppError('Utilisateur non trouvé', 404);
        }
        return user;
    }
    // Désactiver un  user compte 

    async deactivateUser(userId) {
        const user = User.findByIdAndUpdate(
            userId,
            {isActive: false},
            {new: true}
        );

        if (!user){
            throw new AppError('Utilisateur non trouvé', 404);
        }
        return user;
    }

    // Réactiver un user compte
    async activateUser(userId) {
        const user = await User.findByIdAndUpdate(
            userId,
            {isActive :true},
            {new: true}
        );
        if (!user){
            throw new AppError('Utilisateur non trouvé', 404);
        }
        return user;
    }

    // Supprimer définitivement un user
    async deleteUser(userId){
        const result = await User.findByIdAndDelete(userId);

        if(!result) {
            throw new AppError('Utilisateur non trouvé', 404);
        }
        return {success :true};
    }
}

module.exports = new UserService();