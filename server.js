'use strict';

const express = require('express');
const { Server } = require('ws');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({ server });

var clist = [];
var hlist = [];

wss.on('connection', (ws, req) => {
  console.log(`Client connected from: ${req.url}`);

  if(req.url == '/c' && !clist.includes(ws)) clist.push(ws);
  if(req.url == '/h' && !hlist.includes(ws)) hlist.push(ws);

  ws.on('message', message => {
    wss.clients.forEach(client => {
      if(hlist.includes(client)) client.send(message);
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clist = clist.filter(n => n != ws);
    hlist = hlist.filter(n => n != ws);
  });
});

setInterval(() => {
  wss.clients.forEach(client => {
    if(clist.includes(client) || hlist.includes(client)) return;
    client.send(new Date().toTimeString()+"@"+Math.floor(Math.random() * 3)+"_"+Math.floor(Math.random() * 20));
  });
}, 1000);
