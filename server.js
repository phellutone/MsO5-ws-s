'use strict';

const express = require('express');
const { Server } = require('ws');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({ server });

var clist =　[];

wss.on('connection', ws => {
  console.log('Client connected');
  ws.on('message', message => {
    if(!clist.includes(ws)) clist.push(ws);
    
    wss.clients.forEach(client => {
      if(!clist.includes(client)) client.send(client+':'+message);
    });
  });
  ws.on('close', () => {
    console.log('Client disconnected');
    clist = clist.filter(n => n != ws)
  });
});



setInterval(() => {
  wss.clients.forEach(client => {
    client.send(new Date().toTimeString());
  });
}, 1000);

