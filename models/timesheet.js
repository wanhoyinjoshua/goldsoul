const { Timestamp } = require('mongodb')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema(
    {

        "time": Array,
        "name": String

       
       
    },{ timestamps: true })

const user = mongoose.model('user',userSchema)
module.exports= user