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
  const date = new Date();
  const month = date.getMonth();
  const day = date.getDate();
  const monthRef = ref.child(month);
  const partOfDay = date.getHours();
  if (req.body.plant_id) {
    monthRef.child(day).child(req.body.plant_id).set({
      [partOfDay]: {
        date: `${date.getDate()}-${date.getMonth()}`,
        ...req.body,
      },
    }, (error) => {
      if (error) {
        return res.status(500).json({
          error,
        });
      }
      return res.status(200).json({
        ...req.body,
        date,
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
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth();
  const monthRef = ref.child(month);
  monthRef.child(day).once('value', (snapshot) => {
    res.status(200).send(snapshot.val());
  });
});

app.get('/get_plant_date', (req, res) => {
  // TODO: call firebase and get everuything that has date = date
  const { date, plant_id } = req.query;
  const route = `${date.split('-')[0]}/${date.split('-')[1]}/${plant_id}`;
  ref.child(route).once('value', (snapshot) => {
    res.status(200).json({
      stauts: 200,
      ...snapshot.val(),
    });
  });
});

app.post('/plant_setup', hasId, (req, res) => {
  const date = new Date();
  const hours = date.getHours();
  const day = date.getDate();
  const month = date.getMonth();
  const monthRef = ref.child(month);
  let partOfDay;
  if (hours < 12) {
    partOfDay = 'morning';
  } else if ((hours > 12) && (hours < 18)) {
    partOfDay = 'evening';
  } else {
    partOfDay = 'night';
  }
  monthRef.child(day).child(req.body.plant_id).set({
    [partOfDay]: {
      date: `${date.getDate()}-${date.getMonth()}`,
      ...req.body,
    },
  }, (error) => {
    if (error) {
      return res.status(500).json({
        error,
      });
    }
    return res.status(200).json({
      ...req.body,
      date: `${date.getDate()}-${date.getMonth()}`,
      response: 'ok',
    });
  });
});

app.get('/get_one_today', (req, res) => {
  const monthRef = ref.child(new Date().getMonth());
  const dayRef = monthRef.child(new Date().getDate());
  dayRef.child(req.query.plant_id).once('value', (snapshot) => {
    res.status(200).send(snapshot.val());
  });
});

app.get('/get_month', (req, res) => {
  const { month } = req.query;
  const monthRef = ref.child(month);
  monthRef.once('value', (snapshot) => {
    res.status(200).json({
      stauts: 200,
      ...snapshot.val(),
    });
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
