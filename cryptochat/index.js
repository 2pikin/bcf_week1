const { randomBytes } = require('crypto');
const secp256k1 = require('secp256k1');
const crypto = require('crypto');

const express = require('express');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

http.listen(8080, () => {
  console.log('> Ready on http://localhost:8080');
});

io.on('connection', (socket) => {
  console.log('> User connected');
  // generate user key pair
  let privKey;
  do {
    privKey = randomBytes(32);
  } while (!secp256k1.privateKeyVerify(privKey));
  let pubKey = secp256k1.publicKeyCreate(privKey);

  const s = socket;
  // set default params
  s.username = 'Anonymous';
  s.privKey = privKey;
  s.pubKey = pubKey;

  // user change name
  s.on('change_username', (data) => {
    do {
      privKey = randomBytes(32);
    } while (!secp256k1.privateKeyVerify(privKey));
    pubKey = secp256k1.publicKeyCreate(privKey);
    // regenerate key pair
    s.username = data.username;
    s.privKey = privKey;
    s.pubKey = pubKey;
  });

  // new message
  s.on('new_message', (data) => {
    const messageHash = crypto.createHash('sha256').update(data.message).digest();
    const signObj = secp256k1.sign(messageHash, s.privKey);
    io.sockets.emit('new_message', {
      message: data.message,
      username: s.username,
      hash: messageHash,
      sign: signObj.signature,
      pubkey: s.pubKey,
      s_sign: signObj.signature.toString('hex'),
      s_pubkey: s.pubKey.toString('hex'),
    });
  });

  s.on('verify_message', (data) => {
    const result = secp256k1.verify(Buffer.from(data.cl_hash, 'hex'), data.cl_sign, data.cl_pubkey);
    io.sockets.emit('verify_message', { result });
  });

  s.on('disconnect', () => {
    console.log('> User disconnected');
  });
});
