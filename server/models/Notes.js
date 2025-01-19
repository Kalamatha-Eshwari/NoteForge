const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const NoteSchema= new Schema({
  
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title :{
        type :String,
        required : true,
    },
    body :{
       type:String,
       required :true,
    },
    createdAt :{
        type :Date,
        default :Date.now()
    },
    file: {  // Added for PDF storage
        data: Buffer, // Store PDF content as binary data
        contentType: String, // Store content type (MIME type) for PDF
    }
});

module.exports = mongoose.model('Note',NoteSchema)