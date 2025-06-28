const { broadcastLog } = require('../websocket');
const ENABLE_WS = process.env.ENABLE_WEBSOCKET_LOGS === 'true';

function formatLog(level, ...args) {
  const time = new Date().toLocaleTimeString('tr-TR');
  return `[${time}] [${level.toUpperCase()}] ${args.join(' ')}`;
}

function logToConsoleAndWS(level, ...args) {
  const formatted = formatLog(level, ...args);

  switch (level) {
    case 'debug':
      console.debug(formatted);
      break;
    case 'info':
      console.info(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'error':
      console.error(formatted);
      break;
    default:
      console.log(formatted);
  }

  if (ENABLE_WS) broadcastLog(formatted);
}

module.exports = {
  log: (...args) => logToConsoleAndWS('log', ...args),
  debug: (...args) => logToConsoleAndWS('debug', ...args),
  info: (...args) => logToConsoleAndWS('info', ...args),
  warn: (...args) => logToConsoleAndWS('warn', ...args),
  error: (...args) => logToConsoleAndWS('error', ...args),
};
