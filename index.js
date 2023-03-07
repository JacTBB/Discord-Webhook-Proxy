fetch = require('node-fetch-npm')
const express = require('express')
const rateLimit = require('express-rate-limit')
app = express()
app.use(express.json())
port = process.env.PORT || 8080
app.listen(port, () => {
    console.log(`Rest API listening on port ${port}`)
})
app.set('trust proxy', true)

const DiscordURL = "https://discord.com"

//Rate Limiters
limiter = rateLimit({
	windowMs: 1 * 60 * 1000, //1 Minutes
	max: 10,
	standardHeaders: true,
	legacyHeaders: false,
    handler: function (req, res, next, options) {
        console.log(req.headers['host'],' has reached the rate limit!')

		res.status(options.statusCode).send(options.message)
    },
})

//HTTP
app.get('/', limiter, async (req, res) => {
    res.status(200).json({status: 'Online!'})
})

app.post('/*', limiter, async (request, res) => {
    try {
        const path = request.path
        const finalURL = DiscordURL + path
        fetch(finalURL, {
            method: 'POST',
            headers: {'content-type':'application/json'},
            body: JSON.stringify(request.body)
        })
        .then((response) => {
            console.log(response.status)
            res.status(response.status).end()
        })
        .catch((error) => {
            console.log(error)
            res.status(400).end()
        })
    }
    catch (error) {
        console.log(error)
        res.status(400).end()
    }
})