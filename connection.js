const mongoClient = require('mongodb').MongoClient;

// Con promesas

/* const config = require('./config');

const { dbUrl } = config;

let database;

module.exports = () => mongoClient.connect(dbUrl, { useUnifiedTopology: true })
  .then((data) => {
    // console.log('Connected successfully to server');
    database = data.db('API-burgerQueen');
    // console.log(database);
    data.close();
    return database;
  });
 */
// Con async y await

let db;

module.exports = async (url) => {
  // Conectamos al servidor
  if (!db) {
    const client = await mongoClient.connect(url, { useUnifiedTopology: true });
    db = client.db('API-burgerQueen');
  }
  return db;
  // retornamos la conexión con el nombre de la bd a usar
};
