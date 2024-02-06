const { createClient } = require('redis');
const { AppConfig } = require('../const');
const Logger = require('./logger.lib');

let isConnected = false;
let redisClient = createClient({
  url: AppConfig.REDIS_URL
})
.on('error', (error) => {
  Logger.error('redis error', error);
})
.on('connect', () => {
  Logger.info('Redis started');
})
.on('reconnect', () => {
  Logger.warning('Redis reconnecting');
})
.on('end', () => {
  Logger.warning('Redis disconnected');
})

/**
 * Connect to redis
 * @returns {Promise<void>}
 */
async function connect() {
  if (isConnected) return;
  await redisClient.connect();
  isConnected = true;
}

module.exports = {
  connect,
  redisClient
}