const uWS = require('uWebSockets.js');
const gQL = require('graphql');
const qs = require('qs');
const resolvers = require('resolvers.js');
const schema = gQL.buildSchema(`
    type User {
        AcctName: String!
        AcctID: ID!
        Email: String!
        Phone: String!
        VerifiedDriverStatus: Boolean!
        VerifiedUser: Boolean!
        DriverStatus: Boolean!
        PostedRides: [Ride]
    }
    type Ride {
        Driver: User!
        RideID: ID!
        Origin: String!
        Destination: String!
        SeatsAvailable: Int!
        CarType: String
        MiscInfo: String
    }
    query GetRides($destination: String!, $maxAllowedTime: Int!, $minStorage: Int, $minSeats: Int, $token: String!){
        rides: [Ride]
    }
    mutation Signup($email: String!, $password: String!, $name: String!) {
        signup(email: $email, password: $password, name: $name) {
            token: String!
        }
    }
    mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            token: String!
        }
    }
    mutation PostRide($Driver: User!, $Origin: String!, $Destination: String!, $SeatsAvailable: Int!, $CarType: String, $StorageAvailable: String, $MiscInfo: String, $token: String!){
        RideID: ID
    }
    mutation UpdateRide($RideID: ID!, $Origin: String, $Destination: String, $SeatsAvailable: Int, $CarType: String, $StorageAvailable: String, $MiscInfo: String, $token: String!){
        $RideID
    }
    mutation JoinRide($RideID: ID!, $Seats: Int, $token: String!){
        JoinSuccess: Boolean
    }
    mutation DeleteRide($RideID: ID!, $token: String!){
        true
    }
    mutation logout($token: String!){
        true
    }
`);
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
(async function () {

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
            message: 'Socket connected to:' + ws.connection.remoteAddress + 'closed with code:' + code + ' with message:' + message
        });
    }
}).any('/graphql', async (res, req) => {
    logger.log('debug', req.getQuery());
    res.write(await gQL.graphql(schema, qs.parse(req.getQuery()), root));
    res.end("Ended request formerly connected to:" + ws.connection.remoteAddress);
}).listen(port, (token) => {
    if (token) {
        logger.log('info', 'Listening to port ' + port);
    } else {
        logger.log('error', 'Failed to listen to port ' + port);
    }
});