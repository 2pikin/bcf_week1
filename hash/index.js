const crypto = require('crypto');
const secp256k1 = require('secp256k1');

const msg = process.argv[2];
const calculatedHash = crypto.createHash('sha256').update(msg).digest();

let privateKey;
do {
  privateKey = crypto.randomBytes(32);
} while (!secp256k1.privateKeyVerify(privateKey));

const publicKey = secp256k1.publicKeyCreate(privateKey);

const sign = secp256k1.sign(calculatedHash, privateKey);

console.log(`privateKey: ${privateKey.toString('hex')}
publicKey: ${publicKey.toString('hex')}
message: ${msg}
signature: ${sign.signature.toString('hex')}`);

const checkMessage = secp256k1.verify(calculatedHash, sign.signature, publicKey);

console.log(`Verify message:${msg}
result: ${checkMessage}`);
