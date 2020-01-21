const gQL = require('graphql');
const threads = require('threads');
const NodeCache = require('node-cache');
const tokenCache = new NodeCache({ checkperiod: 0 });
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const bcrypt = require('bcrypt');
const saltRounds = 10;
(async () => {
  let client = await MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  let db = client.db('hitchhike')
  module.exports = {
    token:(UserID)=>{
        const token = uuidv1();
        tokenCache.set(await bcrypt.hash(token, saltRounds), UserID);
        return token;
    },
    Query: {
        GetRides: async ()=>{

        }
    },
    Mutation: {
      Login: async(email, password)=>{
        const match = await bcrypt.compare(password,  db.collection('users').findOne({email: email}, {pwdhash: 1, _id: 0}));
        if(match){
          return this.token(db.collection('users').findOne({email: email}, {UserID: 1, _id: 0}));
        }
      },
      PostRide: async (DriverID, origin, destination, seatsAvailable, token)=>{
        if(!!!tokenCache.get(await bcrypt.hash(token, saltRounds))){
          return;
        }
        else{
          db.collection('rides').insertOne({UserID: DriverID, Origin:origin, Destination:destination, SeatsAvailable:seatsAvailable});
          return uuidv1();
        }
      },
      UpdateRide: async(DriverID, origin, destination, seatsAvailable, token)
    }
  } 
})();
