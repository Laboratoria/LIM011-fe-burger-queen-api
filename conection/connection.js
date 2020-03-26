const mongoClient = require('mongodb').MongoClient;
const config = require('../config');

const { dbUrl } = config;

let db;

module.exports = async () => {
  // Conectamos al servidor
  if (!db) {
    const client = await mongoClient.connect(dbUrl, { useUnifiedTopology: true });
    db = client.db('API-burgerQueen');
  }
  return db;
  // retornamos la conexión con el nombre de la bd a usar
};
