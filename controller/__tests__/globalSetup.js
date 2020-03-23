// eslint-disable-next-line import/no-extraneous-dependencies
const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = () => {
  const mongod = new MongoMemoryServer();
  return mongod.getConnectionString().then((urL) => {
    process.env.DB_URL = urL;
  });
};
