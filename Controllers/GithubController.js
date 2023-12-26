const axios = require('axios')
const querystring = require('querystring')
const { printcon } = require('../print')

const gitverify = (req, res) => {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_REDIRECT}&scope=user&allow_signup=true`
    res.send(authUrl)
}
const gitparams = async (req, res) => {

    try {
        const { code } = req.body
        printcon(req.body)
        const tokenUrl = 'https://github.com/login/oauth/access_token';
        const formData = {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            redirect_uri: process.env.GITHUB_REDIRECT,
            code: code,
        };
        const form = querystring.stringify(formData)
        const response = await axios.post(tokenUrl, form, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },

        })
        printcon(code, response.data)
        const token = querystring.parse(response.data);

        printcon(token.access_token)
        // Make an authorized API request using the access token
        const resp = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${token.access_token}`,
            },
        });
        const respe = await axios.get('https://api.github.com/user/emails', {
            headers: {
                Authorization: `Bearer ${token.access_token}`,
            },
        });
        const emailArray = respe.data.filter((el) => el.primary === true).map((el) => el.email);
        const email = emailArray.length > 0 ? emailArray[0] : '';


        resp.data.email = email
        const userInfo = resp.data;

        // Display user information
        printcon(userInfo)
        res.send(`Hello, ${userInfo}!`);

    } catch (error) {
        printcon(error)
        res.send(error);
    }
    // res.send({ response})
}
const gitcheck = async (req, res) => {


}

module.exports = { gitverify, gitparams, gitcheck }