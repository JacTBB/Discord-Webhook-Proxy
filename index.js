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
const noblox = require('noblox.js')

const DiscordURL = "https://discord.com"

const Whitelist = [
    ['User', 112469017], //JacTBB
    ['Group', 6145535], //BP
    ['User', 669150884], //Arioch
    ['Group', 9032731], //Seward
    ['Group', 5431795], //SCPF
]

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
app.use(async (req, res, next) => {
    const PlaceID = req.headers['roblox-id']

    fetch(`https://apis.roblox.com/universes/v1/places/${PlaceID}/universe`)
    .then(response => response.json())
    .then(async (data) => {
        const UniverseID = data['universeId']

        try {
            const universeInfo = await noblox.getUniverseInfo([ UniverseID ])
            const Type = universeInfo[0]['creator']['type']
            const CreatorID = universeInfo[0]['creator']['id']
            
            for (i of Whitelist) {
                console.log(Type,CreatorID)
                if (i[0] == Type && i[1] == CreatorID) {
                    return next()
                }
            }

            return res.status(401).end()
        }
        catch (error) {
            console.log(error)
            return res.status(401).end()
        }
    })
    .catch(console.error)
})

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