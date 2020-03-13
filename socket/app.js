const http = require('http');
const express = require('express');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = require('socket.io').listen(server);

let activeUsers = [];
const inactiveTime = 3;

server.listen(3005);

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.use('/static', express.static('node_modules'));
app.use('/', express.static('dist'));

io.on('connection', function (socket) {
  socket.on('register', function(user) {
    user.retryCount = inactiveTime;
    activeUsers.push(user);
  });
  
  socket.on('present', function(user) {
    user.retryCount = inactiveTime;
    activeUsers = activeUsers.filter((u) => { return (u.id !== user.id); });
    activeUsers.push(user);
    io.emit('activeUsers', activeUsers);
  });

  socket.on('userAction', function(user) {
    activeUsers = activeUsers.filter((u) => { return (u.id !== user.id); });
    activeUsers.push(user);
    io.emit('playerMoved', activeUsers);
  });
});

setInterval(function() {
  io.emit('activeUsers', activeUsers);
  activeUsers.map(user => { user.retryCount--; });
  activeUsers = activeUsers.filter((user) => { return (user.retryCount >= 0); });
  io.emit('reportActive', 'ping');
}, 1000);
