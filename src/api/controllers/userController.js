const userService = require('../../services/userService');
const { catchAsync } = require('../../utils/errorHandler');

/*
Controleur pour gérer les opérations liées aux users
*/

const userController = {

    // Récupérer tous les users (admin)
    getAllUsers : catchAsync( async (req,res) => {
        const options = {
            page: req.query.page,
            limit: req.query.limit,
            sort: req.query.sort
        };

        const {users, pagination} = await userService.getAllUsers(options);

        res.status(200).json({
            status: 'success',
            pagination,
            data: {
                users
            }
        });
    }),

    // Récupérer un user par Id
    getUserById : catchAsync(async (req, res)=>{
        const user = await userService.getUserById(req.params.id);

        res.status(200).json({
            status: 'success',
            data :{user}
        });
    }),

    // MAJ USER
    updateUser : catchAsync(async(req,res)=>{
        // Check si le user modife son profile ou si c'est un admin
        if (req.user.role !== 'admin' && req.params.id !== req.user.id.toString()) {
            return res.status(403).json({
                status: 'error',
                message: 'Vous n\'avez pas la permission de modifier ce profil'
            });
        }

        const user = await userService.updateUser(req.params.id, req.body);

        res.status(200).json({
            status: 'success',
            data: {user}
        });
    }),

    // MAJ role user
    updateUserRole: catchAsync( async(req, res) => {
        const {role}= req.body;

        if(!role){
            return res.status(400).json({
                status: 'error',
                message: 'Veuillez fournir un rôle'
            });
        }

        const user = await userService.updateUserRole(req.params.id, role);

        res.status(200).json({
            status: 'success',
            data: {user}
        });
    }),

    // Désactiver un compte
    deactivateUser: catchAsync (async(req, res) => {
        // Check si le user désactive son propore compte ou si c'est un admin
        if (req.user.role !== 'admin' && req.params.id !== req.user.id.toString()){
            return res.status(403).json({
                status: 'error',
                message: 'Vous n\'avez pas la permission de désactiver ce compte'
            });
        }

        const user=  await userService.deactivateUser(req.params.id);
        res.status(200).json({
            status: 'success',
            data: {user}
        });
    }),

    // Réactiver un compte
    activateUser: catchAsync( async(req,res)=>{
        const user = await userService.activateUser(req.params.id);
        res.status(200).json({
            status: 'success',
            data: {user}
        })
    }),

    // Supprimer un compte (admin)
    deleteUser : catchAsync( async(req, res)=>{
        await userService.deleteUser(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    })
};

module.exports = userController;
