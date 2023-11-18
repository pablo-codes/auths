const jwt = require('jsonwebtoken')
const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'Access denied. No token provided' });
    }

    try {
        const token = authHeader.split('Bearer ')[1];
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);

        req.user = decoded;
        next();
    } catch (error) {
        res.send({ status: "fail", message: 'Invalid token' });
    }
};
module.exports = { verifyToken }