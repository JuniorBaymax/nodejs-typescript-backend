import dotEnv from 'dotenv';
import express from 'express';
import http from 'http';
import { port } from './config.js';
import Logger from './core/Logger.js';
import loader from './loaders/index.js';
import initializeSocket from './loaders/socket.io.js';

// cache; // cache initialization
const app = express();

// Socket.io
const server = http.createServer(app);
const io = initializeSocket(server);

app.set('io', io);
// This is require for make .env variables work otherwise it will return undefined
// process.env.PORT and any other variables will not work
dotEnv.config();

server
  .listen(process.env.PORT, () => {
    Logger.info(`server running on port : ${port}`);
    console.log(`SERVER UP on ${process.env.PORT}`);
  })
  .on('error', (e) => Logger.error(e));

loader(app);
