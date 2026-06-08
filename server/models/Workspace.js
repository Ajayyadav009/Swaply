const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title:{
        type: String,
        trim: true,
        default: 'Untitled Note'
    },
    content:{
        type:String,
        trim: true,
        default: ''
    },
    addedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},
{ timestamps: true}
);


const goalSchema = new mongoose.Schema({
    text:{
        type: String,
        required: true,
        trim: true
    },
    isCompleted:{
        type: Boolean,
        default: false
    },
    completedAt:{
        type: Date
    },
    addedby:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

}, { timestamps: true});

const resourceSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
        trim: true
    },
    url:{
        type: String,
        required: true,
        trim: true
    },
    addedby:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, { timestamps: true});

const workSpaceSchema = new mongoose.Schema({
    members:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true
    }],
    roomId:{
        type:String,
        required: true,
        unique: true
    },

    notes:[noteSchema],
    goals: [goalSchema],
    resources: [resourceSchema]
}, 
{ timestamps: true });


module.exports = mongoose.model('WorkSpace', workSpaceSchema);
