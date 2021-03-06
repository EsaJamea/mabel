"use strict";

const locals = require('../locals/locals.json');
const User = require('../models/user');
const Receipt = require('../models/receipt');
const BalanceCards = require('../models/balanceCards');
const { TimeSpan } = require('../utlis');


function paresRedirect(path){
    if(!path){
        return false;
    }
    if(path.startsWith('qid_')){
        return '/quiz?id='+path.replace('qid_', '');
    }
    return false;
}

module.exports = {

    signup: function (req, res) {
        if (req.session.user) {
            res.redirect('/user/logout');
            return;
        }
        const viewData = {
            code: locals.AR.CODE,
            username: locals.AR.USER_NAME,
            title: locals.AR.SIGNUP,
            password: locals.AR.PASSWORD,
            enter: locals.AR.ENTER,
            message: {
                error: req.flash('errormessage'),
                errorcode: req.flash('errorcode'),
                mean_reset: locals.AR.mean_reset
            }
        }
        res.render('users/signup.ejs', viewData);
    },

    creatNewUser: function (req, res) {
        User.create({
            name: req.body.username,
            password: req.body.password,
            code: req.body.code,
            settings : {
                theme : 'DARK'
            }
        }).then(user => {
            req.flash('succesmessage', locals.AR.MSG.SIGNUP_SUCCES);
            res.redirect('/user/login');
        }).catch(error => {
            // console.log(JSON.stringify(error, null, 2));
            req.flash('errormessage', error.message);
            req.flash('errorcode', error.num);
            res.redirect('/user/signup');
        });
    },

    reset: function (req, res) {
        if (req.session.user) {
            res.redirect('/user/logout');
            return;
        }
        res.render('users/reset.ejs', {
            code: locals.AR.CODE,
            username: locals.AR.USER_NAME,
            title: locals.AR.RESET,
            password: locals.AR.PASSWORD,
            enter: locals.AR.ENTER,
            message: {
                error: req.flash('errormessage')
            }
        });
    },

    resetPost: function (req, res) {
        User.findOne({ code: req.body.code })
            .then(user => {
                if (user == null) {
                    req.flash('errormessage', 'code error not found');
                    res.redirect('/user/reset');
                    return;
                }
                user.name = req.body.username;
                user.password = req.body.password;

                console.log(user);

                user.save(function (err, doc) {
                    if (err) {
                        req.flash('errormessage', `saving error ${err.message}`);
                        res.redirect('/user/reset');
                    } else {
                        req.flash('succesmessage', locals.AR.MSG.RESET_SUCCES);
                        res.redirect('/user/login');
                    }
                });
            })
    },

    login: function (req, res) {
        const redirect = req.query.redirect;
        if (req.session.user) {
            res.redirect('/user/logout');
            return;
        }
        const data = {
            code: locals.AR.CODE,
            username: locals.AR.USER_NAME,
            title: locals.AR.LOGIN,
            password: locals.AR.PASSWORD,
            enter: locals.AR.ENTER,
            signup: locals.AR.SIGNUP,
            forgetpwd: locals.AR.FORGET_PWD,
            redirect,
            message: {
                error: req.flash('errormessage'),
                succes: req.flash('succesmessage')
            }
        };
        res.render('users/login.ejs', data);
    },

    logout: function (req, res) {
        if (!req.session.user) {
            res.redirect('/user/login');
            return;
        }
        const data = {
            welcome: locals.AR.WELCOME,
            userNameVal: req.session.user.name,
            title: locals.AR.LOGOUT
        };
        res.render('users/logout.ejs', data);
    },

    logoutPost: function (req, res) {
        req.session.user = undefined;
        res.redirect('/user/login');
    },

    authenticate: function (req, res) {
        const redirect = paresRedirect(req.body.redirect) || '/';
        User.findOne({ name: req.body.username })
            .then(user => {
                if (user == null) {
                    req.flash('errormessage', locals.AR.WRONG_USERNAME);
                    res.redirect('/user/login');
                    return;
                }
                user.compare(req.body.password).then(match => {
                    if (match) {
                        req.session.user = user;
                        res.redirect(redirect);
                    } else {
                        req.flash('errormessage', locals.AR.WRONG_PASSWORD);
                        res.redirect('/user/login');
                    }
                })
            })
            .catch(error => {
                req.flash('errormessage', error.message);
                res.redirect('/user/login');
            });
    },

    genCardsGet: function (req, res) {
        if (!(res.locals.isAdmin || res.locals.isManager)) {
            res.redirect('/');
            return;
        }
        const viewData = {
            result: locals.AR.RESULT,
            requestedNum: locals.AR.REQUESTED_NUM,
            title: locals.AR.GEN_CARDS,
            cardValue: locals.AR.CARD_VALUE,
            message: {
                error: req.flash('errormessage')
            }
        }
        res.render('cards/genCards.ejs', viewData);
    },

    genCardsPost: function (req, res) {
        if (!(res.locals.isAdmin || res.locals.isManager)) {
            res.send(JSON.stringify('error not admin'));
            return;
        }
        try {
            BalanceCards.generate(req.body.num, req.body.value).then((list) => {
                res.send(JSON.stringify(list));
            }).catch(error => {
                res.send(JSON.stringify(error));
                console.log(`error: ${error}`);
            });
        } catch (error) {
            res.send(JSON.stringify(error));
        }
    },

    genCodes: function (req, res) {
        if (req.method == 'GET') {
            if (!(res.locals.isAdmin || res.locals.isManager)) {
                res.redirect('/');
                return;
            }
            const viewData = {
                result: locals.AR.RESULT,
                requestedNum: locals.AR.REQUESTED_NUM,
                title: locals.AR.GEN_CODE,
                message: {
                    error: req.flash('errormessage')
                }
            }
            res.render('users/genCodes.ejs', viewData);
        } else if (req.method == 'POST') {
            if (!(res.locals.isAdmin || res.locals.isManager)) {
                res.send(JSON.stringify('error not admin'));
                return;
            }
            try {
                Receipt.generate(req.body.num).then((list) => {
                    res.send(JSON.stringify(list));
                }).catch(error => {
                    res.send(JSON.stringify(error));
                    console.log(`error: ${error}`);
                });
            } catch (error) {
                res.send(JSON.stringify(error));
            }
        }
    },

    addBalanceGet: (req, res) => {
        const signed = (req.session?.user !== undefined) ?? false;
        if (!signed) {
            res.redirect('/');
            return;
        }
        const data = {
            code: locals.AR.CODE,
            title: 'Add Balance',
            enter: locals.AR.ENTER,
            message: {
                error: req.flash('errormessage'),
                succes: req.flash('succesmessage')
            }
        };
        // console.log(data);
        res.render('cards/addBalance.ejs', data);
    },

    addBalancePost: async (req, res) => {
        const user = (req.session?.user) ?? undefined;

        if (!user) {
            res.redirect('/');
            return;
        }

        ////Check if the code is correct and get cards info
        try {

            const card = await BalanceCards.findOne({ code: req.body.code });
            const userdoc = await User.findOne({ name: user.name });

            if (card == null) {
                req.flash('errormessage', 'Code Not Found!');
                res.redirect('/addBalance');
                return;
            }
            if (card.used) {
                req.flash('errormessage', 'Code Already Used!');
                res.redirect('/addBalance');
                return;
            }

            card.used = true;

            if (!userdoc.cards) {
                userdoc.cards = [];
            }
            if (!userdoc.balance) {
                userdoc.balance = 0;
            }
            userdoc.cards.push(card.code);
            userdoc.balance += card.value;

            await card.save();
            await userdoc.save();

            req.session.user = userdoc;

            req.flash('succesmessage', 'Successed!');

        } catch (error) {
            req.flash('errormessage', error.message);
            res.redirect('/addBalance');
        }

        res.redirect('/addBalance');
    },

    saveSettings: async (req, res) => {
        if (!res.locals.isSigned) {
            res.send(JSON.stringify('error not Signed'));
            return;
        }

        try {

            const username = req.session.user.name;

            const settings = req.body;

            const user = await User.findOne({name: username});

            user.settings = settings;

            console.log(settings);

            console.log("Savesettings Start");

            await user.save();

            req.session.user = user;

            // console.log("Savesettings Saved");

            // console.log(req.session.user);
            
            res.send(JSON.stringify({}));

        } catch (error) {
            console.log(error);
            res.send(JSON.stringify(error));
        }
    },

    GeneralInfo: async (req, res, next) => {

        console.log(`GeneralInfo`);

        res.locals.isSigned = (req.session?.user != undefined) ?? false;

        console.log(`GeneralInfo res.locals.isSigned ${res.locals.isSigned}`);

        if (res.locals.isSigned) {
            res.locals.user = req.session.user;
            res.locals.timebonus = 0;
        }

        console.log(`GeneralInfo res.locals.user ${res.locals.user}`);

        res.locals.isAdmin = (req.session?.user?.privilege == 'ADMIN') ?? false;
        res.locals.isManager = (req.session?.user?.privilege == 'MANAGER') ?? false;
        res.locals.isHome = false;

        if (res.locals.isSigned) {

            if (!req.session.stime) {
                req.session.stime = Date.now();
            }

            console.log(`GeneralInfo req.session.stime ${req.session.stime}`);

            const diff = Date.now() - req.session.stime;

            const timeSpan = new TimeSpan(diff);

            console.log(`GeneralInfo timeSpan.seconds ${timeSpan.seconds}`);

            if ((timeSpan.minutes > 1) && (timeSpan.minutes < 40)){
                req.session.stime = Date.now();
                res.locals.timebonus = Math.ceil(Math.sqrt(timeSpan.seconds));
                //Add Bonus To User
            }

            if(timeSpan.minutes >= 40){
                req.session.stime = Date.now();
            }

            if(res.locals.timebonus > 0){
                console.log(`res.locals.timebonus ${res.locals.timebonus}`);
                await addScore(req, res, res.locals.timebonus);
            }
        }

        next();
    },
    addQuizeBonus : async (req, res) => {
        
        await addScore(req, res, parseInt(req.body.bonus));

        res.writeHead(200);
        res.end();
    }
};

async function addScore(req, res, score){
    const user = await User.findOne({ name: req.session.user.name });
    user.score = user.score + score;
    await user.save();
    //update
    req.session.user = user;
    res.locals.user = user;
}