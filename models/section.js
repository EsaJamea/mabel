"use strict";

const mongoose = require("mongoose");
const { Schema } = require("mongoose");



const sectionSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true
        },
        parent: {
            type: Schema.Types.ObjectId,
            ref: "Section",
            trim: true
        },
        image: {
            type: String
        },
        hint: {
            type: String
        },
        notes: {
            type: String
        }
    }
);



sectionSchema.methods.toTreeView = async function () {

    const secs = await Section.find({ parent: this._id });
    let result =null;

    if (secs.length > 0) {
        result = `<span id='${this._id}' class='caret node-content'>${this.name}</span>`;
    }else{
        result = `<span id='${this._id}' class='node-content'>${this.name}</span>`;
    }

    if (secs.length > 0) {
        result = result.concat(`<ul class='nested'>`);

        for (const child of secs) {
            result = result.concat(`<li>`);
            const chs = await child.toTreeView();
            result = result.concat(chs);
            result = result.concat(`</li>`);
        }


        result = result.concat(`</ul>`);
    }

    return result;
}


const Section = mongoose.model("Section", sectionSchema);

module.exports = Section;
