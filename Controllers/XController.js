const axios = require('axios')
const querystring = require('querystring')
const { printcon } = require('../print')
const user = require('../Models/UserSchema')
const jwt = require('jsonwebtoken')
const otpGenerator = require("otp-generator");
const { encodeBase64 } = require('bcryptjs')


const xverify = (req, res) => {
    const otp = otpGenerator.generate(6)
    const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.X_CLIENT_ID}&redirect_uri=${process.env.X_REDIRECT}&scope=tweet.read%20users.read%20follows.read%20offline.access&state=state&code_challenge=${process.env.X_CODE}&code_challenge_method=plain`
    res.send(authUrl)
}

const xparams = async (req, res) => {

    try {
        const { code } = req.body
        const enc = await btoa(`${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`)
        const tokenUrl = 'https://api.twitter.com/2/oauth2/token';
        const formData = {
            client_id: process.env.X_CLIENT_ID,
            client_secret: process.env.X_CLIENT_SECRET,
            redirect_uri: process.env.X_REDIRECT,
            code: code,
            grant_type: process.env.GRANT_TYPE,
            code_verifier: process.env.X_CODE
        };

        const form = querystring.stringify(formData)

        const response = await axios.post(tokenUrl, form, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${enc}`,
            },

        })

        const token = response.data



        // Make an authorized API request using the access token
        const resp = await axios.get('https://api.twitter.com/2/users/me', {
            headers: {
                Authorization: `Bearer ${token.access_token}`,
            },
        });

        const userInfo = resp.data;
        const tok = jwt.sign(
            { name: userInfo.data.name, username: userInfo.data.username },
            process.env.TOKEN_KEY,
            {
                expiresIn: "30d"
            })
        const data = await user.findOneAndUpdate({ xid: userInfo.data.id }, { username: userInfo.data.name, xname: userInfo.data.username, token: tok }, { upsert: true })
        printcon(`${userInfo.data.name} has been added`)
        res.send({ token: tok, status: true });



    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            printcon(`Error status: ${error.response.status}`);
            printcon(`Error data: ${JSON.stringify(error.response.data)}`);
            res.send({ err: 'X API error', status: false });
        } else if (error.request) {
            // The request was made but no response was received
            printcon(`No response received from X API`);
            res.send({ err: 'No response from X API', status: false });
        } else {
            // Something happened in setting up the request that triggered an Error
            printcon(`Error setting up the request: ${error.message}`);
            res.send({ err: 'Error setting up request', status: false });
        }
    }


}


module.exports = { xverify, xparams }