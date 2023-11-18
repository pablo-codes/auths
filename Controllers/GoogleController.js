const axios = require('axios')
const querystring = require('querystring')

const gverify = (req, res) => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${process.env.GOOGLE_REDIRECT}&client_id=${process.env.GOOGLE_CLIENT_ID}&access_type=offline&response_type=code&prompt=consent&scope=email`;
    res.send(authUrl)
}


async function exchangeCodeForTokens(code) {


    let form = querystring.stringify(formData)
    console.log(form)
    const response = await axios.post(tokenUrl, formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    return response.data;
}



async function getUserInfo(accessToken) {
    const userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
    const response = await axios.get(userInfoUrl, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    return response.data;
}

const gcheck = async (req, res) => {
    try {

        const { token } = req.body;


        // Make an authorized API request using the access token
        const userInfo = await getUserInfo(token);

        // // Display user information
        console.log(userInfo)
        res.send(`Hello, ${userInfo.email, userInfo.verified_email, userInfo.picture}!`);
    } catch (error) {
        console.log(error)
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