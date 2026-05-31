const mongoose = require('mongoose');
const skillSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
        trim: true
    },
    level:{
        type: String,
        enum: ['beginner', 'intermediate', 'expert'],
        default:'beginner'
    },
    description:{
        type: String,
        trim: true
    },
});

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email:{
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password:{
        type: String,
        required: [true, 'Password is required'],
        minlength: 6
    },
    avatar:{
        type:String,
        default: ''
    },
    bio:{
        type:String,
        default:'',
        maxlength: 300
    },
    teaches: [skillSchema],
    wantsToLearn: [skillSchema],
    rating:{
        type:Number,
        default: 0
    },
    reviewCount:{
        type:Number,
        default:0
    },
    isOnline:{
        type: Boolean,
        default: false
    }
},
{
    timestamps: true  // Added createdAt and updatedAt automatically
}

);
module.exports = mongoose.model('User', userSchema)