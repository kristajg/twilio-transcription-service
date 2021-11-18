// 3rd party libs
import React, { Component } from 'react';
import getUserMedia from 'get-user-media-promise';
import MicrophoneStream from 'microphone-stream';

// helpers
// eslint-disable-next-line import/first
// import { sendAudioToService } from '../helpers/apiHelpers';

// creating WebSocket connection
let connection = new WebSocket('ws://localhost:8089');

let inputSampleRate;

export default class ReactMicComponent extends Component {
  state = {
    micStream: null, // TODO: maybe make this a global
  }

  componentDidMount() {
    connection.onopen = () => {
      console.log('connection was opened');
    };

    // connection.onmessage = e => {
    //   console.log('e on message ', e);
    // };
  }

  streamAudioToWebsocket = (stream) => {
    this.setState({
      micStream: new MicrophoneStream(),
    });
    const { micStream } = this.state;

    micStream.setStream(stream);


    micStream.on('format', data => {
      console.log('Format hit ', data);
      inputSampleRate = data.sampleRate;
    });

    micStream.on('data', chunk => {
      // Optionally convert the Buffer back into a Float32Array
      // (This actually just creates a new DataView - the underlying audio data is not copied or modified.)
      const raw = MicrophoneStream.toRaw(chunk);
      // console.log('raw? ', raw);
      connection.send(raw);
      // note: if you set options.objectMode=true, the `data` event will output AudioBuffers instead of Buffers
    });
  }

  startMicStream = () => {
    getUserMedia({ video: false, audio: true })
      .then(stream => {
        console.log('stream is ', stream);
        // This function sends stream to AWS websocket
        let thing = this.streamAudioToWebsocket(stream);
        console.log('thing ', thing);
      }).catch(function(error) {
        console.log(error);
      });
    
    // // get Buffers (Essentially a Uint8Array DataView of the same Float32 values)
    // micStream.on('data', function(chunk) {
    //   // Optionally convert the Buffer back into a Float32Array
    //   // (This actually just creates a new DataView - the underlying audio data is not copied or modified.)
    //   const raw = MicrophoneStream.toRaw(chunk)
    //   //...

    //   // note: if you set options.objectMode=true, the `data` event will output AudioBuffers instead of Buffers
    // });

    // // or pipe it to another stream
    // micStream.pipe(/*...*/);

    // // Access the internal audioInput for connecting to another nodes
    // micStream.audioInput.connect(/*...*/));

    // // It also emits a format event with various details (frequency, channels, etc)
    // micStream.on('format', function(format) {
    //   console.log(format);
    // });
  }

  stopMicStream = () => {
    const { micStream } = this.state;
    micStream.stop();
  }

  render() {
    return (
      <div>
        <button onClick={this.startMicStream} type="button">Clicky Mic START</button>
        <button onClick={this.stopMicStream} type="button">Clicky Mic STOP</button>
      </div>
    );
  }
}
