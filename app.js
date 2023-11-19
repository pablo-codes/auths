// Import required modules
const express = require('express');
const mongoose = require('mongoose')
const cors = require('cors');
const { Verify, Check, Signup, Signin } = require('./Controllers/EmailController');
const { verifyToken } = require('./Authentication/Auth');
const { gverify, gcheck, gparams } = require('./Controllers/GoogleController');
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy


// Create an Express application
const app = express();

// var corsOptions = ;
let corsOptions;

if (process.env.NODE_ENV === 'production') {
    // Production configuration
    corsOptions = {
        origin: 'https://lo',
        credentials: true,
        optionSuccessStatus: 200
    };
} else {
    console.log('running in development mode')
    corsOptions = {
        origin: 'http://localhost:3000',
        credentials: true,
        optionSuccessStatus: 200
    };
}




mongoose.connect('mongodb://127.0.0.1:27017/login').then(() => {
    console.log("DB Connected Successfully")
}).catch((err) => {
    console.log("Mongo not enabled locally")
    mongoose.connect(process.env.MONGO).then(() => {
        console.log("DB Connected Successfully")
    }).catch((err) => {
        console.log("No internet connection")
        console.log(err)
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
// Start the server
const port = process.env.PORT||2500;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
