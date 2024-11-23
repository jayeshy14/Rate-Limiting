const express = require('express');
const rateLimiter = require('./rateLimiter');
const redisClient = require('./redisClient');

const app = express();
const PORT = 3000;

const apiRateLimit = 100;
const rateLimitPerUser = 1;    //only this much requests per second
const windowSeconds = 30;   // window after which requests get resets
app.use(rateLimiter(apiRateLimit, rateLimitPerUser, windowSeconds));


//starting the server
app.get('/', async (req, res) => {
    res.send("Request successfull!");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });