// server.js
// where your node app starts

// init project
var express = require('express');
var validUrl = require('valid-url');
var shortid = require('shortid');
var bodyParser = require("body-parser");
var connectDB = require('./config/db');
var dns = require('dns');

var Url = require('./models/url');
var UrlTested = require('./models/url_tested');

var User = require('./models/user');
var UserExercise = require('./models/user_exercise');
var UserLogs = require('./models/user_logs');

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

//#region [ exercicio 1 ]
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
//#endregion

//#region [ exercicio 2 ]
app.get('/api/whoami', (req, res) => {
  var ipaddress = req.ip;
  var language = req.headers['accept-language'];
  var software = req.headers['user-agent'];
  res.json({ ipaddress: ipaddress, language: language, software: software})
})
//#endregion

//#region [ exercicio 3 ]
app.post('/api/shorturl', (req, res) => {
  var url = req.body.url;
  var isValidUrl = validateUrl(url);

  var urlTestada = new UrlTested({ url: url});
  urlTestada.save((err, data) => {
    if (err) 
      return res.status(500).json('Server error');

    console.log(url);
  });

  if (!isValidUrl) {
    return res.json({ error: 'invalid url'});
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

  // const REPLACE_REGEX = /^https?:\/\//i
  // const formattedUrl = url.replace(REPLACE_REGEX, '');
  // dns.lookup(formattedUrl, function (err, address, family) {
  //   if (address == undefined || address == null) {
  //     return res.status(401).json({ error: 'invalid url'});
  //   }    
  // });

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
//#endregion

app.post('/api/users', (req, res) => {
  var username = req.body.username;
  if (username == undefined || username == null || username == '' || username.trim().length == 0) {
    return res.send('Path `username` is required.');
  }

  User.findOne({ username: username}, (err, user) => {
    if (err) {
      return res.json({ error: 'an error occurred'});
    }
    
    if (user == null) {
      var newUser = new User({ username: username });
      newUser.save(newUser, (err, doc) => {
        if (err) {
          return res.send('an error occurred while trying creating new user');
        }

        return res.json(doc);
        // User.findById(doc._id).select({ username: 1, _id: 1 }).exec((err, result) => {
        //   if (err) {
        //     return res.json({ error: 'an error occurred'});
        //   }

        //   return res.json(result);
        // })
        
      })
    } else {
      return res.send('Username already taken');
    }
  });
});

app.get('/api/users', (req, res) => {
  User.find().select({ _id: 1, username: 1}).exec((err, users) => {
    if (err) {
      return res.json({ error: 'an error occurred'});
    }

    return res.json(users);
  })
});

app.post('/api/users/:_id/exercises', (req, res) => {
  var description = req.body.description;
  var duration = req.body.duration; 
  var date = (req.body.date == undefined || req.body.date == '') ? new Date() : new Date(req.body.date);
  var userId = req.params._id;
  var utcResult = date.toUTCString();
  if (utcResult == 'Invalid Date') {
    res.send(`Cast to date failed for value "${req.body.date}" at path "date"`);
    return null;
  }

  if (description == undefined || description == '') {
    res.send('Path `description` is required.');
    return null;
  }

  if (description == undefined || description == '') {
    res.send('Path `description` is required.');
    return null;
  }

  if (description.length > 15) {
    res.send('description too long');
    return null;
  }

  if (isNaN(duration) == true) {
    res.send(`Cast to Number failed for value "${duration}" at path "duration"`);
    return null;
  }

  if (duration == undefined || duration == '') {
    res.send('Path `duration` is required.');
    return null;
  }

  if (duration <= 0) {
    res.send('duration too short');
    return null;
  }

  User.findById(userId, (err, user) => {
    if (err) {
      return res.send('user not found');
    }

    var newUserExercise = new UserExercise({
      username: user.username,
      duration: duration,
      description: description,
      date: date.toDateString()
    });
    newUserExercise.save((err, doc) => {
      if (err) {
        return res.send('an error occurred while trying creating new exercise');
      }
      return res.json(doc);
    });
  })

  
});

app.get('/api/users/:_id/logs', (req, res) => {
  var userId = req.params._id;
  var limit = req.query.limit == undefined ? 10 : parseInt(req.query.limit);
  var from_date = req.query.from;
  var to_date = req.query.to;

  User.findById(userId, (err, user) => {
    if (err) {
      return res.send('user not found');
    }

    // check if request query has value
    if (Object.keys(req.query).length === 0) {
      UserExercise.find({ username: user.username })
      .select({ description: 1, duration: 1, date: 1 })
      .limit(limit)
      .exec((err, exercises) => {
        if (err) {
          return res.send('an error occurred while trying retrieve user exercises');
        }

        return res.json({
          _id: user._id,
          username: user.username,
          count: exercises == null ? 0 : exercises.length,
          log: exercises
        })
      });
    } else {
      
      from_date = from_date == undefined ? new Date().toDateString() : from_date;
      to_date = to_date == undefined ? new Date().toDateString() : to_date;

      UserExercise.find({ username: user.username, date: {"$gte": from_date, "$lte": to_date} })
          .select({ description: 1, duration: 1, date: 1 })
          .limit(limit)
          .exec((err, exercises) => {
            if (err) {
              console.log(err)
              return res.send('an error occurred while trying retrieve user exercises');
            }

            return res.json({
              _id: user._id,
              username: user.username,
              count: exercises == null ? 0 : exercises.length,
              log: exercises
            })
          });
    }

/*

*/


    
  })
})


function validateUrl(url) {
  var expression = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
  var regex = new RegExp(expression, 'i');
  return regex.test(url);
}

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  var port = listener.address().port;
  console.log(`Your app is listening on port ${port}`);
  console.log(`Your app is running on link http://localhost:${port}`);
});
