"use strict";

const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const fileSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    mimetype: {
        type: String
    },
    data: {
        type: Buffer
    }
});


module.exports = mongoose.model("FileModel", fileSchema);;


