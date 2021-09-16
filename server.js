'use strict';

const express = require('express');
const { Server } = require('ws');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({ server });

var clientlist = [];
var listenerList = [];

wss.on('connection', (ws, req) => {
  console.log(`Client connected from: ${req.url}`);

  if(req.url == '/c' && !clientlist.includes(ws)){
    clientlist.push(ws);
    ws.on('message', message => {
      listenerList.forEach(listener => {

        //不正データ検知

        listener.send(message);
      });
    });
    ws.send('connected as client');
  }

  if(req.url == '/l' && !listenerList.includes(ws)){
    listenerList.push(ws);
    ws.send('connected as listener');
  }

  ws.on('close', () => {
    clientlist = clientlist.filter(n => n != ws);
    listenerList = listenerList.filter(n => n != ws);
    console.log('Client disconnected');
  });
});

setInterval(() => {
  wss.clients.forEach(client => {
    if(clientlist.includes(client) || listenerList.includes(client)) return;
    client.send(new Date().toTimeString()+"@"+Math.floor(Math.random() * 3)+"_"+Math.floor(Math.random() * 20));
  });
}, 1000);
