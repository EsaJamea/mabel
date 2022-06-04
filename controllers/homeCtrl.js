'use strict';

const locals = require('../locals/locals.json');
const Quize = require('../models/quize');
const Section = require('../models/section')



module.exports = {
    test: function (req, res) {
        res.render('test.ejs', { name: 'Colin', title: locals.AR.TEST });
    },

    // view sections
    home: async function (req, res) {

        res.locals.isHome = true;

        //check for current section
        const curSecId = req.query.secid;

        try {

            const sec = await Section.findOne({ _id: curSecId });
            const secs = await Section.find({ parent: sec?._id });
            const quizes =await Quize.find({targets:curSecId});

            res.locals.title = sec?.name ?? locals.AR.HOME_PAGE;
            res.locals.secs = secs;
            res.locals.quizes = quizes;
            res.locals.parentId = sec?._id ?? null;

            res.render('home.ejs');

        } catch (error) {
            //cution Loop
            res.redirect('/error');
        }
    }
};