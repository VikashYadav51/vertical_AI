import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
    {
        fullName : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            index : true,
        },

        email : {
            type : String,
            required : true,
            unique : true
        },

        password : {
            type : String,
            required : [true, 'Password is required']
        },

        role : {
            type : String,
            enum : ['user', 'admin'],
            default : 'user'
        },
        
        googleId: {
            type: String,
        },

        emailVerificationToken: {
            type: String,
        },

        emailVerificationExpires: {
            type: Date,
        },

        isVerified : {
            type : Boolean,
            default : false
        },

        refreshToken : {
            type : String,
        }

    }, {timestamps : true}
);

userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return ;
    }
    const hashingPassword = await bcrypt.hash(this.password, 10);
    this.password = hashingPassword;
    return ;
});

userSchema.methods.isPasswordCorrect = async function(password) {
    const hashedPassword = await bcrypt.compare(password, this.password);
    return hashedPassword;
};

userSchema.methods.accessToken =  async() =>{
    return jwt.sign(
        { 
            _id: this._id,
            email: this.email,
            fullName: this.fullName,
            role: this.role,
        },

        process.env.ACCESS_TOKEN_SECRET,

        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
    );
};

userSchema.methods.refreshTokens =  async () => {
    return jwt.sign(
        {
            _id: this._id,
        },

        process.env.REFRESH_TOKEN_SECRET,

        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    );
};

userSchema.methods.createEmailVerificationToken =  () => {
    const token = crypto.randomBytes(32).toString('hex');

    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
    
    this.emailVerificationExpires = Date.now() + 1000 * 60 * 60; 
    return token;
};


export const User = mongoose.model("User", userSchema);
