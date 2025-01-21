const User = require('../models/userModels');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY, EMAIL, PASS } = require('../utlis/config')
const nodemailer = require('nodemailer');


const userController = {
    register: async (request, response) => {
        try {
            const { username, email, password } = request.body

            const user = await User.findOne({ email })

            if (user) {
                return response.json({ message: "This email is already registered" })
            }

            if (!password) {
                throw new Error('Password is required');
            }

            const passwordhash = await bcrypt.hash(password, 10)
            const newuser = new User({ 
                username,
                email,
                password: passwordhash,
            })
            await newuser.save();

            response.json({ status: true, message: "Registered successfully" })
        }
        catch (error) {

            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(val => val.message);
                return response.status(400).json({ message: 'Validation failed', errors: errors });
            }

            response.status(500).json({
                message: 'Server error', error: error.message
            });
        }
    },
    login: async (request, response) => {
        try {

            const { email, password } = request.body;

            const user = await User.findOne({ email })

            if (!user) {
                return response.json({ message: "Invalid  Email" });
            }
            if (!password) {
                return response.json({ message: 'Password is required' });
            }

            const ismatch = await bcrypt.compare(password, user.password);
            if (!ismatch) {
                return response.json({ message: 'Invalid password' });
            }
            const token = await jwt.sign(
                { id: user._id },
                SECRET_KEY,
                { expiresIn: '1h' }
            )
            response.cookie('token', token, { httpOnly: true, maxAge: 360000 })
            return response.json({ status: true, token, message: "logg in successfully" });
        }
        catch (error) {
            response.status(500).json("error", error)
        }
    },
    ForgotPassword: async (request, response) => {
        const { email } = request.body;
        try {
            const user = await User.findOne({ email })
            if (!user) {
                return response.json({ message: "this is not registered" })
            }
            const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '10m' })
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: EMAIL,
                    pass: PASS
                }
            });

            const mailOptions = {
                from: 'youremail@gmail.com',
                to: email,
                subject: 'Reset Password',
                text: `https://task12-password-reset.netlify.app/reset-password/${token}`
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    return response.json({ message: 'error sent email' })
                } else {
                    return response.json({ status: true, message: 'Link sent to your email, expires in 10 minutes' });
                }
            });
        }
        catch (err) {
            return response.json(err)
        }
    },
    resetPassword: async (request, response) => {
        const { token } = request.params;
        const { password } = request.body;
        try {
            const decode = await jwt.verify(token, SECRET_KEY);
            const id = decode.id;
            const hashPassword = await bcrypt.hash(password, 10);
            await User.findByIdAndUpdate({ _id: id }, { password: hashPassword })
            return response.json({ status: true, message: "your Password is Reset" })
        }
        catch (err) {
            return response.json({ message: "your token expired" })
        }
    },
    me: async (request, response) => {

        const {user_id} = request
        try {

            const user = await User.findById(user_id.id);

            if (!user) {
                return response.status(404).json({ message: "user not found" });
            }

            response.json({ user })
        }
        catch (error) {
            response.status(500).json({ message: error.message });
        }
    }

}

module.exports = userController