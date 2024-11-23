const redisClient = require('./redisClient');

const rateLimiter = (apiRateLimit, rateLimitPerUser, windowSeconds) => {
    return async (req, res, next) => {
        const clientId = req.ip;
        const redisKey = `redis-${clientId}`;
        const globalRedisKey = `global:rate-limit`;

        try {
            const totalRequests = await redisClient.get(globalRedisKey);
            const clientRequests = await redisClient.get(redisKey);

            if(totalRequests>apiRateLimit){
                const ttl = await redisClient.ttl(globalRedisKey);
                return res.status(429).json({
                    error: 'Too Many Requests',
                    message: `Rate limit exceeded! please try after ${ttl} seconds!`,
                })
            }
            if(clientRequests>rateLimitPerUser){
                const ttl = await redisClient.ttl(redisKey);
                return res.status(429).json({
                    error: 'Too Many Requests',
                    message: `Rate limit exceeded! please try after ${ttl} seconds!`,
                })
            }else{
                redisClient.incr(redisKey);
                redisClient.incr(globalRedisKey);

                const globalTTL = await redisClient.ttl(globalRedisKey);
                if (globalTTL === -1) {
                    await redisClient.expire(globalRedisKey, windowSeconds);
                }

                const clientTTL = await redisClient.ttl(redisKey);
                if (clientTTL === -1) {
                    await redisClient.expire(redisKey, windowSeconds);
                }
            }
            next();
        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to process request'
            });
        }
    }
}

module.exports = rateLimiter;