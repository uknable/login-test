const express = require('express');
const Handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const PORT = process.env.PORT || 5000;
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const users = []

var StoryblokClient = require('storyblok-js-client');
const Storyblok = new StoryblokClient({
    accessToken: "cxBOVdDowPMBH7h41jTGuQtt"
})

Storyblok.get('cdn/stories', {
    version: 'published'
})
    .then((response) => {
        response.data.stories.forEach(async (story) => {
            if (story.name == "login") {
                users.push({
                    id: Date.now().toString(),
                    username: story.content.username,
                    password: await bcrypt.hash(story.content.password, 10)
                })
            }
        })
    })

const initializePassport = require('./passport-config')
initializePassport(
    passport, 
    username => users.find(user => user.username === username), 
    id => users.find(user => user.id === id)
)

app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: bcrypt.hash(Date.now().toString(), 10).toString(),
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index')
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    partialsDir: 'views/components'
}));

app.set('view engine', '.hbs')
app.set('views', 'views')

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    return res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/')
    }
    next()
}

app.listen(PORT, function () {
    console.log(`Server running on port ${PORT}`)
})
