
const db = require('../conection/connection');

const prueba = async () => {
  const dbs = await db();

  const c = await dbs.collection('users').find();
  return c;
};
console.log('prueba collection', prueba());
