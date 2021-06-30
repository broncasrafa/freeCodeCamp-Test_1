const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
require('dotenv').config()

//MONGODB
const URL_MONGO =  "mongodb+srv://broncasrafa:broncasrafaAdmin@cluster0.6fgsm.mongodb.net/db_tracker?retryWrites=true&w=majority";

// Create Schema
const mongoose = require('mongoose')
const Schema = mongoose.Schema
mongoose.connect(URL_MONGO, {useNewUrlParser: true, useUnifiedTopology: true})

// create schema [user schema, userExerciseSchema]
const userSchema = new Schema({
  user_name: { type: String, required: true }
})

const ExerciseSchema = new Schema({
  user_id: { type: String, required: true },
  user_name : { type: String, required: true },
  date: { type: Date, required: true },
  duration: { type: Number, required: true },
  description: { type: String, required: true }
})

// Create user_account model
const UserAccountModel = mongoose.model("user_account", userSchema);

// Create user_account model
const ExerciseModel = mongoose.model("exercise", ExerciseSchema);


// Function Find Username
let findUserId = function(userId_post, done) {
    console.log("FindUserId Function is running")
    console.log(userId_post)
    UserAccountModel.findById(userId_post, function (err, data) {
      //if (err) return console.log(err);
      done(data);
    })
  }

// Function Find userid ini exercise table
let findUserIdLog = function(userId_post, done) {
    console.log("FindUserIdLog Function is running")
    console.log(userId_post)
    ExerciseModel.find({user_id: userId_post}, function (err, data) {
      if (err) return console.log(err);
      console.log("done 51")
      console.log(data)
      done(data);
    });
  };

// Function add exercise
let addExercise = function(arg, done) {
  console.log("addExercise function is running...")
  let insertExercise = new ExerciseModel({
    user_id: arg._id,
    user_name: arg.username,
    description: arg.description,
    duration : arg.duration,
    date : arg.date
    });

    insertExercise.save(function(err, data) {
      if (err) return console.error(err);
      done(data)
    })
}

// Function find all collection
let findAllUsers = function(done){
  UserAccountModel.find({}, function(err, data){
    done(data);
  })
}

//MONGODB END





app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})


app.post('/api/exercise/new-user', (req, res) => {
  console.log("/api/exercise/new-user -- running...")
  let data_response = {}
  
  let username_post = req.body.username
  console.log(username_post)

  if (username_post == "") {res.send('<pre style="word-wrap: break-word; white-space: pre-wrap;">Path `username` is required.</pre>')}

  let findUsername = function(username_post, done) {
    UserAccountModel.findOne({user_name: username_post}, function (err, data) {
      if (err) return console.log(err);
      done(data);
    });
  };

  findUsername(username_post, (data) => {
    console.log("done is running")
    if (data !== null) {
      res.send('<pre style="word-wrap: break-word; white-space: pre-wrap;">Username already taken</pre>')
    } else {

        let createAndSaveUser = function(done) {
          console.log("Save user is running...")
          let userInsert = new UserAccountModel({user_name: username_post});

          userInsert.save(function(err, data) {
            if (err) return console.error(err);
            done(data)
            })
          }

        createAndSaveUser((data) => {
          console.log(data)
          res.json({
            username: data["user_name"],
            _id: data["_id"]
          })
        })

      }
  })

})


// ADD EXERCISE POST HANDLING
app.post('/api/exercise/add', (req, res) => {
  // 5ff046f12c73f103204538f4 - As sample
  console.log('/api/exercise/add - running..')
  console.log(req.body)

  findUserId(req.body.userId, (data) => {
    console.log(data)
    if(data == undefined) {
      res.send('Cast to ObjectId failed for value ' + req.body.userId + ' at path "_id" for model "Users"')
      return null
    }

    if(req.body.description == '') {
      res.send('Path `description` is required.')  
      return null   
    }

    if(req.body.duration == '') {
      res.send('Path `duration` is required.')  
      return null   
    }   
      
    if(isNaN(req.body.duration) == true) {
      res.send('Cast to Number failed for value "' + req.body.duration + '" at path "duration"')
      return null
    }

    let date_exercise;
    console.log(req.body.date)
    if(req.body.date === undefined || req.body.date == "") {
      console.log("Date Kosong ke Trigger")
      date_exercise = new Date()
        console.log("today's default date : " + date_exercise)
    } else {
      date_exercise = new Date(req.body.date)
        console.log("Input date from user is : " + date_exercise)

      if(date_exercise == 'Invalid Date'){
       res.send('Cast to date failed for value "' + req.body.date + '" at path "date"') 
       return null
      } 
    }
    
    let date_exercise_display = date_exercise.toDateString();
      console.log(date_exercise)
      console.log(date_exercise_display)

    let finalData = {
      _id: req.body.userId,
      username: data['user_name'],
      date: date_exercise,
      duration: req.body.duration,
      description: req.body.duration
    }

    let finalDataDisplay = {
      _id: req.body.userId,
      username: data['user_name'],
      date: date_exercise_display,
      duration: parseInt(req.body.duration),
      description: req.body.description
    }

    console.log(finalData);

    //

    addExercise(finalData, (data) => {
      console.log(data)
      if(data._id !== null){
        res.json(finalDataDisplay)
      }
      
    })



  })

})
// ADD EXERCISE POST HANDLING - END


// HANDLING GET REQUEST
// 5fec8f9dc5b5cf05d08057bd
// https://boilerplate-project-exercisetracker.aryamaulana.repl.co/api/exercise/log?userId=6002963892a067029dfb1500

app.get('/api/exercise/log', (req, res) => {
  console.log("/api/exercise/log - running...")
  console.log(req.query.userId)
  
  findUserIdLog(req.query.userId, (data) => {
    console.log("Line 231")
    console.log(data)
    //console.log(data[0]['user_id'])

    if (data.length == 0) {
      
    UserAccountModel.findById(req.query.userId, function (err, data) {
      console.log(data)
      console.log("239")
      if(data !== undefined) {

        res.json({
          _id: data["_id"],
          username: data["user_name"],
          count: 0,
          log: []
        })

      } else {
      
        res.send('Cast to ObjectId failed for value "' + req.query.userId + '" at path "_id" for model "Users"')
        return null

      }
    })


      
    } else {
      console.log("Jumlah Record : " + data.length)
      console.log(data)

      console.log("--Data Date From & To From Post--")
      console.log("Tanggal From : " + req.query.from)
      console.log("Tanggal To : " + req.query.to)

      let fromParam = new Date(req.query.from)
      let toParam = new Date(req.query.to)

      let isFromDatePosted = true
      let isToDatePosted = true

      if (fromParam == "Invalid Date") {
        fromParam = new Date('1000-01-01')
        isFromDatePosted = false
        console.log("modifying from param trigerred")

      }

      if (toParam == "Invalid Date") {
        isToDatePosted = false
        toParam = new Date()
        console.log("modifying to param trigerred")
      }

      console.log(fromParam)
      console.log(toParam)

      const logFiltered = data.filter(data => data.date >= fromParam && data.date <= toParam )
      console.log(logFiltered)

      let log = logFiltered.map((data)=>{
        return {description: data.description,
        duration: data.duration,
        date: data.date.toDateString()}
      })
      console.log(log); // [ 'John', 'Amy', 'camperCat' ]

      let log2 = []

      console.log(req.query.limit)
      if (!isNaN(req.query.limit)) {
        console.log("Limit trigerred")
        for(i=0; i<req.query.limit && req.query.limit <= log.length; i++){
          log2.push(log[i])
        }
      }

      console.log(log2)

      let finalData = {
        _id: data[0]["user_id"],
        username: data[0]["user_name"]
      }

      if(isFromDatePosted == true) {
        finalData["from"] = fromParam.toDateString()
      }

      if(isToDatePosted == true) {
        finalData["to"] = toParam.toDateString()
      }

      if (log2.length > 0) {
        log = log2
      }

      finalData["count"] = log.length

      finalData["log"] = log

      res.json(finalData)
      
    }


  })

})

app.get('/api/exercise/users', (req, res) => {
  
  findAllUsers(function(data){
    console.log(data)
    data2 = []

    for(i=0; i<data.length; i++){
      data2.push({
        _id : data[i]["_id"],
        username : data[i]["user_name"],
        __v : data[i]["__v"]
      })
    }

    res.json(data2)
  })
})


// PORT SETTING
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})