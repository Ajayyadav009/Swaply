const mongoose = require('mongoose');

const avalabiltySchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true

    },
    dayOfWeek:{
        type:Number,
        required: true,
        min:0,
        max:6
    },
    startTime:{
        type: String,
        required:true
    },
    endTime:{
        type: String,
        required: true
    },
    timezone:{
        type: String,
        default:'Asia/kolkata'
    },
    isRecurring:{
        type:Boolean,
        default:true
    },
    isActive:{
        type:Boolean,
        default:true
    },

},
{ timestamps: true }
);
avalabiltySchema.index({ user: 1,  dayOfWeek: 1});
module.exports = mongoose.model('Avalibilty', avalabiltySchema);
