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
var statelist = [];
var otherlist = [];

const stateResponce = data => {
  statelist.forEach(req => {
    req.send(`current state,
      clients: ${clientlist.length},
      listeners: ${listenerList.length},
      state requests: ${statelist.length},
      others: ${otherlist.length},
    `+data);
  });
}

wss.on('connection', (ws, req) => {
  console.log(`Client connected from: ${req.url}`);

  if(req.url == '/c' && !clientlist.includes(ws)){
    clientlist.push(ws);
    ws.on('message', message => {

      //不正データ検知

      listenerList.forEach(listener => {
        listener.send(message);
      });
      stateResponce(`
        state change: on message,
        data: ${message},
      `);
    });
    ws.send('connected as client');
  }else if(req.url == '/l' && !listenerList.includes(ws)){
    listenerList.push(ws);
    ws.send('connected as listener');
  }else if(req.url == '/currentstaterequest' && !statelist.includes(ws)){
    statelist.push(ws);
    ws.send('connected as state request');
  }else if(!otherlist.includes(ws)){
    otherlist.push(ws);
  }

  stateResponce(`
    state change: on connection,
  `);

  ws.on('close', () => {
    clientlist = clientlist.filter(n => n != ws);
    listenerList = listenerList.filter(n => n != ws);
    statelist = statelist.filter(n => n != ws);
    otherlist = otherlist.filter(n => n != ws);
    stateResponce(`
      state change: on close,
    `);
    console.log('Client disconnected');
  });
});

setInterval(() => {
  otherlist.forEach(other => {
    other.send(new Date().toTimeString()+"@"+Math.floor(Math.random() * 3)+"_"+Math.floor(Math.random() * 20));
  });
}, 1000);
