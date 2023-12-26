const axios = require('axios')
const querystring = require('querystring');
const { printcon } = require('../print');

const gverify = (req, res) => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${process.env.GOOGLE_REDIRECT}&client_id=${process.env.GOOGLE_CLIENT_ID}&access_type=offline&response_type=code&prompt=consent&scope=email`;
    res.send(authUrl)
}

async function getUserInfo(accessToken) {

}

const gcheck = async (req, res) => {
    try {

        const { token } = req.body;

        // Make an authorized API request using the access token
        const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const userInfo = response.data;

        // Display user information
        printcon(userInfo)
        res.send(`Hello, ${userInfo.email, userInfo.verified_email, userInfo.picture}!`);
    } catch (error) {
        printcon(error)
        res.status(500).send(error);
    }

}
const gparams = (req, res) => {
    const tokenUrl = 'https://accounts.google.com/o/oauth2/token';
    const formData = {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT,
        grant_type: process.env.GRANT_TYPE,
    };
    res.send({ tokenUrl, formData })
}

module.exports = { gverify, gcheck, gparams }