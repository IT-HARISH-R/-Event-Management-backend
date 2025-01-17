const express = require("express");
const userController = require("../controller/userController");
const auth = require("../middlewares/auth");

const authRouter = express.Router();

authRouter.post("/sing", userController.register);
authRouter.post("/login", userController.login);
authRouter.post("/Forgot-Password", userController.ForgotPassword);
authRouter.post("/reset-password/:token", userController.resetPassword);
authRouter.get("/me", auth.checkAuth,userController.me);


module.exports = authRouter;  