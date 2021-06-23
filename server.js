'use strict';

const express = require('express');
const { Server } = require('ws');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({ server });

var clist = {
  get: [],
  post: []
};

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('message', message => {
    //message analyze
    var msg = JSON.parse(message);
    //push clist
    if(msg.head == 'get'){
      if(!clist.get.includes(ws)) clist.get.push(ws)
    }else if(msg.head == 'post'){
      if(!clist.post.includes(ws)) clist.post.push(ws)
    }
    
    clist.get.forEach((client) => {
      client.send(msg.data);
    });
  });
  ws.on('close', () => {
    console.log('Client disconnected');
    //pop clist
    clist = clist.filter(n => n != ws)
  });
});



setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(new Date().toTimeString());
  });
}, 1000);

