require('dotenv').config();

// 3rd party libraries
import http from 'http';
import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import WebSocket, { WebSocketServer } from 'ws';

// Helpers
// import { createS3Bucket, uploadFileToS3Bucket } from './utils/awsHelpers';

// constants
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


// NOTE TO SELF: could run express server separate from websocket server
// (maybe i should? will do it if it becomes necessary)

// Create express server
const server = http.createServer(app).listen(8089, () => {
  console.log('Express server listening on port 8089');
});

// Initialize server with websockets
const wss = new WebSocket.Server({ server });



wss.on('connection', function connection(ws) {
  console.log('New ws connection initiated');

  ws.on('message', function incoming(message) {
    const msg = JSON.parse(message);
    switch (msg.event) {
      case 'connected':
        console.log(`A new call has connected.`);
        break;
      case 'start':
        console.log(`Starting Media Stream ${msg.streamSid}`);
        break;
      case 'media':
        console.log(`Receiving Audio...`)
        break;
      case 'stop':
        console.log(`Call Has Ended`);
        break;
      default:
        break;
    }
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
  // res.send('It works');
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.post('/test-websocket-transcribe', (req, res) => {
  res.send('It works');
  client.voice.response()
});



// AWS.config.getCredentials(err => {
//   if (err) console.log(err.stack);
//   // credentials not loaded
//   else {
//     console.log('Access key: ', AWS.config.credentials.accessKeyId);
//   }
// });

// // Create unique bucket name
// const bucketName = 'kg-node-sdk-sample-' + uuidv4();
// // Create name for uploaded object key
// const keyName = 'hello_world.txt';

// // Create a promise on S3 service object
// const bucketPromise =
//   // new AWS.S3({ apiVersion: '2006-03-01' })
//   new AWS.S3()
//     .createBucket({ Bucket: bucketName })
//     .promise();

// bucketPromise.then(data => {
//   // Create params for putObject call
//   const objectParams = {
//     Bucket: bucketName,
//     Key: keyName,
//     Body: 'Hello World!',
//   };

//   // Create object upload promise
//   // const uploadPromise = new AWS.S3({apiVersion: '2006-03-01'}).putObject(objectParams).promise();
//   const uploadPromise = new AWS.S3().putObject(objectParams).promise();

//   uploadPromise.then(data => {
//     console.log('data be like ', data);
//     console.log('Successfully uploaded data to ' + bucketName + '/' + keyName);
//   });
// }).catch(err => {
//   console.error(err, err.stack);
// });









// import  { TranscribeClient }  from  "@aws-sdk/client-transcribe";
// // Set the AWS Region.
// const REGION = "REGION"; //e.g. "us-east-1"
// // Create Transcribe service object.
// const transcribeClient = new TranscribeClient({ region: REGION });
// export { transcribeClient };


// STREAMING EXAMPLE
// // ES5 example
// const {
//   TranscribeStreamingClient,
//   StartMedicalStreamTranscriptionCommand,
// } = require("@aws-sdk/client-transcribe-streaming");
// // ES6+ example
// import {
//   TranscribeStreamingClient,
//   StartMedicalStreamTranscriptionCommand,
// } from "@aws-sdk/client-transcribe-streaming";