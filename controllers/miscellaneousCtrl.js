"use strict";


const path = require("path");
const fs = require('fs');
const { dirname } = require('path');
const FileModel = require('../models/file')


const appDir = dirname(require.main.filename);

const tempDir = appDir + "/public/temp";

function base64_encode(bitmap) {
    return new Buffer.from(bitmap.data).toString('base64');
}

module.exports = {

    delAdvGet: async function (req, res) {

        if (!res.locals.isAdmin) {
            res.redirect('/');
            return;
        }
        try {
            const downslides = await FileModel.findOne({ name: 'downslides.json' });
            const data = JSON.parse(downslides.data.toString());
            const index = req.query.index;
            const adv = data[index];
            await FileModel.deleteOne({ _id: adv.docID });
            await FileModel.deleteOne({ _id: adv.src });
            delete data[index];
            downslides.data = JSON.stringify(data.filter(adv => adv != undefined))
            await downslides.save();
        } catch (error) {
        } finally {
            res.redirect('/');
        }
    },

    delSlideGet: async function (req, res) {

        if (!res.locals.isAdmin) {
            res.redirect('/');
            return;
        }
        try {
            const topslides = await FileModel.findOne({ name: 'topslides.json' });
            const data = JSON.parse(topslides.data.toString());
            const index = req.query.index;
            const slide = data[index];
            const result = await FileModel.deleteOne({ _id: slide.src });
            delete data[index];
            topslides.data = JSON.stringify(data.filter(slide => slide != undefined))
            await topslides.save();

        } catch (error) {

        } finally {
            res.redirect('/');
        }
    },


    addSlidePost: async function (req, res) {
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
        //topslides.json
        let topslides = await FileModel.findOne({ name: 'topslides.json' });
        if (topslides == null) {
            topslides = await FileModel.create({
                name: 'topslides.json',
                data: Buffer.from(JSON.stringify([]), "utf-8"),
                mimetype: 'application/json'
            });
        }
        const data = JSON.parse(topslides.data.toString());
        data.push({
            src: savedImageFile._id,
            caption: req.body.caption
        });
        topslides.data = Buffer.from(JSON.stringify(data), "utf-8");
        await topslides.save();
        res.redirect('/');
    },

    addDownSlidePost: async function (req, res) {
        if (!res.locals.isAdmin) {
            res.redirect('/');
            return;
        }
        const imageThumb = req.files.thumb;
        const savedThumb = await FileModel.create({
            name: Date.now() + imageThumb.name,
            data: imageThumb.data,
            mimetype: imageThumb.mimetype
        });
        let downslides = await FileModel.findOne({ name: 'downslides.json' });
        if (downslides == null) {
            downslides = await FileModel.create({
                name: 'downslides.json',
                data: Buffer.from(JSON.stringify([]), "utf-8"),
                mimetype: 'application/json'
            });
        }
        const data = JSON.parse(downslides.data.toString());
        data.push({
            src: savedThumb._id,
            docID: res.locals.savedDocId
        });
        downslides.data = Buffer.from(JSON.stringify(data), "utf-8");
        await downslides.save();
        res.redirect('/');
    },

    //All this function is not neccessray.
    //Done automatically on clinet side
    postAcceptorBase64: (req, res) => {
        const location = `data:${req.files.file.mimetype};base64,${base64_encode(req.files.file)}`;
        const result = JSON.stringify({ location });
        res.send(result);
    },

    postAcceptor: (req, res) => {
        //Not Used, Heroku want save permenntly
        const file = req.files.file;
        const uploadsPath = appDir + "/public/img/uploads";
        const sub_img_path = "/img/uploads/" + Date.now() + file.name;
        const img_path = appDir + "/public" + sub_img_path;
        if (!fs.existsSync(uploadsPath)) {
            fs.mkdirSync(uploadsPath);
        }
        if (file) {
            file.mv(img_path, (err) => {
                if (!err) {
                    res.send(JSON.stringify({ location: sub_img_path }));
                } else {

                }
            });
        }
    },

    saveDoc: async (req, res, next) => {
        let savedDoc = await FileModel.findOne({ name: req.body.docName });
        if (savedDoc == null) {
            savedDoc = await FileModel.create({
                name: req.body.docName,
                data: Buffer.from(req.body.doc),
                mimetype: 'text/html'
            });
        } else {
            savedDoc.data = Buffer.from(req.body.doc);
            await savedDoc.save();
        }
        if (req.body.done) {
            res.locals.savedDocId = savedDoc._id;
            next();
        } else {
            res.sendStatus(200);
        }
    },

    viewAdv: async (req, res) => {
        const id = req.query.id;
        const advDoc = await FileModel.findOne({ _id: id });
        if (advDoc != null) {
            res.locals.html_data = advDoc.data.toString();
            res.locals.title = "Advertisment";
            res.render('viewHtmlData');
        } else {
            res.redirect('/');
        }
    },

    schoolDirGet: (req, res) => {
        res.locals.title = "School Directory";
        res.render('tree-editor.ejs');
        return;
    },

    schoolDirPost: async (req, res) => {
        if (!res.locals.isAdmin) {
            res.sendStatus(500);
            return;
        }
        try {
            let schooldir = await FileModel.findOne({ name: 'schooldir.json' });
            if (schooldir == null) {
                schooldir = await FileModel.create({
                    name: 'schooldir.json',
                    data: Buffer.from(JSON.stringify(req.body.tree), "utf-8"),
                    mimetype: 'application/json'
                });
            }else{
                schooldir.data = Buffer.from(JSON.stringify(req.body.tree), "utf-8");
                await schooldir.save();
            }
            res.json({ message: "Successfully Saved", status: 201 });
        } catch (error) {
            res.json({ message: "Error", status: 401 });
        }
        return;
    }
};