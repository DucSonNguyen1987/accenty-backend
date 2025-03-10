const { message } = require('antd');
const authService = require ('../../services/authService');
const { catchAsync} = require ('../../utils/errorHandler');

/*
Contôleur pour gérer les fonctionnalités d'authentification
*/

const authController = {
    
    // Inscription d'un new User
    register : catchAsync (async( req, res) => {
        const {user, token} = await authService.register(req.body);

        res.status(201).json({
            status : 'success',
            data: {
                user, 
                token
            }
        });
    }),
    // Connexion d'un User
    login : catchAsync (async(req, res) => {
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Veuillez fournir un email et un mot de passe'
            });
        }

        const {user, token} = await authService.login(email, password);

        res.status(200).json({
            status: 'success',
            data: {user, token}
        });
    }),
    // Obtenir le profil du User connecté
    getMe : catchAsync (async(req, res) => {
        // req.user défini par le middleware protect

        res.status(200).json({
            status :'success',
            data: {
                user : req.user
            }
        });
    }),
    // MAJ du MDP
    updatePassword : catchAsync(async(req,res)=> {
        const {currentPassword, newPassword} = req.body;

        if(!currentPassword || !newPassword) {
            return res.status(400).json({
                status : 'error',
                message :'Veuillez fournir le mot de passe actuel et le nouveau mot de passe'
            });
        }

        const user = await authService.updatePassword(
            req.user._id,
            currentPassword,
            newPassword
        );

        res.status(200).json({
            status : 'success',
            data: {user}
        });
    })
};

module.exports = authController;