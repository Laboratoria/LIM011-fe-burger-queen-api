const mongoClient = require('mongodb').MongoClient;
// eslint-disable-next-line import/no-extraneous-dependencies
const { MongoMemoryServer } = require('mongodb-memory-server');

let db;

module.exports = async () => {
  // Conectamos al servidor
  if (!db) {
    const mongod = new MongoMemoryServer();
    const con = await mongod.getConnectionString();
    const client = await mongoClient.connect(con, { useUnifiedTopology: true });
    db = client.db();
    console.log('conexion ', con);
  }
  return db;
  // retornamos la conexión con el nombre de la bd a usar
};
