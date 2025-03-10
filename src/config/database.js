const mongoose = require('mongoose');

/*
Fonction de connection à MongoDB
*/

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser : true,
            useUnifiedTopology : true
        });

        console.log(`📊 MongoDb connecté : ${conn.connection.host}`);
        return conn;
    } catch(error) {
        console.log(`X Erreur : ${error.message}`);
        process.exit(1);
    }
};

/*
Fonction de fermeture de la connexion MongoDB
*/

const closeDB = async () => {
    try {
        await mongoose.connection.close();
        console.log('📊 MongoDB déconnecté');
    } catch (error) {
        console.log(`X Erreur : ${error.message}`);
        process.exit(1);
    }
};

/*
Fonction pour vider la DB (utile pour les tests)
Ne fonctionne qu'en environnement de test ou de dev
*/

const clearDB = async () => {
    if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'development'){
        throw new Error('Cette opération n\'est autorisée qu\'en environnement de test ou de développement');
    }
    try {
        const collections = mongoose.connection.collections;
        for (const key in collection) {
            const collection = collections[key];
            await collection.deleteMany({});
        }
        console.log('📊 Base de données nettoyée')
    } catch (error){
        console.error(`X Erreur de nettoyage : ${error.message}`);
    }
};

module.exports = {connectDB, closeDB, clearDB};