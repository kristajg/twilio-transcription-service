require('dotenv').config();

// 3rd party libraries
/*eslint-disable */
import http from 'http';
import { Readable } from 'stream';
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import WebSocket from 'ws';
/*eslint-enable */

// Helpers
// eslint-disable-next-line import/first
import { generateNewTranscription } from './awstest';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Create express server
const server = http.createServer(app).listen(8089, () => {
  console.log('Express server listening on port 8089');
});

// Initialize server with websockets
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
  console.log('New ws connection initiated');
  ws.on('message', function incoming(message) {
    const stream = Readable.from(message);
    generateNewTranscription(stream);
  });
});

// App routes
app.get('/', (req, res) => {
  res.send('It works');
});

app.post('/transcribe-audio', (req, res) => {
  console.log('Transcribe audio endpoint hit ', req.body);
  res.send('transcribe audio');
});
