import mongoose, { Schema } from 'mongoose';

const LibarySchema = new Schema({
    productName: String,
    imageUrl:String,

   
});


export const Libary = mongoose.model('Libary', LibarySchema);