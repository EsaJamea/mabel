const mongoose = require('mongoose');
const express = require('express');
const layouts = require('express-ejs-layouts');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const fileUpload = require("express-fileupload");
const path = require("path");
const config = require("./config");
const fs = require('fs');


const User = require('./models/user');




const homeCtrl = require('./controllers/homeCtrl');
const userCtrl = require('./controllers/userCtrl');
const secsCtrl = require('./controllers/secsCtrl');
const quizeCtrl = require('./controllers/quizeCtrl');
const misc = require('./controllers/miscellaneousCtrl');
const fileCtrl = require('./controllers/fileCtrl');

const FileModel = require('./models/file')



function CreateServer() {

    const app = express();

    app.set('port', config.PORT || 3000);

    // set the view engine to ejs
    app.set('view engine', 'ejs');
    app.set('views', './views');
    app.use(layouts);
    app.use(express.static('public'));
    app.use(fileUpload());


    app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));


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

    app.use(userCtrl.GeneralInfo);

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
    app.get('/secs/del', secsCtrl.deleteSec);


    app.get('/newquiz', quizeCtrl.creatNewQuizGet);
    app.post('/newquiz', quizeCtrl.creatNewQuizPost);
    app.get('/quize/del', quizeCtrl.deleteQuize);

    app.get('/quiz', quizeCtrl.viewQuiz);
    app.post('/buyquize', quizeCtrl.buyQuize)

    app.post('/addslide', misc.addSlidePost);
    app.get('/delslide', misc.delSlideGet);

    app.get('/addAdvs', (req, res) => {
        res.locals.title = "Add Advertisment";
        res.render('addAdvs.ejs');
    });

    app.post('/postAcceptor', misc.postAcceptor);
    app.post('/postAcceptorBase64', misc.postAcceptorBase64);


    app.post('/addAdvs', misc.saveDoc, misc.addDownSlidePost);
    app.post('/saveDoc', misc.saveDoc);


    app.get('/deladv', misc.delAdvGet);

    app.get('/adv', misc.viewAdv);

    app.get('/genCards', userCtrl.genCardsGet);
    app.post('/genCards', userCtrl.genCardsPost);

    app.get('/addBalance', userCtrl.addBalanceGet);
    app.post('/addBalance', userCtrl.addBalancePost);

    app.post('/savesettings', userCtrl.saveSettings);

    app.get('/schooldir', misc.schoolDirGet);

    app.post('/schooldir', misc.schoolDirPost);

    app.post('/saveFileToDB', fileCtrl.saveFileToDB);


    /////In DB Files

    app.get('/schooldir.json', async (req, res) => {
        let schooldir = await FileModel.findOne({ name: 'schooldir.json' });
        if (schooldir == null) {
            schooldir = await FileModel.create({
                name: 'schooldir.json',
                data: Buffer.from(JSON.stringify([]), "utf-8"),
                mimetype: 'application/json'
            });
        }
        res.send(schooldir.data.toString());
    });

    app.get('/topslides.json', async (req, res) => {
        let topslides = await FileModel.findOne({ name: 'topslides.json' });
        if (topslides == null) {
            topslides = await FileModel.create({
                name: 'topslides.json',
                data: Buffer.from(JSON.stringify([]), "utf-8"),
                mimetype: 'application/json'
            });
        }
        res.send(topslides.data.toString());
    });

    app.get('/downslides.json', async (req, res) => {
        let downslides = await FileModel.findOne({ name: 'downslides.json' });
        if (downslides == null) {
            downslides = await FileModel.create({
                name: 'downslides.json',
                data: Buffer.from(JSON.stringify([]), "utf-8"),
                mimetype: 'application/json'
            });
        }
        res.send(downslides.data.toString());
    });

    app.get('/imgedb', async (req, res) => {
        console.log('/imgedb ' + req.query.id);
        let file = await FileModel.findOne({ _id: req.query.id });
        res.writeHead(200, { 'Content-Type': file.mimetype });
        res.end(file.data, 'binary');
    });

    app.post('/addbonus', userCtrl.addQuizeBonus)

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

