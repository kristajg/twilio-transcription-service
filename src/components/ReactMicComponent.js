// 3rd party libs
import React, { Component } from 'react';
import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand,
} from '@aws-sdk/client-transcribe-streaming';
import getUserMedia from 'get-user-media-promise';
import MicrophoneStream from 'microphone-stream';
import styled from 'styled-components';


// helpers
// eslint-disable-next-line import/first
// import { sendAudioToService } from '../helpers/apiHelpers';
import { pcmEncodeChunk } from '../helpers/audioUtils';

// Components
import Button from './Button';

// Initialize AWS client
const client = new TranscribeStreamingClient({
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_ACCESS_KEY,
  },
  region: 'us-east-1',
  // maxAttempts: 5,
});

// creating WebSocket connection
// let connection = new WebSocket('ws://localhost:8089');


const TextAreaContainer = styled.textarea`
  width: 100%;
  height: 200px;
`;

const ButtonContainer = styled.div`
  display: inline-flex;
`;

const ButtonItem = styled.div`
  display: inline;TranscribeStreamingClient
`;

const RecordingStatusContainer = styled.div`
  padding-top: 20px;
  font-size: 18px;
  font-style: italic;
  color: lightgray;
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
    transcriptionResults: '',
  }

  // componentDidMount() {
  //   connection.onopen = () => {
  //     console.log('ws connection was opened');
  //   };
  // }

  handleEventStreamMessage = messageJson => {
    let results = messageJson.Transcript.Results;
    if (results.length > 0) {
      if (results[0].Alternatives.length > 0) {
        // Make shallow clone of current results
        const { transcriptionResults } = this.state;
        let newResults = transcriptionResults;

        let transcript = results[0].Alternatives[0].Transcript;

        // fix encoding for accented characters
        transcript = decodeURIComponent(escape(transcript));

        // update the textarea with the latest result
        newResults = transcript;

        // if this transcript segment is final, add it to the overall transcription
        if (!results[0].IsPartial) {
          console.log('its partial... ');
          // //scroll the textarea down
          // $('#transcript').scrollTop($('#transcript')[0].scrollHeight);
          // transcription += transcript + "\n";
        }
        this.setState({ transcriptionResults: newResults });
      }
    }
  }

  streamAudioToWebsocket = async (audioStream) => {
    let micStream = new MicrophoneStream();
    this.setState({ micStream });
    micStream.setStream(audioStream);

    const transcribeInput = async function* () {
      for await(const chunk of micStream) {
        yield { AudioEvent: { AudioChunk: pcmEncodeChunk(chunk, MicrophoneStream) } }
      }
    }

    const res = await client.send(new StartStreamTranscriptionCommand({
      LanguageCode: 'en-US',
      MediaSampleRateHertz: 44100,
      MediaEncoding: 'pcm',
      AudioStream: transcribeInput(),
    }))
    .catch(err => {
      console.log('err sending data to aws websocket ', err);
    });

    for await(const event of res.TranscriptResultStream) {
      if(event.TranscriptEvent) {
        const message = event.TranscriptEvent;
        this.handleEventStreamMessage(message);
      }
    }
  }

  stopMicStream = () => {
    this.setState({ recording: false });
    const { micStream } = this.state;
    micStream.stop();
  }


  startMicStream = async () => {
    this.setState({ recording: true });

  //   try {
  //   // first we get the microphone input from the browser (as a promise)...
  //   const media = await window.navigator.mediaDevices.getUserMedia({
  //     video: false,
  //     audio: true
  //   });
  //   // ...then we convert the mic stream to binary event stream messages when the promise resolves 
  //   await this.streamAudioToWebsocket(media);
  // } catch (error) {
  //   console.error('Error occurred: ', error);
  // }

    getUserMedia({ video: false, audio: true })
      .then(async audioStream => {
        this.setState({ recording: true });
        await this.streamAudioToWebsocket(audioStream);
      })
      .catch(error => {
        console.log('Error getting user media: ', error);
      });
  }


  render() {
    console.log('transcription results ', this.state.transcriptionResults);
    return (
      <div>
        <TextAreaContainer
          defaultValue={this.state.transcriptionResults ? this.state.transcriptionResults : ''}
          />
        <br />
        <br />
        <ButtonContainer>
          <ButtonItem>
            <Button onClick={this.startMicStream} styles={{...buttonStyles, marginRight: '10px'}}>Clicky Mic START</Button>
          </ButtonItem>
          <ButtonItem>
            <Button onClick={this.stopMicStream} styles={buttonStyles}>Clicky Mic STOP</Button>
          </ButtonItem>
        </ButtonContainer>
        <br />
        <RecordingStatusContainer>
          <StatusHeader>
            Status:{' '}
          </StatusHeader>
          {this.state.recording ? 'Recording in progress...' : 'Ready to record'}
        </RecordingStatusContainer>
      </div>
    );
  }
}
