"use strict";

const locals = require('../locals/locals.json');
const Section = require('../models/section');
const Quize = require('../models/quize')
const path = require("path");
const fs = require('fs');
const { dirname } = require('path');

module.exports = {

    deleteSec: async function (req, res) {

        if (!res.locals.isAdmin) {
            //illigal get
            res.redirect('/');
            return;
        }

        try {
            const sec = await Section.findOne({_id: req.query.sid}); 
            await Section.deleteOne({ _id: req.query.sid });
            const img_path =  dirname(require.main.filename) + "/public" + sec.image;
            fs.unlinkSync(img_path);   
        } catch (error) {
            console.log(`deleteSec error: ${error}`);
        } finally{
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

    creatNewSecPost: function (req, res) {

        if (!res.locals.isAdmin) {
            res.redirect('/');
            return;
        }

        const file = req.files?.imageFile;
        const appDir = dirname(require.main.filename);
        const sub_img_path = "/img/uploads/" + req.body.secname + Date.now() + file.name;
        const img_path = appDir + "/public" + sub_img_path;

        const uploadsPath = appDir + "/public/img/uploads";

        if (!fs.existsSync(uploadsPath)) {
            fs.mkdirSync(uploadsPath);
        }

        if (file) {
            file.mv(img_path, (err) => {
                if (err) {
                    console.log(err);
                    res.redirect('/');
                } else {

                    let sectionObj = {
                        name: req.body.secname,
                        image: sub_img_path,
                        hint: req.body.sechint,
                        notes: req.body.secnotes
                    }
                    if (req.body.parentSecId) {
                        sectionObj.parent = req.body.parentSecId;
                    }


                    const subSecDoc = new Section(sectionObj);

                    subSecDoc.save(function (err, doc) {
                        console.log(`userDoc.save: err: ${err}, doc: `);
                        res.redirect('/');
                    });
                }
            });
        } else {
            res.redirect('/');
        }
    }
};