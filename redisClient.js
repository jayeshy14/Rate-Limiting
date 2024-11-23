const redis = require('redis');

const client = redis.createClient({
 url: 'redis://127.0.0.1:6379'
});

(async () => {
  try {
    await client.connect();
  } catch (err) {
    console.error('Error connecting to Redis:', err);
  }
})();

client.on('connect', () => {
  console.log('Connected to Redis');
});

client.on('error', (err) => {
  console.error(`Error connecting to Redis: ${err.message}`);
});

module.exports = client;