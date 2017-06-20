require('dotenv').config();
const skateboard = require('skateboard');
const startReceiver = require('./lib/receiver');
let cache; 

const setUpSocket = function(hubListener) {
  skateboard({
    dir: __dirname + '/public',         
    port : process.env.PORT || 3000,                        
    transports: ['polling', 'websocket']
  }, function(stream) {
    console.log('skateboard connected');
    if (cache !== undefined) {
      stream.write(cache);
    }
    listenForDeviceData(stream, hubListener);
  });
}

const listenForDeviceData = function(stream, hubListener) {
  hubListener.on('message', function(eventData) {
    const from = eventData.annotations['iothub-connection-device-id'];
    if (from === process.env.IOT_DEVICE_ID) {
      const jsonData = JSON.stringify(eventData.body);
      console.log('Message Received: ' + jsonData);
      cache = jsonData;
      stream.write(jsonData);
    }
  });
};

startReceiver().then(hubListener => setUpSocket(hubListener));
