//...................below implementation for socket io 


const http = require('http');
const socketIO = require('socket.io');
const server = http.createServer(app);

const io = socketIO(server);
io.on('connection', socket => {
  console.log('client connected on websocket 12345');
  socket.on('newMessage', function (data) {
    console.log('new message is called in socketioserver');
    console.log('new message is data socketioserver ',data);
  });

});

server.listen(3000, () => {
  console.log('server started and listening on port 3000');
});










 
 var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')('http://192.168.1.4:3003');

app.get('/', function(req, res){
 // res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
});

io.on('connect', function(){ console.log('connect');});
io.on('event', function(data){ console.log('event');});
io.on('disconnect', function(){ console.log('disconnect');});

 





  var http = require('http')
var socketio = require('socket.io');
var server = http.Server(express);
var websocket = socketio(server);
//server.listen(3000, () => console.log('listening on *:3000'));
// Mapping objects to easily map sockets and users.
var clients = {};
var users = {};

// This represents a unique chatroom.
// For this example purpose, there is only one chatroom;
var chatId = 1;

websocket.on('connection', (socket) => {
    console.log('called websocket.on');
    clients[socket.id] = socket;
    socket.on('userJoined', (userId) => onUserJoined(userId, socket));
    socket.on('message', (message) => onMessageReceived(message, socket));
    
});

// Event listeners.
// When a user joins the chatroom.
function onUserJoined(userId, socket) {
    console.log('called onUserJoined');
    try {
      // The userId is null for new users.
      if (!userId) {
          _sendExistingMessages(socket);
      } else {
        users[socket.id] = userId;
        _sendExistingMessages(socket);
      }
    } catch(err) {
      console.err(err);
    }
  }

// When a user sends a message in the chatroom.
function onMessageReceived(message, senderSocket) {
    console.log('called onMessageReceived');
    var userId = users[senderSocket.id];
    // Safety check.
    if (!userId) return;
  
    _sendAndSaveMessage(message, senderSocket);
  }

// Helper functions.
// Send the pre-existing messages to the user that just joined.
function _sendExistingMessages(socket) {
    console.log('called _sendExistingMessages');
    var messages = null; // db.collection('messages')

        if (!messages.length) return;
        socket.emit('message', messages.reverse());
  }

// Save the message to the db and send all sockets but the sender.
function _sendAndSaveMessage(message, socket, fromServer) {
    console.log('called _sendAndSaveMessage');

      var emitter = fromServer ? websocket : socket.broadcast;
      emitter.emit('message', [message]);

  }


// Allow the server to participate in the chatroom through stdin.
var stdin = process.openStdin();
stdin.addListener('data', function(d) {
  _sendAndSaveMessage({
    text: d.toString().trim(),
    createdAt: new Date(),
    user: { _id: 'robot' }
  //}, null  no socket , true  send from server );
}, null, true);
});
  




//..............................above implementation for socket io   


