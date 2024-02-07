console.table(require('dotenv').config().parsed);
const express = require('express');
const app = express();
const { AppConfig } = require('./const');
const { RedisClient, Logger } = require('./libs');
const mongoose = require('mongoose');
const { serverErrorHandle, requestLog } = require('./middleware');
const expressFileUpload = require('express-fileupload');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(requestLog);
app.use(expressFileUpload({
  parseNested: true,
  useTempFiles: true,
  tempFileDir: 'tmp'
}))
// register route
app.use('/api/v1', require('./routes'));
app.use(serverErrorHandle);

async function startApp() {
  const mongoseInstance = await mongoose
    .connect(AppConfig.DB_URI, {
      maxPoolSize: 1000,
      minPoolSize: 2
    })
    .catch(error => {
      Logger.error('failed to connect to mongodb', error);
    });

  await RedisClient
    .connect()
    .catch(error => {
      Logger.error('failed to connect to redis', error);
    });
  
  if (!mongoseInstance) return;

  mongoose.connection.on('connected', () => {
    Logger.info('Mongodb connected');
  });
  
  // Connection error event
  mongoose.connection.on('error', (err) => {
    Logger.error('Mongodb error', err);
  });
  
  // Disconnected event
  mongoose.connection.on('disconnected', () => {
    Logger.warning('Mongodb disconnected');
  });
  

  app.listen(AppConfig.PORT, AppConfig.HOST, () => {
    console.log('App started!');
  });

  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    await redisClient.quit();
    Logger.warning('Node server closed');
    process.exit(1);
  })

  process.on('uncaughtException', async (error, origin) => {
    await mongoose.connection.close();
    await redisClient.quit();
    Logger.error('Unexpect error on node server ' + origin, error);
    process.exit(1);
  })
}

startApp();