"use strict";


const path = require("path");
const fs = require('fs');
const { dirname } = require('path');


const appDir = dirname(require.main.filename);

const top_list_full_path = appDir + '/public/img/topslides/list.json';
const topslidesPath = appDir + "/public/img/topslides";

const down_list_full_path = appDir + '/public/img/downslides/list.json';
const downslidesPath = appDir + "/public/img/downslides";

module.exports = {

    delAdvGet: async function (req, res) {

        if (!res.locals.isAdmin) {
            //illigal get
            res.redirect('/');
            return;
        }

        try {
            const data = JSON.parse(fs.readFileSync(down_list_full_path, "utf8"));
            const index = req.query.index;
            const slide = data[index];
            // console.log(data);
            // console.log(index +', '+ JSON.stringify(slide));
            const img_path = appDir + "/public" + slide.src;

            fs.unlinkSync(img_path);

            const doc_path = downslidesPath + "/"+slide.docName;
            fs.unlinkSync(doc_path);

            delete data[index];

            fs.writeFileSync(down_list_full_path,
                JSON.stringify(data.filter(slide => slide != undefined)),
                { flag: 'w' });

        } catch (error) {
            console.log(`delAdvGet error: ${error}`);
        } finally {
            res.redirect('/');
        }
    },

    delSlideGet: async function (req, res) {

        if (!res.locals.isAdmin) {
            //illigal get
            res.redirect('/');
            return;
        }

        try {
            const data = JSON.parse(fs.readFileSync(down_list_full_path, "utf8"));
            const index = req.query.index;
            const slide = data[index];
            // console.log(index +', '+ JSON.stringify(slide));
            const img_path = appDir + "/public" + slide.src;
            fs.unlinkSync(img_path);

            delete data[index];

            fs.writeFileSync(down_list_full_path,
                JSON.stringify(data.filter(slide => slide != undefined)),
                { flag: 'w' });

        } catch (error) {
            console.log(`deleteSec error: ${error}`);
        } finally {
            res.redirect('/');
        }
    },


    addSlidePost: function (req, res) {

        if (!res.locals.isAdmin) {
            console.log('Not Admin.');
            res.redirect('/');
            return;
        }

        const file = req.files?.imageFile;

        const sub_img_path = "/img/topslides/" + Date.now() + file.name;

        const img_path = appDir + "/public" + sub_img_path;


        if (!fs.existsSync(topslidesPath)) {
            fs.mkdirSync(topslidesPath);
        }

        if (file) {

            file.mv(img_path, (err) => {
                if (!err) {

                    let data;

                    if (fs.existsSync(top_list_full_path)) {
                        data = JSON.parse(fs.readFileSync(top_list_full_path, "utf8"));
                    } else {
                        data = [];
                    }

                    data.push({
                        src: sub_img_path,
                        caption: req.body.caption
                    });

                    fs.writeFileSync(top_list_full_path, JSON.stringify(data), { flag: 'w' });

                    res.redirect('/');
                } else {

                    console.log(err);
                    res.redirect('/');
                }
            });
        } else {
            res.redirect('/');
        }
    },

    addDownSlidePost: function (req, res) {

        if (!res.locals.isAdmin) {
            console.log('Not Admin.');
            res.redirect('/');
            return;
        }

        const docName =  req.body.docName2 ;

        const thumb = req.files?.thumb;

        const sub_img_path = "/img/downslides/" + Date.now() + thumb.name;

        const img_path = appDir + "/public" + sub_img_path;

        if (!fs.existsSync(downslidesPath)) {
            fs.mkdirSync(downslidesPath);
        }

        if (thumb) {
            thumb.mv(img_path, (err) => {
                if (!err) {
                    let data;
                    if (fs.existsSync(down_list_full_path)) {
                        data = JSON.parse(fs.readFileSync(down_list_full_path, "utf8"));
                    } else {
                        data = [];
                    }
                    data.push({
                        src: sub_img_path,
                        docName: docName
                    });
                    fs.writeFileSync(down_list_full_path, JSON.stringify(data), { flag: 'w' });
                    res.redirect('/');
                } else {
                    console.log(err);
                    res.redirect('/');
                }
            });
        } else {
            res.redirect('/');
        }
    },
   

    postAcceptor: (req, res) => {

        console.log("postAcceptor:");

        const file = req.files.file;

        const uploadsPath = appDir + "/public/img/uploads";
        const sub_img_path = "/img/uploads/"+ Date.now() + file.name;
        const img_path = appDir + "/public" + sub_img_path;

        if (!fs.existsSync(uploadsPath)) {
            fs.mkdirSync(uploadsPath);
        }

        if (file) {
            file.mv(img_path, (err) => {
                if (!err) {
                    res.send(JSON.stringify({ location: sub_img_path }));
                } else {
                    console.log(err);
                }
            });
        }
    },

    saveDoc : (req, res) => {

        console.log(req.body.docName1);

        console.log(req.body.doc);

        if (!fs.existsSync(downslidesPath)) {
            fs.mkdirSync(downslidesPath);
        }

        const docName = downslidesPath + "/" + req.body.docName1 ;

        fs.writeFileSync(docName, req.body.doc, { flag: 'w' });

    },

    viewAdv : (req, res) => {

        const doc = req.query.doc;

        const doc_path = downslidesPath + "/" + doc;

        const html_data = fs.readFileSync(doc_path, "utf8")

        res.locals.html_data = html_data;
        res.locals.title = "Advertisment";
        res.render('viewHtmlData');

        return;
    }
};