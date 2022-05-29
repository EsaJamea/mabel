"use strict";

const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const Int32 = require("mongoose-int32").loadType(mongoose);

var receiptSchema = new Schema(
  {
    code: {
      type: Int32,
      trim: true,
      required: true,
      unique: true
    }
  }
);



receiptSchema.statics.generate = async function (num) {
  const generated = [];
  num = parseInt(num);
  while (num > 0) {
    const randCode = parseInt(Math.random() * 2147483647);
    if (randCode < 999999999) {
      continue;
    }

    try {
      await receiptModel.create({ code: randCode });
      num--;
      generated.push(randCode);
    } catch (e) {
      console.log(e);
    }
  }
  return generated;
};


const receiptModel = mongoose.model("Receipt", receiptSchema);
module.exports = receiptModel;