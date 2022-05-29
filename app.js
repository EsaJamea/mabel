const mongoose = require('mongoose');
const express = require('express');
const layouts = require('express-ejs-layouts');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const fileUpload = require("express-fileupload");
const path = require("path");
const config = require("./config");


const homeCtrl = require('./controllers/homeCtrl');
const userCtrl = require('./controllers/userCtrl');
const secsCtrl = require('./controllers/secsCtrl');
const quizeCtrl = require('./controllers/quizeCtrl');


function CreateServer() {

    const app = express();

    app.set('port', config.PORT || 3000);

    // set the view engine to ejs
    app.set('view engine', 'ejs');
    app.set('views', './views');
    app.use(layouts);
    app.use(express.static('public'));
    app.use(fileUpload());

    //Express does not parse the request body for you by default.
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));


    const sessionStore = new MongoDBStore({
        uri: config.MONGO_URI,
        collection: 'sessions'
    });

    // Catch errors
    sessionStore.on('error', function (error) {
        console.log(error);
    });

    app.use(session({
        secret: config.SESSION_SECRET,
        store: sessionStore,
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 2 // 2 day
        }
    }));

    app.use(flash());

    app.use((req, res, next) => {
        res.locals.isAdmin = (req.session?.user?.privilege == 'ADMIN') ?? false;
        next();
    });

    app.get('/', homeCtrl.home);
    app.get('/home', homeCtrl.home);

    app.get('/user/signup', userCtrl.signup);
    app.get('/user/reset', userCtrl.reset);
    app.get('/user/login', userCtrl.login);
    app.get('/user/logout', userCtrl.logout);
    app.get('/user/genCodes', userCtrl.genCodes);

    app.post('/user/signup', userCtrl.creatNewUser);
    app.post('/user/login', userCtrl.authenticate);
    app.post('/user/logout', userCtrl.logoutPost);
    app.post('/user/reset', userCtrl.resetPost);
    app.post('/user/genCodes', userCtrl.genCodes);

    app.get('/secs/new', secsCtrl.creatNewSecGet);
    app.post('/secs/new', secsCtrl.creatNewSecPost);

    app.get('/newquiz', quizeCtrl.creatNewQuizGet);
    app.post('/newquiz', quizeCtrl.creatNewQuizPost);

    app.get('/quiz', quizeCtrl.viewQuiz);

    return app;
}


async function main() {
    try {

        console.log(config);

        const connect = await mongoose.connect(config.MONGO_URI);

        console.log('Mongodb Connected');

        const app = CreateServer();

        const server = app.listen(app.get('port'), () => {

            console.log(`Server running at at http://localhost:${app.get('port')}`)

        });

    } catch (error) {
        console.log(`Creation Error ${error}`)
    }
}

main();
