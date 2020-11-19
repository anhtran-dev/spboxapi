const express = require('express')
const https = require('https')
const fs = require('fs')
const bearerToken = require('express-bearer-token');
const app = express()
const port = 3003

app.get('/', (req, res) => res.send('SportsBox API works!'))

var acct = require('./Account')
app.use('/Account', acct)


app.use(bearerToken());
var Userslist = require('./Users')
app.use('/Users', Userslist)

app.use(bearerToken());
var teamslist = require('./Teams')
app.use('/Teams', teamslist)

app.use(bearerToken());
var playerslist = require('./Players')
app.use('/Players', playerslist)

app.use(bearerToken());
var leagueslist = require('./Leagues')
app.use('/Leagues', leagueslist)

app.use(bearerToken());
var feedslist = require('./Feeds')
app.use('/Feeds', feedslist)

app.use(bearerToken());
var eventslist = require('./Events')
app.use('/Events', eventslist)

app.use(bearerToken());
var gameofficialslist = require('./GameOfficials')
app.use('/GameOfficials', gameofficialslist)

app.use(bearerToken());
var freeagentslist = require('./FreeAgents')
app.use('/FreeAgents', freeagentslist)

app.use(bearerToken());
var profile = require('./Profile')
app.use('/Profile', profile)

app.use(bearerToken());
var message = require('./Messages')
app.use('/Messages', message)

app.use(bearerToken());
var message = require('./HappyHours')
app.use('/HappyHours', message)

app.use(function (req, res, next) {
    res.status(404).send('No page found');
});

//app.listen(port, () => console.log(`SportsBox API listening on port ${port}!`))





//...Socket Connection Implementation below

const http = require('http');
const socketIO = require('socket.io');
const server = http.createServer(app);
const io = socketIO(server, { wsEngine: 'ws' });
/* server.listen(3000, () => {
  console.log('server started and listening on port 3000');
}); */
server.listen(port, () => console.log(`SportsBox API listening on port ${port}!`))

// Mapping objects to easily map sockets and users.
var clients = {};
var users = {};

io.on('connection', (socket) => {
    console.log('called websocket.on');
    clients[socket.id] = socket;
    socket.on('userJoined', (userId,GroupId) => onUserJoined(userId, socket,GroupId));
    socket.on('message', (message) => onMessageReceived(message, socket));
    
});

// Event listeners.
// When a user joins the chatroom.
function onUserJoined(userId, socket,GroupId) {
    console.log('called onUserJoined');
    try {
      // The userId is null for new users.
      if (userId) {
        users[socket.id] = userId;
      }
    } catch(err) {
      console.err(err);
    }
  }

// When a user sends a message in the chatroom.
function onMessageReceived(message, senderSocket) {
    console.log('called onMessageReceived ',message);
    var userId = users[senderSocket.id];
    // Safety check.
    if (!userId) return;

    _sendMessage(message, senderSocket);
  }


// Save the message to the db and send all sockets but the sender.
function _sendMessage(message, socket, fromServer) {
    console.log('called _sendAndSaveMessage',message);
      var emitter = fromServer ? io : socket.broadcast;
      emitter.emit('message', [message]);
  }

  