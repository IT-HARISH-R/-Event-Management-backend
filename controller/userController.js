const User = require('../models/userModels');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { EMAIL, PASS, SECRET_KEY } = require('../utlis/config')
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
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Check if user exists
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Invalid Email' });
            }

            if (!password) {
                return res.status(400).json({ message: 'Password is required' });
            }

            // Compare the entered password with the hashed password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid password' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: user._id },
                SECRET_KEY,
                { expiresIn: '1h' }
            );
            console.log("Generated Token:", token);

            // Return the token in the response
            return res.status(200).json({
                status: true,
                token: `Bearer ${token}`,
                message: 'Logged in successfully'
            });
        } catch (error) {
            console.error("Login Error:", error);
            res.status(500).json({ error: 'Internal Server Error' });
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
                text: `http://localhost:5173/reset-password/${token}`
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
        try {
            const userid = request.userId
            const user = await User.findById(userid);
            console.log(user)
            if (!user) {
                return response.status(404).json({ message: "user not found" });
            }

            response.json({ user })
        }
        catch (error) {
            response.status(500).json({ message: error.message });
        }
    },
    getuserbyid: async (request, response) => {
        try {
            const { userid } = request.body;

            // Validate userid
            if (!userid) {
                return response.status(400).json({ message: "Invalid user ID" });
            }

            // Fetch user from the database
            const user = await User.findById(userid).select("-password"); // Exclude password
            console.log(user);

            if (!user) {
                return response.status(404).json({ message: "User not found" });
            }

            response.json({ user });
        } catch (error) {
            console.error("Error fetching user by ID:", error);
            response.status(500).json({ message: "Internal Server Error" });
        }
    }

}

module.exports = userController