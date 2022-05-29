"use strict";

const locals = require('../locals/locals.json');
const Section = require('../models/section');
const Quize = require('../models/quize')
const path = require("path");


module.exports = {

    creatNewQuizGet: async function (req, res) {

        if(!res.locals.isAdmin){
            res.redirect('/');
            return;
        }

        const sections = await Section.find({ parent: undefined });

        const secs = [];

        for (const sec of sections) {
            secs.push({ treeView: await sec.toTreeView() })
        }


        const data = {};
        data.title = locals.AR.NEW_QUIZ;
        data.quizename = locals.AR.QUIZ_NAME;
        data.enter = locals.AR.ENTER;
        data.questions = locals.AR.QUESTIONS;
        data.sections = locals.AR.SECTIONS;
        data.message = {};
        data.secs = secs;


        res.render('newquiz', data);
    },


    creatNewQuizPost: function (req, res) {

        if(!res.locals.isAdmin){
            res.redirect('/');
            return;
        }

        const quizObj = {
            name: req.body.quizename,
            targets: req.body.secIds,
            questions: JSON.parse(req.body.questions)
        }

        const newQuize = new Quize(quizObj);

        newQuize.save(function (err, doc) {
            if (!err) {
                console.log(`newQuize saved.`);
            } else {
                console.log(err);
            }
        });
        res.redirect('/newquiz');

    },

    viewQuiz: function (req, res) {
        const quizId = req.query.id;
        Quize.findOne({ _id: quizId }, (err, quize) => {

            if (err || quize == null) {
                res.redirect('/');
                return;
            }



            res.locals.title = quize.name;
            res.locals.quize = quize;

            res.render('quize.ejs');

        });


    }

};