/* eslint-disable import/no-extraneous-dependencies */
const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = () => {
  const mongod = new MongoMemoryServer();

  return mongod.getConnectionString()
    .then((MongodbUri) => {
      process.env.DB_URL = MongodbUri;
      console.log('viendo conexion', MongodbUri);
    });
};
