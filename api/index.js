var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var admin = require("firebase-admin");
// Fetch the service account key JSON file contents
var serviceAccount = require("./smartGarden_secret.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://smartgarden-81573-default-rtdb.firebaseio.com/"
});

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Database references
var db = admin.database();
var ref = db.ref("/plants");


// Endpoints
app.get("/get_plants", function(req, res){
    var arr = [];
    ref.on("value", function(snapshot) {
      if(snapshot.val()){
        const keys = Object.keys(snapshot.val());
        keys.forEach((key, index) => {
          console.log(key);
          arr.push({
            id: key,
            content: snapshot.val()[key]
          })
        });
      };
    });
    res.status(200).json({
      response: arr
    })
});

app.post("/plant_setup", hasId, function(req, res){
    // TODO: Refactor this!!!!!
    
    var date = new Date().toString();
    var plantRef = ref.child(req.body.plant_id);
    plantRef.child(date).set({
        ...req.body
    }, function(error) {
        if (error) {
            console.error("Data could not be saved." + error);
            res.status(500).json({
                error
            });
        } else {
            console.log("Data saved successfully.");
            res.status(200).json({
                "response": "ok"
            })
        }
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// middleware
function hasId(req, res, next) {
  console.log("holis form hasId");
    if (req.body.plant_id) {
        var date = new Date().toString();
        var plantRef = ref.child(req.body.plant_id);
        plantRef.child(date).set({
            ...req.body
        }, function(error) {
            if (error) {
                console.error("Data could not be saved." + error);
                res.status(500).json({
                    error
                });
            } else {
                console.log("Data saved successfully.");
                res.status(200).json({
                    "response": "ok"
                })
            }
        });
        return;
    } else {
        ref.once("value", function(snapshot) {
            req.body.plant_id = snapshot.val() ? Object.keys(snapshot.val()).length + 1 : 1;
            next();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        console.log("hello from the future");
        return;
    }
}

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err);
  // render the error page
  res.status(err.status || 500);
  res.send('err');
});

module.exports = app;
