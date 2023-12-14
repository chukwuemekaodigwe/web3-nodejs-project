const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require("dotenv");
const assert = require("assert");
const config = require('./config')
var cron = require('node-cron');
const mysql = require('mysql2');
const Transfer = require('./controllers/API/tansferAPIs')
const errorMiddleware = require('./middleware/error.middleware')

const websocketFile = require('./controllers/Exchange_Controller/webSocket')
const CryptoJS = require("crypto-js");

var WebSocketServer = require('websocket').server;
var keySize = 256;
var iterations = 100;
const {
    getActiveUser,
    exitRoom,
    newUser,
    getIndividualRoomUsers
  } = require('./userHelper');

const {
    routes
} = require('./routes/routes');
const { Console } = require('console');
// const Connection = require('mysql2/typings/mysql/lib/Connection');

const app = express();

const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: config.password, database: config.database, port: config.mysqlPort });
// now get a Promise wrapped instance of that pool
const promisePool = pool.promise();

/////////////////// SSL CODE ADDED
var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey = fs.readFileSync('ssl/privkey.pem', 'utf8');
var certificate = fs.readFileSync('ssl/fullchain.pem', 'utf8');

var credentials = {key: privateKey, cert: certificate};
 
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

//////////////////////////////////////

var http = require('http').Server(app);

var io = require('socket.io')(httpsServer);
 
// Load config
const stage = process.env.NODE_ENV || 'production';
const env = dotenv.config({
    path: `${stage}.env`
});
assert.equal(null, env.error);
app.set('env', stage);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

  
app.use(cors());

app.post("/test", function (req, res) {
  let pvkey = req.body.pvkey;
  let hash = req.body.hash;
    var private_key = pvkey

    var salt = CryptoJS.lib.WordArray.random(128 / 8);
    var pass = hash;

    var key = CryptoJS.PBKDF2(pass, salt, {
        keySize: keySize / 32,
        iterations: iterations
    });

    var iv = CryptoJS.lib.WordArray.random(128 / 8);

    var encrypted = CryptoJS.AES.encrypt(private_key, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC

    });
    
let privateKey = salt.toString() + iv.toString() + encrypted.toString();
console.log('encrypt private key',privateKey)
})




app.get("/", function (req, res) {
    res.send("node is running")
})

 app.use('/api/', routes)

 cron.schedule("*/1 * * * *", async function () {
  console.log('usertoAdminTransfer');
  const walletData = await promisePool.query(`select uw.public_key,uw.private_key,uw.trc_privatekey,uw.trc_publickey,uw.bnb_privatekey,uw.bnb_publickey,uw.coin_id,uw.user_id,c.symbol,c.test_contract,c.Bnb_contract,c.Trc_contract from user_wallet as uw left join coins as c on uw.coin_id=c.id where uw.public_key <> "null" and coin_id!=1 and coin_id!=4 and coin_id!=8  order by uw.user_id asc`);
  console.log('walletDatawalletData', walletData[0].length)
  // await Transfer.usertoAdminTransfer(walletData[0]);
});

 io.on('connection', socket => {
    console.log('socket connetedd')
    socket.on('joinRoom', async (data) => {
      const ReceiveData = JSON.parse(data)
      // console.log('4343333333333333333333', ReceiveData)
      var ticket_id = ReceiveData.room;
      const [ticketMessage, error] = await promisePool.query(`select * from ticket_message where ticket_id =${ticket_id}`);
      // console.log('ticketMessage', ticketMessage)
      
      if (ticketMessage.length > 0) {
        const user = newUser(socket.id, ReceiveData.username, ReceiveData.room);
  
        socket.join(user.room);
  
        // General welcome
        // socket.emit('message', formatMessage("WebCage", 'Messages are limited to this room! '));
  
        // Broadcast everytime users connects
        // socket.broadcast
        //   .to(user.room)
        //   .emit(
        //     'message',
        //     formatMessage("WebCage", `${user.username} has joined the room`)
        //   );
  
        // Current active users and room name
        io.to(user.room).emit('roomUsers', {
          chatHistory: ticketMessage,
          room: user.room,
          users: getIndividualRoomUsers(user.room)
        });
      }
  
  
  
    });
  
    // Listen for client message
    socket.on('chatMessage', async (newChatdata) => {
      var newchatHistory = JSON.parse(newChatdata)
      const ticket_id = newchatHistory.ticket_id
      const sender = newchatHistory.sender
      const receiver = newchatHistory.receiver
      const message = newchatHistory.message
      const datetime = new Date()
  
      // console.log('socket.id', socket.id)
      const [insertData, error1] = await promisePool.query(`insert into ticket_message SET ticket_id='${ticket_id}',sender='${sender}',receiver='${receiver}',message='${message}'`);
      
      const user = getActiveUser(socket.id);
      console.log('insertData', insertData, user.room)
      const [ticketMessage, error] = await promisePool.query(`select * from ticket_message where ticket_id =${ticket_id}`);
       console.log('insertData', ticketMessage[0])
       
      io.to(user.room).emit('message',user.username, ticketMessage);
    });
  
    // Runs when client disconnects
    socket.on('disconnect', () => {
      const user = exitRoom(socket.id);
  
      if (user) {
        // io.to(user.room).emit(
        //   'message',
        //   formatMessage("WebCage", `${user.username} has left the room`)
        // );
        console.log(`${user.username} has left the room`)
        // Current active users and room name
        io.to(user.room).emit('roomUsers', {
          room: user.room,
          users: getIndividualRoomUsers(user.room)
        });
      }
    });
  });
  
  // ------------------------------Send socket-------------------------------------
  


if (module === require.main) {
  app.use(errorMiddleware)
    var server = app.listen(process.env.PORT || 8088, function () {
  //var server = httpsServer.listen(process.env.PORT || 8088, function () {
        var port = server.address().port;
        console.log("App listening on port %s", port);
    });
}

module.exports = app