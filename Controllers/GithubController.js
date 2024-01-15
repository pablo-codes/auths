const axios = require('axios')
const querystring = require('querystring')
const { printcon } = require('../print')
const user = require('../Models/UserSchema')
const jwt = require('jsonwebtoken')

const gitverify = (req, res) => {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_REDIRECT}&scope=user&allow_signup=true`
    res.send(authUrl)
}
const gitparams = async (req, res) => {

    try {
        const { code } = req.body
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

        const token = querystring.parse(response.data);

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

        if (typeof email == 'string') {
            const tok = jwt.sign(
                { email: email },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "30d"
                }
            );
            await user.findOneAndUpdate({ email: userInfo.email }, { username: userInfo.name, gitid: userInfo.id, token: tok, img: userInfo.avatar_url }, { upsert: true })
            printcon(`${userInfo.email} has been added`)
            res.send({ token: tok, status: true });
        }
        else {
            res.send({ status: false, err: 'error in git auth' })
        }

        // Display user information


    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            printcon(`Error status: ${error.response.status}`);
            printcon(`Error data: ${JSON.stringify(error.response.data)}`);
            res.send({ err: 'GitHub API error', status: false });
        } else if (error.request) {
            // The request was made but no response was received
            printcon(`No response received from GitHub API`);
            res.send({ err: 'No response from GitHub API', status: false });
        } else {
            // Something happened in setting up the request that triggered an Error
            printcon(`Error setting up the request: ${error.message}`);
            res.send({ err: 'Error setting up request', status: false });
        }
    }


}


module.exports = { gitverify, gitparams }