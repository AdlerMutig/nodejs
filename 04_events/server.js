var express = require("express");
var app = express();
var router = express.Router();
var path = __dirname + '/views/';

router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});

router.get("/",function(req,res){
  res.sendFile(path + "index.html");
});

router.get("/about",function(req,res){
  res.sendFile(path + "about.html");
});

router.get("/contact",function(req,res){
  res.sendFile(path + "contact.html");
});

app.use(require('body-parser').urlencoded());

const CONTACT_ADDRESS = 'me@company.com';

var mailer = require('nodemailer').createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.GMAIL_ADDRESS,
    pass: process.env.GMAIL_PASSWORD,
  }
});

app.post('/contacto', function(req, res) {
  mailer.sendMail({
    from: req.body.from,
    to: [CONTACT_ADDRESS],
    subject: req.body.subject || '[No subject]',
    html: req.body.message || '[No message]',
  }, function(err, info) {
    if (err) return res.status(500).send(err);
    res.json({success: true});
  })
});

app.use("/",router);
//Public for style
app.use(express.static(__dirname + '/public'));

app.use("*",function(req,res){
  res.sendFile(path + "404.html");
});

app.listen(3000,function(){
  console.log("Live at Port 3000");
});