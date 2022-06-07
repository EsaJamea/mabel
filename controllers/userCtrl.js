"use strict";

const locals = require('../locals/locals.json');
const User = require('../models/user');
const Receipt = require('../models/receipt');
const BalanceCards = require('../models/balanceCards');


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
                error: req.flash('errormessage')
            }
        }
        res.render('users/signup.ejs', viewData);
    },

    creatNewUser: function (req, res) {
        User.create({
            name: req.body.username,
            password: req.body.password,
            code: req.body.code
        }).then(user => {
            req.flash('succesmessage', locals.AR.MSG.SIGNUP_SUCCES);
            res.redirect('/user/login');
        }).catch(error => {
            req.flash('errormessage', error.message);
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
                        res.redirect('/home');
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
        if (!res.locals.isAdmin) {
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
        if (!res.locals.isAdmin) {
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
            if (!res.locals.isAdmin) {
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
            if (!res.locals.isAdmin) {
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
        console.log(data);
        res.render('cards/addBalance.ejs', data);
    },

    addBalancePost: async (req, res) => {
        const user = (req.session?.user) ?? undefined;

        if (!user) {
            res.redirect('/');
            return;
        }

        ////Check if the code is correcte and get cards info
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

            await user.save();

            req.session.user = user;

            console.log("Savesettings");
            console.log(req.session.user);
            
            res.send(JSON.stringify({}));

        } catch (error) {
            res.send(JSON.stringify(error));
        }
    }
};