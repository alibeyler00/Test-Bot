const mysql = require('mysql2/promise');

let config = null;

async function loadConfig() {
  if (config) return config; // Önceden yüklenmişse tekrar DB'ye gitme

  const connection = await mysql.createConnection({
    host: '89.213.56.27',
    user: '06vito',
    password: '06vito06',
    database: 'botconfig'
  });

  const [rows] = await connection.execute('SELECT name, value FROM settings');
  await connection.end();

  config = {};
  rows.forEach(({ name, value }) => {
    console.log(`Config değeri alındı: ${name} = ${value}`);
    config[name] = value;
  });

  return config;
}

async function getConfigValue(key) {
  const conf = await loadConfig();
  return conf[key] || null;
}

module.exports = {
  loadConfig,
  getConfigValue
};

