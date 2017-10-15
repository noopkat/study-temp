require('dotenv').config();
const skateboard = require('skateboard');
const Receiver = require('azure-iothub-receiver');
const room = new Set();
let cache; 

const setUpSocket = function() {
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
};

const receiver = new Receiver({
  connectionString: process.env.IOT_CONN_STRING,
  consumerGroup: process.env.IOT_CONSUMER_GROUP 
});

receiver.on('message', function(eventData) {
  const from = eventData.annotations['iothub-connection-device-id'];
  if (from === process.env.IOT_DEVICE_ID) {
    console.log('Message Received:', eventData.body);
    let jsonData = '';
    if (Buffer.isBuffer(eventData.body)) {
      jsonData = eventData.body.toString();
    } else {
      jsonData = JSON.stringify(eventData.body);
    }
    cache = jsonData;
    room.forEach(stream => stream.write(jsonData));
  }
});

receiver.on('error', function(error) {
  console.error(error);
});

setUpSocket();
