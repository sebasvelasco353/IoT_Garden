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
  const month = new Date().getMonth();
  const day = new Date().getDate();
  const monthRef = ref.child(month);
  if (req.body.plant_id) {
    monthRef.child(day).child(req.body.plant_id).set({
      ...req.body,
    }, (error) => {
      if (error) {
        return res.status(500).json({
          error,
        });
      }
      return res.status(200).json({
        response: 'ok',
      });
    });
  } else {
    monthRef.child(day).once('value', (snapshot) => {
      const counter = snapshot.val() ? Object.keys(snapshot.val()).length + 1 : 1;
      req.body.plant_id = `plant${counter}`;
      next();
    }, (errorObject) => res.status(500).send(errorObject.code));
  }
}

// Endpoints
app.get('/get_plants_today', (req, res) => {
  const monthRef = ref.child(new Date().getMonth());
  monthRef.child(new Date().getDate()).once('value', (snapshot) => {
    res.status(200).send(snapshot.val());
  });
});

app.post('/plant_setup', hasId, (req, res) => {
  // TODO: Refactor this!!!!!
  const month = new Date().getMonth();
  const day = new Date().getDate();
  const monthRef = ref.child(month);
  monthRef.child(day).child(req.body.plant_id).set({
    ...req.body,
  }, (error) => {
    if (error) {
      return res.status(500).json({
        error,
      });
    }
    return res.status(200).json({
      response: 'ok',
    });
  });
});

app.get('/get_one', (req, res) => {
  const monthRef = ref.child(new Date().getMonth());
  const dayRef = monthRef.child(new Date().getDate());
  console.log(req.query);
  dayRef.orderByChild('plant_id').equalTo(req.query.plant_id).once('value', (snapshot) => {
    console.log(snapshot.val());
    res.status(200).send(snapshot.val());
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
