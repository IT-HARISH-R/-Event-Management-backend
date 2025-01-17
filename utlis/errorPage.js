const errorPage = (request, response, next) => {
    console.log("------------------")
    console.log("--------404-------")
    console.log("------------------")
    response.json({ message: "404 Router Not Found" })
}

module.exports = errorPage;