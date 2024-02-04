console.table(require('dotenv').config().parsed);
const express = require('express');
const app = express();
const { AppConfig } = require('./const');
const mongoose = require('mongoose');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// register route
app.use('/api/v1', require('./routes'));

async function startApp() {
  const mongoseInstance = await mongoose
    .connect(AppConfig.DB_URI, {
      maxPoolSize: 1000,
      minPoolSize: 2
    })
    .catch(error => {
      console.log('Failed to connect to database');
      console.error(error);
    });
  
  if (!mongoseInstance) return;

  app.listen(AppConfig.PORT, AppConfig.HOST, () => {
    console.log('App started!');
  });
  
}

startApp();