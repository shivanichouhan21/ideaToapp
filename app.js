var express = require('express');
var morgan = require('morgan')


var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
let cors = require("cors")
var db = require('./config/connection');
const dotenv = require('dotenv');
dotenv.config();


// let sendMailToUser = require("./routes/sendMailToUser")

let appDetail = require("./routes/appDetails")
// let book_table = require("./routes/book_table")
// let contact_us = require("./routes/contact_us")
// let eventsList =require("./routes/events");
// let galleryList = require("./routes/gallery");
// let chefsList =require("./routes/chefsList")

app.use(morgan('combined'))

app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
    res.header('Access-Control-Allow-Credentials', true);

    next();
});


// Body-parser middleware
// app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json({limit:'50mb'}));

app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
app.use(bodyParser.json())

const corsOptions = {
    allowedHeaders: ['origin', 'x-requested-with', 'content-type', 'accept', 'authorization'],
    credentials: false,
    origin: ['http://localhost:3001', 'http://localhost:3000'],
}
app.use(cors(corsOptions))
app.options('*', cors()) // include before other routes
app.use(cors());
// sk_test_51Ky9e6SDmI5mPYPPh376ZVPyhgYt8LgcIUPr9GlFQL2PpLINRyzHukxkBRcv22npqZngKzj3ybnrkpIKGXEV4CDB00WCcTYnoI

//apis
app.use("/app", appDetail)
// app.use("/table",book_table);
// app.use("/contact",contact_us);
// app.use("/events",eventsList);
// app.use("/sendMailToUser",sendMailToUser);
// app.use("/gallery",galleryList);
// app.use("/chef",chefsList)









var server = app.listen(3200, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://localhost", host, port)
})