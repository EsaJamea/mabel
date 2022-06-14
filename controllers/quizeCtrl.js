"use strict";

const locals = require('../locals/locals.json');
const Section = require('../models/section');
const Quize = require('../models/quize');
const User = require('../models/user');
const path = require("path");


module.exports = {

    deleteQuize: async function (req, res) {
        if (!res.locals.isAdmin) {
            res.redirect('/');
            return;
        }

        try {

            await Quize.deleteOne({ _id: req.query.qid });

        } catch (error) {

            console.log(`deleteQuize error: ${error}`);

        } finally {
            res.redirect('/');
        }
    },

    creatNewQuizGet: async function (req, res) {

        if (!res.locals.isAdmin) {
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

        if (!res.locals.isAdmin) {
            res.redirect('/');
            return;
        }

        const quizObj = {
            name: req.body.quizename,
            targets: req.body.secIds,
            questions: JSON.parse(req.body.questions),
            coast: (req.body.coast - 0)
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

    viewQuiz: async function (req, res) {
        const quizId = req.query.id;
        const quize = await Quize.findOne({ _id: quizId });

        if (quize == null) {
            res.redirect('/');
            return;
        }

        const quizBuyErrMsg = req.flash('quizBuyErrMsg');
        // console.log(quizBuyErrMsg.constructor.name);
        // console.log(quizBuyErrMsg);
        // console.log(`quizBuyErrMsg ${quizBuyErrMsg}`);

        if (quizBuyErrMsg.length != 0) {
            res.locals.quizBuyErr = quizBuyErrMsg;
        }else{
            res.locals.quizBuyErr = false;
        }

        // res.locals.quizBuyErr = false;

        res.locals.title = quize.name;
        res.locals.quize = quize;
        if (res.locals.isSigned) {
            const user = await User.findOne({ name: req.session.user.name });
            res.locals.hasQuizePrevelige = user.quizes.includes(quize._id);
        }

        const viewQuize = (!quize.coast) || (res.locals.isSigned && res.locals.hasQuizePrevelige);
        res.locals.viewQuize = viewQuize;

        res.render('quize.ejs');
    },
    buyQuize: async (req, res) => {
        // console.log('buyQuize');
        const quizId = req.body.qid;
        // console.log(`quizId ${quizId}`);
        const user = await User.findOne({ name: req.session.user.name });
        // console.log(user);
        const quize = await Quize.findOne({ _id: quizId });
        // console.log(quize);
        if (user.balance > quize.coast) {
            user.balance = user.balance - quize.coast;
            if(!user.quizes){
                user.quizes = [];
            }
            user.quizes.push(quizId);
            await user.save();

            req.session.user = user;
        } else {
            req.flash('quizBuyErrMsg', locals.AR.MSG.NOT_ENOUGH_BALANCE);
        }
        res.redirect(`/quiz?id=${quizId}`);
    }
};