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
    console.log('message? ', message);
    // const stream = Readable.from(message);
    // console.log('message is ', message);
    generateNewTranscription(message);

    // const msg = JSON.parse(message);
    // switch (msg.event) {
    //   case 'connected':
    //     console.log(`A new call has connected.`);
    //     break;
    //   case 'start':
    //     console.log(`Starting Media Stream ${msg.streamSid}`);
    //     break;
    //   case 'media':
    //     console.log(`Receiving Audio...`)
    //     break;
    //   case 'stop':
    //     console.log(`Call Has Ended`);
    //     break;
    //   default:
    //     break;
    // }
  });
});

// ws.on('open', function open() {
//   ws.send('something');
// });

// ws.on('message', function incoming(message) {
//   console.log('received: %s', message);
// });


// App routes
app.get('/', (req, res) => {
  res.send('It works');
});

app.post('/transcribe-audio', (req, res) => {
  console.log('Transcribe audio endpoint hit ', req.body);
  res.send('transcribe audio');
});
