const bcrypt = require('bcrypt');
const ObjectId = require('mongodb').ObjectID;

const config = require('../config');

const { dbUrl } = config;
const database = require('../connection');


module.exports = {
  getUsers: (req, res, next) => {
    next();
  },
  createUsers: async (req, res, next) => {
    const { email, password, roles } = req.body;
    console.log('creado prueba test', req.body);
    if (!email && !password) {
      console.log('err', 400);
      return next(400);
    }
    if (!email || !password) {
      console.log('err', 400);
      return next(400);
    }
    if (email.indexOf('@') === -1) {
      console.log('err', 400);
      return next(400);
    } if (password.length < 2) {
      console.log('err', 400);
      return next(400);
    }
    try {
      const db = await database(dbUrl);
      const collectionUsers = await db.collection('users');
      console.log('collection', collectionUsers);


      const userExist = await collectionUsers.findOne({ email });
      if (userExist) {
        console.log('collection verificando si el usuario ya esta registrador ', userExist);
        return next(403);
      }
      let rol;
      if (!roles) {
        rol = false;
      } else {
        rol = { admin: true };
      }
      console.log('su rol', rol);
      const userId = (await collectionUsers.insertOne({
        email,
        password: bcrypt.hashSync(password, 10),
        roles: rol,
      }));
      // const objuserId = await db.collection('users').findOne({ _id: ObjectId(userId) });
      console.log('userid', userId);
      const user = await db.collection('users').findOne({ _id: ObjectId(userId.insertedId) });
      res.send({
        _id: user._id,
        email: user.email,
        roles: user.roles,
      });
    } catch (error) {
      console.log('Error al conectarse con la base de datos"', error);
    }
    next();
  },
};
