const clients = new Set();

function broadcastLog(message) {
  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(message);
    }
  }
}

module.exports = {
  clients,
  broadcastLog,
};
