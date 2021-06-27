// server.js
// where your node app starts

// init project
var express = require('express');
var validUrl = require('valid-url');
var shortid = require('shortid');
var bodyParser = require("body-parser");
var connectDB = require('./config/db');

var Url = require('./models/url');

var app = express();

var baseUrl = 'https://test-one-deploy.herokuapp.com';

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// connect to mongoDB
connectDB();

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

app.post('/api/shorturl', (req, res) => {
  var url = req.body.url;
  var isValidUrl = validateUrl(url);

  if (!isValidUrl) {
    return res.status(401).json({ error: 'invalid url'});
  }
  
  try {
    Url.findOne({ originalUrl: url }, (err, docUrl) => {
      if (err) { 
        return res.status(404).json({ error: 'url not found'});
      }

      // url ja existente
      if (docUrl) {
        return res.json({ original_url: docUrl.originalUrl , short_url: docUrl.shortUrl });
      }

      // cria a shortId code
      const urlCode = shortid.generate();

      var newUrl = new Url({
        originalUrl: url,
        shortUrl: urlCode,
        longUrl: `${baseUrl}/api/shorturl/${urlCode}`
      });

      newUrl.save(function(err, data) {
        if (err) 
          return res.status(500).json('Server error');
    
          return res.json({original_url: url, short_url: urlCode});
      });
      
    });
  } catch (err) {
    console.error(err);
    res.status(500).json('Server error');
  }
});

app.get('/api/shorturl/:short_url', (req, res) => {
  var short_url = req.params.short_url;

  Url.findOne({ shortUrl: short_url}, (err, data) => {
    if (err) { 
      return res.status(404).json({ error: 'short_url not found'});
    }

    res.redirect(data.originalUrl);
  })
})

function validateUrl(url) {
  var pattern = /^(http|https):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/
  return pattern.test(url);
}

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  var port = listener.address().port;
  console.log(`Your app is listening on port ${port}`);
  console.log(`Your app is running on link http://localhost:${port}`);
});
