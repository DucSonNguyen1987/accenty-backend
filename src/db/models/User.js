const mongoose = require ('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const userSchema =  new Schema ({

    username : {
        type: String,
        required : [true, 'Le nom d\'utilisateur est requis'],
        unique: true,
        trim : true,
        minLength : [3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères']
    },
    email: {
        type : String,
        required : [true, 'L\'email est requis'],
        unique: true,
        trim: true,
        lowerCase: true,
        match:[/^\$+@\$+\.\S+$/, 'Veuillez fournir un email valide']
    },
    password :{
        type:String,
        required:[true, 'Le mot de passe est requis'],
        minLength : [6, 'Le mot de passe doit contenir au moins 6 caractères']
    },
    role :{
        type: String,
        enum : ['user', 'admin'],
        default : 'user'
    },
    profileImage : {
        type: String,
        default :''
    },
    isActive :{
        type: Boolean,
        default :true
    },
    createdAt : {
        type: Date,
        default: Date.now
    },
    updatedAt : {
        type: Date,
        default: Date.now
    },
    timestamps : true
});

// Middleware de pre-save pour hacher le MDP

userSchema.pre('save', async function(next){
    // Ssi le MDP est nouveau ou modifier alors hacher
    if(!this.isModified('password')) return next();

    try {
        // Génèrer un Salt
        const salt = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Methode pour comparer un MPD et le MDP hashé

userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;