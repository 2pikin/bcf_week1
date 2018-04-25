$(function(){
  var socket = io.connect('http://localhost:8080');

  $('#send_message').click(() => {
    socket.emit('new_message', { message: $('#input_message').val() });
    $('#input_message').val('');
  });

  socket.on('new_message', (data) => {
    $('#messages').append(`<p class="message"><b>${data.username}:</b> ${data.message} [ <span></span> ]<br>
    [ hash: <i>${data.s_hash} || sign: <i>${data.s_sign}</i> || pubkey: <i>${data.s_pubkey}</i> ]</p>`);
    socket.emit('verify_message', {
      message: data.message,
      hash: data.hash,
      sign: data.sign,
      pubkey: data.pubkey
    });
  });

  socket.on('verify_message', (data) => {
    if (data.result === true) {
      $('p span').last().addClass('green white-text');
      $('p span').last().html('valid');
    } else {
        $('p span').last().addClass('red white-text');
        $('p span').last().html('error');
    }
  });

  $('#send_username').click(() => {
    const username = $('#input_username').val();
    socket.emit('change_username', { username });
    $('.brand-logo').html(`&nbsp;&nbsp;CryptoChat :: ${username}`);
    $('#input_username').val('');
  });
});
