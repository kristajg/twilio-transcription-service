// 3rd party libs
import React, { Component } from 'react';
import getUserMedia from 'get-user-media-promise';
import MicrophoneStream from 'microphone-stream';
import styled from 'styled-components';


// helpers
// eslint-disable-next-line import/first
// import { sendAudioToService } from '../helpers/apiHelpers';

// Components
import Button from './Button';

// creating WebSocket connection
let connection = new WebSocket('ws://localhost:8089');

let inputSampleRate;

const ButtonContainer = styled.div`
  display: inline-flex;
`;

const ButtonItem = styled.div`
  display: inline;
`;

const RecordingStatusContainer = styled.div`
  font-size: 24px;
  color: skyblue;
`;

const StatusHeader = styled.span`
  font-weight: 600;
`;

const buttonStyles = {
  width: '180px',
};


export default class ReactMicComponent extends Component {
  state = {
    recording: false,
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

  convertAudtioToBinary = rawAudio => {
    if (rawAudio == null) return;

    // // downsample and convert the raw audio bytes to PCM
    // let downsampledBuffer = audioUtils.downsampleBuffer(rawAudio, inputSampleRate, sampleRate);
    // let pcmEncodedBuffer = audioUtils.pcmEncode(downsampledBuffer);

    // // add the right JSON headers and structure to the message
    // let audioEventMessage = getAudioEventMessage(Buffer.from(pcmEncodedBuffer));

    // //convert the JSON object + headers into a binary event stream message
    // let binary = eventStreamMarshaller.marshall(audioEventMessage);

    // return binary;
  }

  streamAudioToWebsocket = (stream) => {
    this.setState({ micStream: new MicrophoneStream() });
    const { micStream } = this.state;

    micStream.setStream(stream);

    micStream.on('format', data => {
      console.log('Format hit ', data);
      inputSampleRate = data.sampleRate;
    });

    let sampleRate = 0;
    micStream.on('data', chunk => {
      const raw = MicrophoneStream.toRaw(chunk);
      // the audio stream is raw audio bytes. Transcribe expects PCM with additional metadata, encoded as binary
      // let binary = convertAudioToBinaryMessage(rawAudioChunk);
      // Convert to PCM
      // connection.send(raw);
      // note: if you set options.objectMode=true, the `data` event will output AudioBuffers instead of Buffers
    });
  }

  startMicStream = () => {
    getUserMedia({ video: false, audio: true })
      .then(stream => {
        this.setState({ recording: true });
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
    this.setState({ recording: false });
    const { micStream } = this.state;
    micStream.stop();
  }

  render() {
    return (
      <div>
        <RecordingStatusContainer>
          <StatusHeader>
            Status:{' '}
          </StatusHeader>
          {this.state.recording ? 'Recording in progress...' : 'Ready to record'}
        </RecordingStatusContainer>
        <br />
        <ButtonContainer>
          <ButtonItem>
            <Button onClick={this.startMicStream} styles={{...buttonStyles, marginRight: '10px'}}>Clicky Mic START</Button>
          </ButtonItem>
          <ButtonItem>
            <Button onClick={this.stopMicStream} styles={buttonStyles}>Clicky Mic STOP</Button>
          </ButtonItem>
        </ButtonContainer>
      </div>
    );
  }
}
