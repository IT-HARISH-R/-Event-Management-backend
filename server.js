const app = require("./app");
const mongoose = require("mongoose");
const {MONGODB_URL, PORT } = require("./utlis/config");

const port = PORT || 4000
mongoose.connect(MONGODB_URL)
    .then(() => {
        console.log("Connecting database")
        app.listen(port || 4000, () => {
            console.log("server run");
        })
    })
    .catch((error) => {
        console.log(error)
    })
