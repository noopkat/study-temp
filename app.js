require('dotenv').config();
const skateboard = require('skateboard');
const startReceiver = require('./lib/receiver');
const room = new Set();
let cache; 

const setUpSocket = function(hubListener) {
  skateboard({
    dir: __dirname + '/public',         
    port : process.env.PORT || 3000,                        
    transports: ['polling', 'websocket']
  }, function(stream) {
    console.log('skateboard connected');
    room.add(stream);
    if (cache !== undefined) {
      stream.write(cache);
    }
    stream.on('end', function() {
      room.delete(stream);
    });
  });
  
  listenForDeviceData(hubListener);
};

const listenForDeviceData = function(hubListener) {
  hubListener.on('message', function(eventData) {
    const from = eventData.annotations['iothub-connection-device-id'];
    if (from === process.env.IOT_DEVICE_ID) {
      const jsonData = JSON.stringify(eventData.body);
      console.log('Message Received: ' + jsonData);
      cache = jsonData;
      room.forEach(stream => stream.write(jsonData));
    }
  });
};

startReceiver().then(hubListener => setUpSocket(hubListener));
