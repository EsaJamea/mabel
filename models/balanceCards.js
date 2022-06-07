"use strict";

const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const Int32 = require("mongoose-int32").loadType(mongoose);

const balanceCardSchema = new Schema(
    {
        code: {
            type: Int32,
            trim: true,
            required: true,
            unique: true
        },
        value: {
            type: Number,
            required: true
        },
        used : {
            type: Boolean
        }
    }
);


balanceCardSchema.statics.generate = async function (num, value) {
    const generated = [];
    const used = false;
    num = parseInt(num);
    while (num > 0) {
        const code = parseInt(Math.random() * 2147483647);
        if (code < 999999999) {
            continue;
        }

        try {
            await balanceCardModel.create({ code , value, used});
            num--;
            generated.push(code);
        } catch (e) {
            console.log(e);
        }
    }
    return generated;
};


const balanceCardModel = mongoose.model("BalanceCard", balanceCardSchema);

module.exports = balanceCardModel;