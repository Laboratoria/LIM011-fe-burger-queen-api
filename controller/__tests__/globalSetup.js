/* eslint-disable import/no-extraneous-dependencies */
const { MongoMemoryServer } = require('mongodb-memory-server');
// const db = require('../../conection/connection');

/* module.exports = () => {
  const mongod = new MongoMemoryServer();

  return mongod.getConnectionString()
    .then((url) => {
      // process.env.DB_URL = MongodbUri;
      console.log('viendo conexion test', url);
    });
}; */
module.exports = async () => {
  const mongod = new MongoMemoryServer();
  const con = await mongod.getConnectionString();
  return con;
};
