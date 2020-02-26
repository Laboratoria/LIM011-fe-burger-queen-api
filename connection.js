const mongoClient = require('mongodb').MongoClient;

let db;

module.exports = async (url) => {
  // console.log('puerto de mongo db', url);
  // Conectamos al servidor
  if (!db) {
    const client = await mongoClient.connect(url, { useUnifiedTopology: true });
    db = client.db('API-burgerQueen');
  }
  return db;
  // console.log(client.db.collection('users'));

  // retornamos la conexión con el nombre de la bd a usar
};
