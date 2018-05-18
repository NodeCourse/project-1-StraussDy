const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { database, Post, Note, User } = require('./models');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Sequelize = require('sequelize');

// Create an Express application
const app = express();
// Serve assets from the public folder
app.use(express.static('public'));

// This secret will be used to sign and encrypt cookies
const COOKIE_SECRET = 'cookie secret';

database.sync().then(r => {
    console.log("DB SYNCED");
}).catch(e => {
    console.error(e);
});

// Use Pug for the views
app.set('view engine', 'pug');
// Parse form data content so it's available as an object through
// request.body
app.use(bodyParser.urlencoded({ extended: true }));
// Parse cookies so they're attached to the request as
// request.cookies
app.use(cookieParser(COOKIE_SECRET));

passport.use(new LocalStrategy((username, password, done) => {
    User
    .findOne({
        where: {username, password}
    }).then(function (user) {
        if (user) {
            return done(null, user)
        } else {
            return done(null, false, {
                message: 'Invalid credentials'
            });
        }
    })
    .catch(done);
}));

passport.serializeUser((user, cookieBuilder) => {
    cookieBuilder(null, user.username);
});

passport.deserializeUser((username, cb) => {
    console.log("AUTH ATTEMPT",username);
// Fetch the user record corresponding to the provided email address
User.findOne({
    where : { username }
}).then(r => {
    if(r) return cb(null, r);
else return cb(new Error("No user corresponding to the cookie's email address"));
});
});

// Parse cookies so they're attached to the request as
// request.cookies
app.use(cookieParser(COOKIE_SECRET));

// Parse form data content so it's available as an object through
// request.body
app.use(bodyParser.urlencoded({ extended: true }));

// Keep track of user sessions
app.use(session({
    secret: COOKIE_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Initialize passport, it must come after Express' session() middleware
app.use(passport.initialize());
app.use(passport.session());


app.get('/', (req, res) => {
    Post
        .findAll({ include: [Note] })
        .then(posts => res.render('home', { posts, user: req.user }));
});

app.get('/login', (req, res) => {
    // Render the login page
    res.render('login');
});

app.post('/login',
    // Authenticate user when the login form is submitted
    passport.authenticate('local', {
        // If authentication succeeded, redirect to the home page
        successRedirect: '/',
        // If authentication failed, redirect to the login page
        failureRedirect: '/login'
    })
);

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

app.get('/signin', (req, res) => {
    res.render('signin');
});

app.post('/signin', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const pseudo = req.body.pseudo;
    User
        .create({
            username: username,
            password: password,
            pseudo: pseudo
        })
        .then((user) => {
        req.login(user, () => {
        res.redirect('/');
        })
    })
});

app.post('/api/post', (req, res) => {
    const { title, content } = req.body;
    Post
        .create({ title, content })
        .then(() => res.redirect('/'))
});

app.post('/api/post/:postID/upvote', (req, res) => {
    Note
        .create({ type: 'up', postId: req.params.postID })
        .then(() => res.redirect('/'));
});

app.post('/api/post/:postID/downvote', (req, res) => {
    Note
        .create({ type: 'down', postId: req.params.postID })
        .then(() => res.redirect('/'));
});

app.listen(3000);
