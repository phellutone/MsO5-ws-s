'use strict';

/** @type {{ name: String, list: Array<{ id: Number, uuid: String, c_uuid: String }> }} */
const uuid = require('./uuid.json')

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

var stateinfo = '';

const stateResponce = data => {
  stateinfo = `
    clients: ${clientlist.length},
    listeners: ${listenerList.length},
    state requests: ${statelist.length},
    others: ${otherlist.length},
  `+data;
}

wss.on('connection', (ws, req) => {
  console.log(`Client connected from: ${req.url}`);

  if(req.url == '/c' && !clientlist.includes(ws)){
    clientlist.push(ws);
    ws.on('message', message => {

      let err_msg = '';
      let sdata = undefined;
      try{
        let mdata = message.split('_');

        if(mdata.length < 3) throw new Error('invalid value')

        let id = uuid.list.find(c => c.uuid == mdata[0])
        let id_number = (id)? id.id : mdata[0]
        if(isNaN(id_number) || id_number < 1 || 21 < id_number) throw new Error('invalid id value')

        let color_number = isNaN(mdata[1])? 99 : mdata[1]
        let state_number = isNaN(mdata[2])? 99 : mdata[2]

        sdata = JSON.stringify({
          id: id_number,
          color: color_number,
          state: state_number
        });

        listenerList.forEach(listener => {
          listener.send(sdata);
        });
      }catch(e){
        err_msg = e;
      }
      
      stateResponce(`
        state change: on message,
        data: ${sdata || message},
        msg: ${err_msg},
        org: ${message}
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
  statelist.forEach(req => {
    req.send(new Date().toTimeString()+stateinfo);
  })
  listenerList.forEach(other => {
    other.send(new Date().toTimeString());
  });
  clientlist.forEach(other => {
    other.send(new Date().toTimeString());
  });
  otherlist.forEach(other => {
    other.send(new Date().toTimeString());
  });
}, 1000);
