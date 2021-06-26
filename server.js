// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.get('/api/timestamp/:date?', (req, res) => {
  var value = req.params.date;    

  // data vazia retorna data atual
  if (value == undefined || value == '') {
    var date = new Date();
    return res.json({ unix: date.getTime(), utc: date.toUTCString() });
  }

  var timestamp = 0;
  var unixResult = 0;
  var utcResult = '';
  let isOnlyNumbers = /^\d+$/.test(value);

  if (isOnlyNumbers) {
    timestamp = new Date(parseInt(value));
    unixResult = timestamp.valueOf();
    utcResult = timestamp.toUTCString();
  } else {
    timestamp = new Date(value);
    unixResult = timestamp.valueOf();
    utcResult = timestamp.toUTCString();
  }

  if (utcResult == 'Invalid Date') {
    return res.json({ error : "Invalid Date" });
  }

  res.json({ unix: unixResult, utc: utcResult });

});

app.get('/api/whoami', (req, res) => {
  var ipaddress = req.ip;
  var language = req.headers['accept-language'];
  var software = req.headers['user-agent'];
  res.json({ ipaddress: ipaddress, language: language, software: software})
})

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  var port = listener.address().port;

  console.log(`Your app is listening on port ${port}`);
  console.log(`Your app is running on link http://localhost:${port}`);
});
