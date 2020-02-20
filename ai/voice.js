/* node-record-lpcm16 module을 사용하기 위해서는 sox 설치가 필요합니다. */
const record = require('node-record-lpcm16');
const grpc = require('grpc')
const proto = grpc.load('./gigagenieRPC.proto').kt.gigagenie.ai.speech;
const fs = require('fs');
const crypto = require('crypto');
const dateFormat = require('dateformat');
const sslCred = grpc.credentials.createSsl(fs.readFileSync('./ca-bundle.pem'));
const client_id = 'Y2xpZW50X2lkMTU4MTY0MTUzNDY5NA==';
const client_key = 'Y2xpZW50X2tleTE1ODE2NDE1MzQ2OTQ=';
const client_secret = 'Y2xpZW50X3NlY3JldDE1ODE2NDE1MzQ2OTQ=';
function getTimeStamp() {
    return dateFormat(new Date(), 'yyyymmddHHmmssL');
};
function createSignature(id, timestamp, secret) {
    return crypto.createHmac('sha256', secret).update(id + ':' + timestamp).digest('hex');
};
function generateMetadata(params, callback) {
    const metadata = new grpc.Metadata();
    const timeStamp = getTimeStamp();
    metadata.add('x-auth-clientkey', client_key);
    metadata.add('x-auth-timestamp', timeStamp);
    const signature = createSignature(client_id, timeStamp, client_secret);
    metadata.add('x-auth-signature', signature);;
    callback(null, metadata);
};
function initMic() {
    return record.record({
        sampleRateHertz: 16000,
        threshold: 0,
        verbose: false,
        recordProgram: 'rec',
        silence: '10.0',
    })
};
console.log(getTimeStamp());
const authCred = grpc.credentials.createFromMetadataGenerator(generateMetadata);
console.log(authCred);
const credentials = grpc.credentials.combineChannelCredentials(sslCred, authCred);
const client = new proto.Gigagenie('connector.gigagenie.ai:4080', credentials);
const pcm = client.getVoice2Text().on('error', (error) => {
    console.log('Error:' + error);
}).on('data', (data) => {
    console.log('data:' + JSON.stringify(data));
})

const mic = initMic();
pcm.on('end', () => {
    console.log('pcm end');
    mic.stop();
});
pcm.write({ reqOptions: { mode: 0, lang: 0 } });

console.log("statr......")
mic.stream().on('data', (data) => {
    pcm.write({ audioContent: data });
});