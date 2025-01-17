const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../utlis/config");

const auth = {
    checkAuth: (request, response, next) => {
        const token = request.cookies.token
        if (!token) {
            return response.status(401).json({ message: 'Unauthorized' });
        }
        try {
            const decode = jwt.verify(token, SECRET_KEY)

            request.user_id = decode
        }
        catch (err) {
            response.status(500).json({ message: err.message });
        }

        next()
    }
}

module.exports = auth;