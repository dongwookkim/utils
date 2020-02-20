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
client.queryByText({ queryText: '라면+먹자', userSession: '12345', deviceId: 'helloDevie' }, (err, msg) => {
    if (err) {
        console.log(JSON.stringify(err));
    } else {
        console.log('Msg:' + JSON.stringify(msg));
    }
})