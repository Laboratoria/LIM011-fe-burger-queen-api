const express = require('express');
// const mongoClient = require('mongodb').MongoClient;
const connectionMongoDB = require('./connection');
const config = require('./config');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/error');
const routes = require('./routes');
const pkg = require('./package.json');


const { port, dbUrl, secret } = config;
const app = express();

app.set('config', config);
app.set('pkg', pkg);

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(authMiddleware(secret));

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

// TODO: Conección a la BD en mogodb

/* let database;

// Conexion normal

mongoClient.connect(dbUrl, { useUnifiedTopology: true }, (err, db) => {
  if (err) {
    console.log(err.message);
  }
  console.log('Connected successfully to server');
  database = db;
  console.log(database);
  db.close();
}); */

// Con promesas

/* connectionMongoDB()
  .then((database) => {
    console.log('Connected successfully to server');
    console.log(database);
  }); */

/* mongoClient.connect(dbUrl, { useUnifiedTopology: true })
  .then((db) => {
    console.log('Connected successfully to server');
    db.close();
  }); */

// Con async y await

const init = async () => {
  connectionMongoDB(dbUrl);
  console.log('Connected successfully to server');
};

init();
