const uWS = require('uWebSockets.js');
const port = 8080;
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log` 
        // - Write all logs error (and below) to `error.log`.
        //
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});
(async function(){
    
})();
const app = uWS.SSLApp({
    key_file_name: 'ssl/key.pem',
    cert_file_name: 'ssl/cert.pem',
    passphrase: 'pqnMufLLjCbAd$n8Mwa4^x_PCk8jAz#tU-hM=c8KFdSfaJGLqkMvNDtz^5RRe?s&zzx!Wy*Nyb7qqdyY!bqcq5VdB-M@W+KpAwhPj6%?aSs48md6wt?&xr%mNSUy3yKT'
}).ws('/*', {
    /* Options */
    compression: 0,
    maxPayloadLength: 16 * 1024 * 1024,
    idleTimeout: 10,
    /* Handlers */
    open: (ws, req) => {
        logger.log('A WebSocket connected via URL: ' + req.getUrl() + ' from:' + ws.connection.remoteAddress);
    },
    message: (ws, message, isBinary) => {
        /* Ok is false if backpressure was built up, wait for drain */
        let ok = ws.send(message, isBinary);
    },
    drain: (ws) => {
        logger.log('debug', 'WebSocket backpressure: ' + ws.getBufferedAmount());
    },
    close: (ws, code, message) => {
        logger.log({
            level: 'debug',
            message: 'Socket connected to:' + ws.connection.remoteAddress + ' closed with code:' + code});
    }
}).listen(port, (token) => {
    if (token) {
      logger.log('info','Listening to port ' + port);
    } else {
      logger.log('error','Failed to listen to port ' + port);
    }
  });