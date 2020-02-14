const grpc = require('grpc')
const proto = grpc.load('./gigagenieRPC.proto').kt.gigagenie.ai.speech;
const fs = require('fs');
const crypto = require('crypto');
const dateFormat = require('dateformat');
const sslCred = grpc.credentials.createSsl(fs.readFileSync('./ca-bundle.pem'));
const client_id = 'YOUR_CLIENT_ID';
const client_key = 'YOUR_CLIENT_KEY';
const client_secret = 'YOUR_CLIENT_SECRET';
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
client.queryByText({ queryText: '단어암기', userSession: '12345', deviceId: 'helloDevie' }, (err, msg) => {
    if (err) {
        console.log(JSON.stringify(err));
    } else {
        console.log('Msg:' + JSON.stringify(msg));
    }
})