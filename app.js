const express = require("express");
const path = require("path"); 
const logger = require("./utlis/logger");
const authRouter = require("./routers/authRout");
const errorPage = require("./utlis/errorPage");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const eventRout = require("./routers/eventRouters");
const ticketRoutes = require("./routers/ticketsRout");

const app = express();

app.use(express.json());
app.use(cors(
    {
        origin: 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    }
))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cookieParser())
app.use(logger)
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/event", eventRout);
app.use("/api/v1/ticket", ticketRoutes);

// app.use("/tickets");

app.use(errorPage);
module.exports = app;

