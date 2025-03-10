const mongoose = require ('mongoose');
const dotenv = require('dotenv');

// Configure dotenv avant d'importer l'app
dotenv.config();

const app = require('./app');

// Gestion des exceptions non capturées
process.on('uncaughtException', err => {
    console.error('UNCAUGHT EXCEPTION! 💥 Arrêt du serveur...');
    console.error(err.name, err.message);
    process.exit(1);
});

// Configuration de la connexion MongoDB
const DB = process.env.MOGODB_URI;

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology : true
})
.then(()=> console.log('📊 Connexion établie avec succès'))
.catch(err => console.error('X Erreur de connection à MongoDB'));

//Démarrage du serveur
const port = process.env.PORT || 5000;
const server = app.listen(port, ()=> {
    console.log(`🚀 Serveur en cours d'éxecution sur le port ${port} en mode ${process.env.NODE_ENV}`);
});

// Gestion des rejets de promise non gérées
process.on('unhandledRejection', err => {
    console.error('UNHANDLED REJECTION! 💥 Arrêt du serveur...');
    console.error(err.name, err.message);
    server.close(()=> {
        process.exit(1);
    });
});

