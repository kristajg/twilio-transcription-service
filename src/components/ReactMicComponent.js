// 3rd party libs
import React, { Component } from 'react';
import getUserMedia from 'get-user-media-promise';
import MicrophoneStream from 'microphone-stream';
import styled from 'styled-components';


// helpers
// eslint-disable-next-line import/first
// import { sendAudioToService } from '../helpers/apiHelpers';
import { pcmEncode, downsampleBuffer } from '../helpers/audioUtils';

// Components
import Button from './Button';

// creating WebSocket connection
let connection = new WebSocket('ws://localhost:8089');

let inputSampleRate;
const awsSampleRate = 44100; // for en-US, MediaSampleRateHertz max value is 48000... so theoretically i could make it that?

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
    micStream: null,
    recording: false,
  }

  componentDidMount() {
    connection.onopen = () => {
      console.log('ws connection was opened');
    };
  }

  // TODO: REMOVE THIS, DONT THINK ITS NEEDED
  // but it might actually be needed idfk
  getAudioEventMessage = buffer => {
    // wrap the audio data in a JSON envelope
    return {
      headers: {
        ':message-type': {
          type: 'string',
          value: 'event',
        },
        ':event-type': {
          type: 'string',
          value: 'AudioEvent',
        }
      },
      body: buffer
    };
  }

  // convertAudioToBinaryMessage = rawAudio => {
  //   if (rawAudio == null) return;

  //   // downsample and convert the raw audio bytes to PCM
  //   let downsampledBuffer = downsampleBuffer(rawAudio, inputSampleRate, sampleRate);
  //   let pcmEncodedBuffer = pcmEncode(downsampledBuffer);
  //   console.log('pcm encoded buffer ', pcmEncodedBuffer);

  //   // // add the right JSON headers and structure to the message
  //   // let audioEventMessage = this.getAudioEventMessage(Buffer.from(pcmEncodedBuffer));

  //   // //convert the JSON object + headers into a binary event stream message
  //   // let binary = eventStreamMarshaller.marshall(audioEventMessage);

  //   return Buffer.from(pcmEncodedBuffer);
  // }

  convertAudioToPCM = rawAudio => {
    if (rawAudio == null) return;

    console.log('inputSampleRate ', inputSampleRate);
    console.log('awsSampleRate ', awsSampleRate);
    // downsample and convert the raw audio bytes to PCM
    let downsampledBuffer = downsampleBuffer(rawAudio, inputSampleRate, awsSampleRate);
    let pcmEncodedBuffer = pcmEncode(downsampledBuffer);
    console.log('pcm encoded buffer in convertAudioToPCM!! ', pcmEncodedBuffer);
    // return pcmEncodedBuffer;
    // TODO: TRYING THE BELOW!! TEMPORARY! UNLESS IT WORKS OF COURSE HAHA UNLESS
    return Buffer.from(pcmEncodedBuffer);
  }

  streamAudioToWebsocket = (stream) => {
    this.setState({ micStream: new MicrophoneStream() });
    const { micStream } = this.state;
    micStream.setStream(stream);

    // Get input sample rate
    micStream.on('format', data => {
      inputSampleRate = data.sampleRate;
      // sample data:
      // {
      //   bitDepth: 32,
      //   channels: 1,
      //   float: true,
      //   sampleRate: 48000,
      //   signed: true,
      // }
    });

    micStream.on('data', chunk => {
      const raw = MicrophoneStream.toRaw(chunk);
      // the audio stream is raw audio bytes. Transcribe expects PCM with additional metadata, encoded as binary
      // or... does it just expect PCM data for what I have setup since the sdk does signing for me?
      // From the aws docs:
      // AudioStream: PCM-encoded stream of audio blobs. The audio stream is encoded as an HTTP/2 data frame.

      // Lets try PCM instead of binary
      let pcmData = this.convertAudioToPCM(raw);
      console.log('pcmData.. ', pcmData);

      // let binary = this.convertAudioToBinaryMessage(raw);
      // console.log('binary... ', binary);
      connection.send(pcmData);
      // note: if you set options.objectMode=true, the `data` event will output AudioBuffers instead of Buffers
    });
  }

  startMicStream = () => {
    getUserMedia({ video: false, audio: true })
      .then(stream => {
        this.setState({ recording: true });
        this.streamAudioToWebsocket(stream);
      }).catch(error => {
        console.log('Error getting user media: ', error);
      });
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
