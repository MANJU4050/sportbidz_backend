const jwt = require('jsonwebtoken')

const verifyTokenSocket = async (cookies) => {

    return new Promise((resolve, reject) => {
        const cookieObj = cookies.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.split('=').map(c => c.trim());
            acc[key] = value;
            return acc;
        }, {});

        const token = cookieObj.token;

        if (!token) {
            return reject(new Error("Token is missing from cookies"));
        }

        jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
            if (err) {
                return reject(new Error("Failed to verify token"));
            }

            resolve(decoded);
        });
    });
}

module.exports = verifyTokenSocket