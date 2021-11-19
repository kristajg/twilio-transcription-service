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
  // EnablePartialResultsStabilization: true, // This reduces latency, good for subtitles
};

const getTranscriptedData = async (TranscriptResultStream) => {
  const transcripts = [];
  for await (let event of TranscriptResultStream) {
    console.log('event is ', event);
    transcripts.push(event);
  }
  console.log('transcripts? ', transcripts);
  return transcripts;
}

export const generateNewTranscription = async (audioStream) => {
  let params = {
    ...baseParams,
    // AudioStream: PCM-encoded stream of audio blobs. The audio stream is encoded as an HTTP/2 data frame.
    AudioStream: (async function* () {
      for await (const chunk of audioStream) {
        if (chunk && chunk.length) {
          // AudioEvent: The maximum audio chunk size is 32 KB
          yield { AudioEvent: { AudioChunk: chunk } };
        } else {
          console.log('Empty chunk ', chunk)
        }
      }
    })()
  };

  const command = new StartStreamTranscriptionCommand(params);

  await awsClient.send(command)
    .then(dataTime => {
      // Response docs:
      // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-transcribe-streaming/interfaces/startstreamtranscriptioncommandoutput.html
      // console.log('AWS DATA RESPONSE ', dataTime);
      let finalTranscription = getTranscriptedData(dataTime.TranscriptResultStream);
      console.log('Final transcription ', finalTranscription);
    })
    .catch(err => {
      console.log('Error with transcription service ', err);
    });
};
