// 3rd party libs
import React, { Component } from 'react';
import { ReactMic } from 'react-mic';

// helpers
import { sendAudioToService } from '../helpers/apiHelpers';

// creating WebSocket connection
let connection = new WebSocket('ws://localhost:8089');

export default class ReactMicComponent extends Component {
  state = {
    record: false,
  }

  componentDidMount() {
    connection.onopen = () => {
      console.log('connection was opened');
    };

    connection.onmessage = e => {
      console.log('e on message ', e);
    };
  }

  startRecording = () => {
    this.setState({ record: true });
  }

  stopRecording = () => {
    this.setState({ record: false });
  }

  onData(recordedBlob) {
    console.log('chunk of real-time data is: ', recordedBlob);

    // Websocket send
    connection.send(recordedBlob);

    // Server POST
    // sendAudioToService(recordedBlob);

    // return recordedBlob;
  }

  onStop(recordedBlob) {
    console.log('recordedBlob is: ', recordedBlob);
    // connection.send(recordedBlob);
    // sendAudioToService(recordedBlob);
  }


  render() {
    return (
      <div>
        <ReactMic
          record={this.state.record}
          className="sound-wave"
          onStop={this.onStop}
          onData={this.onData}
          strokeColor="#000000"
          backgroundColor="#FF4081" />
        <br />
        <button onClick={this.startRecording} type="button">Start</button>
        <button onClick={this.stopRecording} type="button">Stop</button>
      </div>
    );
  }
}
