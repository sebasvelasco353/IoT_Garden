const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const admin = require('firebase-admin');
// Fetch the service account key JSON file contents
const serviceAccount = require('./smartGarden_secret.json');

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://smartgarden-81573-default-rtdb.firebaseio.com/',
});

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Database references
const db = admin.database();
const ref = db.ref('/plants');

// middleware
function hasId(req, res, next) {
  if (req.body.plant_id) {
    const date = new Date().toString();
    const plantRef = ref.child(req.body.plant_id);
    plantRef.child(date).set({
      ...req.body,
    }, (error) => {
      if (error) {
        res.status(500).json({
          error,
        });
      } else {
        res.status(200).json({
          response: 'ok',
        });
      }
    });
    // return;
  } else {
    ref.once('value', (snapshot) => {
      req.body.plant_id = snapshot.val() ? Object.keys(snapshot.val()).length + 1 : 1;
      next();
    }, (errorObject) => {
      res.status(500).send(errorObject.code);
    });
    // return;
  }
}

// Endpoints
app.get('/get_plants', (req, res) => {
  const arr = [];
  ref.on('value', (snapshot) => {
    if (snapshot.val()) {
      const keys = Object.keys(snapshot.val());
      keys.forEach((key) => {
        arr.push({
          id: key,
          content: snapshot.val()[key],
        });
      });
    }
  });
  res.status(200).json({
    response: arr,
  });
});

app.post('/plant_setup', hasId, (req, res) => {
  // TODO: Refactor this!!!!!

  const date = new Date().toString();
  const plantRef = ref.child(req.body.plant_id);
  plantRef.child(date).set({
    ...req.body,
  }, (error) => {
    if (error) {
      res.status(500).json({
        error,
      });
    } else {
      res.status(200).json({
        response: 'ok',
      });
    }
  });
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});
// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err);
  // render the error page
  res.status(err.status || 500);
  res.send('err');
});

module.exports = app;
