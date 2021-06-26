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

app.get('/api/:date?', (req, res) => {
  var value = req.params.date;    

  // data vazia retorna data atual
  if (value == undefined || value == '') {
    var date = new Date();
    return res.json({ unix: date.getTime(), utc: date.toUTCString() });
  }

  var isValidDate = validateDate(value);

  if (isValidDate == 'Invalid Date') {
    return res.json({ error : "Invalid Date" });
  }

  var unixResult = 0;
  var utcResult = '';

  if (value.includes('-')) {
    var isValid = (new Date(value)).getTime() > 0;
    if (isValid) {
      var parts = value.split('-');
      var date = new Date(parts[0], parts[1]-1, parts[2]); 
      unixResult = date.getTime(); 
      utcResult = date.toUTCString();     
    } else {
      return res.json({ error : "Invalid Date" });
    }
  } else {
    var isValid = (new Date(parseInt(value))).getTime() > 0;
    if (isValid) {
      unixResult = parseInt(value);
      utcResult = new Date(parseInt(value)).toUTCString();
    } else {
      return res.json({ error : "Invalid Date" });
    }    
  }

  return res.json({ unix: unixResult, utc: utcResult });
});

function validateDate(date_string) {
  var isTimestamp = /^\d+$/.test(date_string) && date_string.length == 13;
  if (isTimestamp) {
    return new Date(parseInt(date_string));
  }

  return new Date(date_string);
}

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  var port = listener.address().port;

  console.log(`Your app is listening on port ${port}`);
  console.log(`Your app is running on link http://localhost:${port}`);
});
