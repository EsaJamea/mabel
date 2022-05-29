"use strict";

const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const mathjax = require('mathjax');

const Int32 = require("mongoose-int32").loadType(mongoose);


(async function(){
    const MathJax = await mathjax.init({ loader: { load: ['input/tex', 'output/svg'] } });
})();

const questionSchema = new Schema(
    {
        problem: {
            type: String,
            trim: true,
            required: true
        },
        ansA: {
            type: String,
            trim: true,
            required: true
        },
        ansB: {
            type: String,
            trim: true,
            required: true
        },
        ansC: {
            type: String,
            trim: true
        },
        ansD: {
            type: String,
            trim: true
        },
        expA: {
            type: String,
            trim: true
        },
        expB: {
            type: String,
            trim: true
        },
        expC: {
            type: String,
            trim: true
        },
        expD: {
            type: String,
            trim: true
        },
        correct:{
            type: Int32,
            enum: [1,2,3,4],
            required: true,
        }
    }
);

questionSchema.pre('save', function (next) {
    const question = this;

    try {
        replaceEqu(question, 'problem');
        replaceEqu(question, 'ansA');
        replaceEqu(question, 'ansB');
        replaceEqu(question, 'ansC');
        replaceEqu(question, 'ansD');
        replaceEqu(question, 'expA');
        replaceEqu(question, 'expB');
        replaceEqu(question, 'expC');
        replaceEqu(question, 'expD');

        next();
        
    } catch (error) {
        next(error);
    }
});


const quizeSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true
        },
        targets: {
            type: [Schema.Types.ObjectId],
            ref: "Section"
        },
        questions: [questionSchema]
    }
);


module.exports = mongoose.model("Quize", quizeSchema);

function replaceEqu(question, key) {

    const regx = new RegExp(/<equ>\s*(.+?)\s*<\/equ>/g);

    if(!question[key]){
        return;
    }
    const matches = question[key].match(regx);
    let newContent = question[key];
    matches?.forEach(element => {
        const tex = element.replace('<equ>', '').replace('</equ>', '');
        const svg = MathJax.tex2svg(tex, { display: true });
        const result = MathJax.startup.adaptor.outerHTML(svg);
        newContent = newContent.replace(element, result);
    });
    question[key] = newContent;
}

