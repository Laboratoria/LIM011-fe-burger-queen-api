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


const init = async () => {
  connectionMongoDB(dbUrl);
  app.set('config', config);
  app.set('pkg', pkg);
};

init();
/*
mongoClient.connect(dbUrl, { useUnifiedTopology: true }, (err, db) => {
  if (err) {
    console.log(`Database error: ${err}`);
  } else {
    console.log('Conexión exitosa de la base de datos');
  }
});
*/


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
