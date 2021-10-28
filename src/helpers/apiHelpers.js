import superagent from 'superagent';

export const sendAudioToService = async (audioObject = {}) => {
  console.log('Send to audio service ', audioObject);
  let data;
  await superagent
    .post(`${process.env.REACT_APP_SERVER_PREFIX}/transcribe-audio`)
    .send(audioObject)
    .set('Accept', 'application/json')
    .then(res => {
      console.log('Response: ' + res.body);
      data = res.body;
    })
    .catch(err => {
      console.log('Error ', err);
      data = err;
    })
  console.log('after server responded with data ', data);
  return data;
}
