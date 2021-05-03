const { Timestamp } = require('mongodb')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema(
    {
    
        "residentname":String,
        "entryno":Number,
        "activitygenre":String,
        "activitydescription":String,
        "outcomegenre":String,
        "outcomedescription":String,
        "time":Number,
        "month":Number,
        "date":Number,
        "year":Number,
        "whodidthis":String
        
    },{ timestamps: true })

const residentprofile = mongoose.model('residentprofile',userSchema)
module.exports= residentprofile