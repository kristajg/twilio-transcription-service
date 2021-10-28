import { AwsTranscribe, StreamingClient, TranscriptEvent } from 'aws-transcribe';

const awsClient = new AwsTranscribe({
  // if these aren't provided, they will be taken from the environment
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_ACCESS_KEY,
});

const transcribeStream = awsClient
    .createStreamingClient({
        region: 'us-east-1',
        sampleRate: 16000,
        languageCode: 'en-US',
    })
    // enums for returning the event names which the stream will emit
    .on(StreamingClient.EVENTS.OPEN, () => console.log(`transcribe connection opened`))
    .on(StreamingClient.EVENTS.ERROR, console.error)
    .on(StreamingClient.EVENTS.CLOSE, () => console.log(`transcribe connection closed`))
    .on(StreamingClient.EVENTS.DATA, (data) => {
        const results = data.Transcript.Results

        if (!results || results.length === 0) {
          return
        }
        console.log('results 1 ', results);

        const result = results[0];
        console.log('results 2 ', result);
        const final = !result.IsPartial
        const prefix = final ? "recognized" : "recognizing"
        const text = result.Alternatives[0].Transcript
        console.log(`${prefix} text: ${text}`)
    })

// yourStream.pipe(transcribeStream)