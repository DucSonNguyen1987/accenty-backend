/*
Configuration des variables d'environnemnent et vérification de leur présence
*/

const validateEnv= () => {
    const requiredEnvVars = [
        'PORT',
        'MONGO_URI',
        'JWT_SECRET',
        'NODE_ENV'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if(missingEnvVars.length > 0) {
        throw new Error(`Variables d'environnement manquantes : ${missingEnvVars.join(', ')}`);
    }

    // Validation supp des valeurs
    if (process.env.NODE_ENV !== 'development' &&
        process.env.NODE_ENV !== 'production' &&
        process.env.NODE_ENV !== 'test'
    ) {
        throw new Error('NODE_ENV doit être "development", "production" ou "test"');
    }

    // Validation du format URI MongoDB ( validation basique)
    const mongoRegex = /^Mongodb(\+srv)?:\/\/.+/;
    if(!mongoRegex.test(process.env.MONGODB_URI)){
        throw new Error('MONGODB_URI invalide. Format attendu : mongodb://... ou mongodb+srv: //...');
    }

    // Vérification de la sécurité du JWT
    if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32){
        console.log('⚠️ AVERTISSEMENT : JWT_SECRET devrait être plus long (au moins 32 caractères) en production');
    }

    console.log('✅ Variables d\'environnement validées');
};

/*
Récupere une variable d'environnement avec valeur par défaut
*/

const getEnv = (key, defaultValue = undefined) => {
    const value = process.env[key];

    if(value === undefined){
        if(defaultValue === undefined){
            throw new Error(`Variable d'environnement ${key} non définie et aucune valeur par défaut fournie`);
        }
        return defaultValue;
    }
    return value;
};

/*
Récupère un nombre à partir d'une variable d'environnement
*/

const getEnvNumber = (key, defaultValue= undefined) => {
    const value = getEnv(key, defaultValue?.toString());
    const numValue = Number(value);

    if(isNaN(numValue)){
        throw new Error(`Variable d'environnement ${key} n'est pas un nombre valide`);
    }
    return numValue;
};

/*
Récupère un boléen à partir d'une variable d'environnement
*/

const getEnvBoolean= (key, defaultValue= undefined) => {
    const value = getEnv(key, defaultValue?.toString());

    if (value.toLowerCase()=== 'true' || value === '1') return true;
    if(value.toLowerCase() === 'false' || value === '0') return false;

    throw new Error(`Variavle d'environnement ${key} n'est pas un booléen valide`);
};

module.exports = {validateEnv, getEnv, getEnvNumber, getEnvBoolean};