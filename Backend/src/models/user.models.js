import mongoose from 'mongoose';

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

userSchema.methods.accessToken = function () {
    return jwt.sign(
        { 
            _id: this._id,
            email: this.email,
            userName: this.userName,
            fullName: this.fullName,
        },

        process.env.ACCESS_TOKEN_SECRET,

        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
    );
};

userSchema.methods.refreshTokens = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName,
            fullName: this.fullName,
        },

        process.env.REFRESH_TOKEN_SECRET,

        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    );
};


export const User = mongoose.model("User", userSchema);