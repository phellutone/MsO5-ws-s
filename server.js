'use strict';

const express = require('express');
const { Server } = require('ws');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`))
  .on('request', req => {
    console.log('url'+req.url);
    console.log('baseUrl'+req.baseUrl);
    console.log('originalUrl'+req.originalUrl);
    console.log('_parsedUrl'+req._parsedUrl);
    console.log('res'+req.res);
  });

const wss = new Server({ server });

var clist =　[];
var cc = 0;

wss.on('connection', ws => {
  console.log('Client connected');
  cc++;

  ws.on('message', message => {
    if(!clist.includes(ws)) clist.push(ws);
    
    wss.clients.forEach(client => {
      if(!clist.includes(client)) client.send(cc+':'+message);
    });
  });
  ws.on('close', () => {
    console.log('Client disconnected');
    clist = clist.filter(n => n != ws);
    cc--;
  });
});



setInterval(() => {
  wss.clients.forEach(client => {
    client.send(new Date().toTimeString()+"@"+Math.floor(Math.random() * 3)+"_"+Math.floor(Math.random() * 20));
  });
}, 1000);

