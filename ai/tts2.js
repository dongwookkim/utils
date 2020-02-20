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
const authCred = grpc.credentials.createFromMetadataGenerator(generateMetadata);
const credentials = grpc.credentials.combineChannelCredentials(sslCred, authCred);
const client = new proto.Gigagenie('connector.gigagenie.ai:4080', credentials);
const writeStream = fs.createWriteStream('./testtts.wav');
const pcm = client.getText2VoiceStream({ text: '홍부장님, 저는 이만 퇴근하겠습니다.', lang: 0, mode: 0 }).on('error', (error) => {
    console.log('Error:' + error);
}).on('data', (data) => {
    if (data.streamingResponse === 'resOptions' && data.resOptions.resultCd === 200)
        console.log('Stream send. format:' + data.resOptions.format);
    if (data.streamingResponse === 'audioContent')
        writeStream.write(data.audioContent);
    else
        console.log('msg received:' + JSON.stringify(data));
});
pcm.on('end', () => {
    console.log('pcm end');
    writeStream.end();
});