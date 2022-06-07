"use strict";

const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const Int32 = require("mongoose-int32").loadType(mongoose);
const receipt = require('./receipt');
const bcrypt = require('bcrypt');


const themes = {
    PURPLE: 'PURPLE',
    ORANGE: 'ORANGE',
    BLUE : 'BLUE',
    DARK : 'DARK',

    toArray: function () {
        const result = [];
        Object.keys(this)
            .filter(key => typeof (this[key]) != 'function')
            .forEach(key => result.push(this[key]));
        return result;
    }
};
Object.freeze(themes);

const settingsSchema = new Schema(
    {
        theme: {
            type: String,
            trim: true,
            enum: themes.toArray(),
        }
    }
);


const saltRounds = 10;





const privileges = {
    ADMIN: 'ADMIN',
    PROVIDER: 'PROVIDER',
    USER: 'USER',

    toArray: function () {
        const result = [];
        Object.keys(this)
            .filter(key => typeof (this[key]) != 'function')
            .forEach(key => result.push(this[key]));
        return result;
    }
};
Object.freeze(privileges);


var userSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        code: {
            type: Int32,
            required: true,
            unique: true
        },
        privilege: {
            type: String,
            enum: privileges.toArray(),
            default: 'USER'
        },
        settings: {
            type: settingsSchema
        },
        balance: {
            type: Number
        },
        cards: {
            type: [Int32]
        }
    }
);

userSchema.statics.themes = themes;
userSchema.statics.privileges = privileges;
/**
 * This fuction compares a plain text passwored with hashed one, stored in the field user.password
 * @param {*} password to compare with
 * @param {*} callbck function(err, result)
 * @returns if user didn't pass a callback, this function will return a promise, otherwise will return void 
 */
userSchema.methods.compare = function (password, callbck) {
    console.log(password);
    const user = this;
    if (callbck === undefined) {
        // return promise
        return bcrypt.compare(password, user.password)
    }
    else bcrypt.compare(password, user.password, callbck);
}

userSchema.pre('validate', function (next) {
    const user = this;
    receipt.findOne({ code: user.code })
        .then(e => {
            if (e == null) {
                const err = new Error('101 code not found.');
                console.log(`\t 101 code not found.`);
                err.num = 101;
                next(err);
            } else {
                next();
            }
        })
        .catch(e => {
            const err = new Error('102 Error checking code.');
            console.log(`\t Error checking code.`);
            err.num = 102;
            next(err);
        });
});

userSchema.post('validate', function (user, next) {
    next();
});

userSchema.pre('save', function (next) {
    const user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    console.log('pre hash: ' + user.password);
    bcrypt.hash(user.password, saltRounds).then((hash) => {
        user.password = hash;
        console.log('After hash: ' + user.password);
        next();
    }).catch(e => next(e));
});

userSchema.post('save', function (user, next) {
    next();
});

module.exports = mongoose.model("User", userSchema);
