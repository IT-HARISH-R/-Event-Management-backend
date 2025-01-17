const app = require("./app");
const mongoose = require("mongoose");
const {MONGODB_URL, PORT } = require("./utlis/config");

mongoose.connect(MONGODB_URL)
    .then(() => {
        console.log("Connecting database")
        app.listen(PORT, () => {
            console.log("server run");
        })
    })
    .catch((error) => {
        console.log(error)
        console.log(mongobd_url)
    })
