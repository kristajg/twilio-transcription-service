require('dotenv').config();

// eslint-disable-next-line import/first
import { TranscribeStreamingClient, StartStreamTranscriptionCommand } from '@aws-sdk/client-transcribe-streaming';

// Finds keys in credentials file ~/.aws/credentials
const awsClient = new TranscribeStreamingClient({ region: 'us-east-1' });

// Params for StartStreamTranscriptionCommand are found here:
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-transcribe-streaming/interfaces/startstreamtranscriptioncommandinput.html
let baseParams = {
  LanguageCode: 'en-US',
  MediaEncoding: 'pcm',
  MediaSampleRateHertz: 44100, // The sample rate for the input audio stream. Use 8,000 Hz for low quality audio and 16,000 Hz for high quality audio.
};

const getTranscriptedData = async (TranscriptResultStream) => {
  const transcripts = [];
  for await (const event of TranscriptResultStream) {
    console.log('event is ', event);
    transcripts.push(event);
  }
  // return transcripts;
}

export const generateNewTranscription = async (audio) => {
  let params = {
    ...baseParams,
    // AudioStream: audio,
    AudioStream: (async function* () {
      for await (const chunk of audio) {
        // console.log('hey ', chunk);
        yield { AudioEvent: { AudioChunk: chunk } };
      }
    })()
  };

  const command = new StartStreamTranscriptionCommand(params);

  await awsClient.send(command)
    .then(dataTime => {
      // Response looks like this:
      // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-transcribe-streaming/interfaces/startstreamtranscriptioncommandoutput.html
      // console.log('data time! ', dataTime);
      getTranscriptedData(dataTime.TranscriptResultStream);
    })
    .catch(err => {
      console.log('tehre was an err ', err);
    });

};
