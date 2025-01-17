require("dotenv").config()

const MONGODB_URL = process.env.MONGODB_URL;
const PORT = process.env.PORT;
const SECRET_KEY = process.env.SECRET_KEY;
const EMAIL = process.env.EMAIL;
const PASS = process.env.PASS;
module.exports = {
    MONGODB_URL,
    PORT,
    SECRET_KEY,
    EMAIL,
    PASS
}