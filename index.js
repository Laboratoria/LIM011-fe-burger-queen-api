const express = require('express');
const mongoClient = require('mongodb').MongoClient;
const config = require('./config');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/error');
const routes = require('./routes');
const pkg = require('./package.json');


const { port, dbUrl, secret } = config;
const app = express();


mongoClient.connect(dbUrl, { useUnifiedTopology: true }, (err, db) => {
  console.log(db);
  console.log('conexion satisfactora');
});

// TODO: Conección a la BD en mogodb

app.set('config', config);
app.set('pkg', pkg);

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(authMiddleware(secret));
// CONECCION

// Registrar rutas
routes(app, (err) => {
  if (err) {
    throw err;
  }

  app.use(errorHandler);

  app.listen(port, () => {
    console.info(`App listening on port ${port}`);
  });
});
