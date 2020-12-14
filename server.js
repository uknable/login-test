const express = require('express');
const Handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const PORT = process.env.PORT || 5000;
const app = express();

var StoryblokClient = require('storyblok-js-client');
const Storyblok = new StoryblokClient({
    accessToken: "cxBOVdDowPMBH7h41jTGuQtt"
})

Storyblok.get('cdn/stories', {
    version: 'published'
})
    .then((response) => {
        response.data.stories.forEach((story) => {
            console.log(story.name);
        })
    })

app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', (req, res) => { 
    
})

app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    partialsDir: 'views/components'
}));

app.set('view engine', '.hbs')
app.set('views', 'views')


app.listen(PORT, function () {
    console.log(`Server running on port ${PORT}`)
})
