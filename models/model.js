const { Timestamp } = require('mongodb')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema(
    {
    
        "name":String,
        "Year":Number,
        "Month":Number,
        "Milano":Number,
        "Serrento":Number,
        "toscano":Number,
        "loggeddetails":Array,
        "time":Array
    },{ timestamps: true })

const user = mongoose.model('fuck',userSchema)
module.exports= user