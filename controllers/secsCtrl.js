"use strict";

const locals = require('../locals/locals.json');
const Section = require('../models/section');
const Quize = require('../models/quize')
const path = require("path");
const fs = require('fs');
const { dirname } = require('path');
const FileModel = require('../models/file')
module.exports = {

    deleteSec: async function (req, res) {
        if (!res.locals.isAdmin) {
            res.redirect('/');
            return;
        }
        try {
            const sec = await Section.findOne({ _id: req.query.sid });
            await FileModel.deleteOne({ _id: sec.image });
            await Section.deleteOne({ _id: req.query.sid });
        } catch (error) {
            console.log(`deleteSec error: ${error}`);
        } finally {
            res.redirect('/');
        }
    },

    creatNewSecGet: function (req, res) {
        if (!res.locals.isAdmin) {
            res.redirect('/');
            return;
        }

        res.locals.parentSecId = req.query.parent ?? null;
        res.locals.title = locals.AR.NEW_SEC;
        res.locals.enter = locals.AR.ENTER;
        res.locals.secname = locals.AR.SEC_NAME;
        res.locals.hint = locals.AR.SEC_HINT;
        res.locals.notes = locals.AR.NOTES;
        res.locals.image = locals.AR.IMAGE;
        res.locals.message = {};

        res.render('secs/new');
    },

    creatNewSecPost: async function (req, res) {

        if (!res.locals.isAdmin) {
            res.redirect('/');
            return;
        }
        const imageFile = req.files.imageFile;
        const savedImageFile = await FileModel.create({
            name: Date.now() + imageFile.name,
            data: imageFile.data,
            mimetype: imageFile.mimetype
        });
        let sectionObj = {
            name: req.body.secname,
            image: savedImageFile._id,
            hint: req.body.sechint,
            notes: req.body.secnotes
        }
        if (req.body.parentSecId) {
            sectionObj.parent = req.body.parentSecId;
        }
        const subSecDoc = await Section.create(sectionObj);
        res.redirect('/');
    }
};