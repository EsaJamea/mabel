'use strict';

const FileModel = require('../models/file')

module.exports = {
    saveFileToDB: async (req, res) => {
        const file = req.files.my_file;

        const image = {
            name: file.name,
            data: file.data,
            mimetype: file.mimetype
        }

        const savedFile = await FileModel.create(image);

        if (savedFile.mimetype == 'image/jpeg') {
            res.send(`<img src="data:${image.mimetype};base64,${savedFile.data.toString('base64')}" >`);
        } else if (savedFile.mimetype == 'text/plain') {
            res.send(`<p> ${savedFile.data.toString()}" </p>`);
        }

    },


}