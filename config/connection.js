var mysql = require('mysql');
let config = {
    host: 'localhost', 
    user: 'root',
    password: 'root',
    database: 'ideatoapp',
    port: 3306 
}
let connection = mysql.createConnection(config);
// let connection  = new sql.ConnectionPool(config)
connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }else{
        console.log("connection created sucessfully")
    }                                   // to avoid a hot loop, and to allow our node script to
  });  

module.exports = connection;