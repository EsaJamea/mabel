"use strict";


const path = require("path");
const fs = require('fs');
const { dirname } = require('path');


const appDir = dirname(require.main.filename);
const list_full_path = appDir + '/public/img/topslides/list.json';


module.exports = {

    delSlideGet: async function (req, res) {

        if (!res.locals.isAdmin) {
            //illigal get
            res.redirect('/');
            return;
        }

        try {
            const data = JSON.parse(fs.readFileSync(list_full_path, "utf8"));
            const index = req.query.index;
            const slide = data[index];
            // console.log(index +', '+ JSON.stringify(slide));
            const img_path = appDir + "/public" + slide.src;
            fs.unlinkSync(img_path);

            delete data[index];

            fs.writeFileSync(list_full_path,
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

        // console.log('Start addSlidePost');


        const file = req.files?.imageFile;


        const sub_img_path = "/img/topslides/" + Date.now() + file.name;
        const img_path = appDir + "/public" + sub_img_path;

        const topslidesPath = appDir + "/public/img/topslides";

        if (!fs.existsSync(topslidesPath)) {
            fs.mkdirSync(topslidesPath);
        }

        if (file) {

            file.mv(img_path, (err) => {
                if (!err) {

                    let data;

                    if (fs.existsSync(list_full_path)) {
                        data = JSON.parse(fs.readFileSync(list_full_path, "utf8"));
                    }else{
                        data = [];
                    }

                    data.push({
                        src: sub_img_path,
                        caption: req.body.caption
                    });

                    fs.writeFileSync(list_full_path, JSON.stringify(data), { flag: 'w' });

                    res.redirect('/');
                } else {

                    console.log(err);
                    res.redirect('/');
                }
            });
        } else {
            res.redirect('/');
        }
    }
};