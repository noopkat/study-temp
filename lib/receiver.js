require('dotenv').config();
const EventHubsClient = require('azure-event-hubs').Client;

module.exports = function(callback) {
  const consumerGroup =  '$Default';
  const startTime =  Date.now();
  const connectionString = process.env.IOT_CONN_STRING;
  const ehClient = EventHubsClient.fromConnectionString(connectionString);

  ehClient.open()
    .then(ehClient.getPartitionIds.bind(ehClient))
    .then((partitionIds) => {
      return partitionIds.map((partitionId) => {
        return ehClient.createReceiver(consumerGroup, partitionId, { 'startAfterTime' : startTime})
          .then(function(receiver) {
            console.log(`got receiver on partition ${partitionId}`);
            callback(receiver);
          });
        });
      })
    .catch(function (error) {
      console.log(error.message);
  });
};
