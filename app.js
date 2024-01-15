// Import required modules
const express = require('express');
const mongoose = require('mongoose')
const cors = require('cors');
const { Verify, Check, Signup, Signin } = require('./Controllers/EmailController');
const { verifyToken } = require('./Authentication/Auth');
const { gverify, gcheck, gparams } = require('./Controllers/GoogleController');
const { gitverify, gitparams, gitcheck } = require('./Controllers/GithubController');
const { printcon } = require('./print');
const { xverify, xparams } = require('./Controllers/XController');



// Create an Express application
const app = express();

// var corsOptions = ;
let corsOptions;

if (process.env.NODE_ENV === 'production') {

    printcon('running in production mode')
    corsOptions = {
        origin: 'https://francisokpani.com',
        credentials: true,
        optionSuccessStatus: 200
    };
} else {
    printcon('running in development mode')
    corsOptions = {
        origin: 'http://localhost:3000',
        credentials: true,
        optionSuccessStatus: 200
    };
}




mongoose.connect('mongodb://127.0.0.1:27017/login').then(() => {
    printcon("DB Connected Successfully")
}).catch((err) => {
    printcon("Mongo not enabled locally")
    mongoose.connect(process.env.MONGO).then(() => {
        printcon("DB Connected Successfully")
    }).catch((err) => {
        printcon("No internet connection")
        printcon(err)
    })
})

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Define a route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

//Google auth
app.get('/gauth', gverify)
app.post('/api/sessions/oauth/google', gcheck)
app.get('/api/params/oauth/google', gparams)
//Email auth
app.post('/verify', Verify)
app.post('/check', Check)
app.post('/signup', Signup)
app.post('/signin', Signin)
app.post('/test', verifyToken, (req, res) => {
    res.send(req.user)
})
//Github auth
app.get('/gitauth', gitverify)
app.post('/api/params/oauth/github/', gitparams)
//X auth
app.get('/xauth', xverify)
app.post('/api/params/oauth/x/', xparams)
// Start the server
const port = process.env.PORT || 2500;
app.listen(port, () => {
    printcon(`Server is running on port ${port}`);
});
