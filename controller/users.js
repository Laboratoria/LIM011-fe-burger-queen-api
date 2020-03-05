const bcrypt = require('bcrypt');
const ObjectId = require('mongodb').ObjectID;
const isValidEmail = require('./utils');
const config = require('../config');

const { dbUrl } = config;
const database = require('../connection');


module.exports = {
  getUsers: (req, res, next) => {
    next();
  },
  getUserById: async (req, resp, next) => {
    // console.log('q hay aqui por dios xd', req.params.uid);
    const { uid } = req.params;
    let query;
    if (isValidEmail(uid)) {
      query = { email: uid };
    } else {
      query = { _id: ObjectId(uid) };
    }
    console.log('wiii', uid);

    const db = await database(dbUrl);
    // const usersCollection = await db.collection('users');
    const checkUser = await db.collection('users').findOne(query);
    if (!checkUser) {
      return next(404);
    }
    console.log('buscando', checkUser);
    resp.send({
      _id: checkUser._id,
      email: checkUser.email,
      roles: checkUser.roles,
    });
  },
  createUsers: async (req, resp, next) => {
    const { email, password, roles } = req.body;
    // console.log('a ver xd', req.body);
    // console.log('q hay aqui', email, password, roles);
    if (!email || !password) {
      // console.log('falta email y password');
      return next(400);
    }
    if (password.length < 4) {
      // console.log('password invalido');
      return next(400);
    }
    if (!isValidEmail(email)) {
      // console.log('email invalido');
      return next(400);
    }
    let newRoles;
    if (!roles) {
      // console.log('email invalido');
      newRoles = { admin: false };
    } else {
      newRoles = roles;
    }
    const db = await database(dbUrl);
    const usersCollection = await db.collection('users');
    const checkNewUser = await db.collection('users').findOne({ email });
    if (checkNewUser) {
      return next(403);
    }
    const newUserId = await usersCollection.insertOne({
      email,
      // password,
      password: bcrypt.hashSync(password, 10),
      roles: newRoles,
    });
    // console.log('nuevo usuario', newUserId);
    // resp.status(200).send(newUser);
    const user = await db.collection('users').findOne({ _id: ObjectId(newUserId.insertedId) });
    // console.log('entendiendo', user);
    resp.send({
      _id: user._id,
      email: user.email,
      roles: user.roles,
    });
  },
  updateUser: async (req, res, next) => {
    const { uid } = req.params;
    const { email, password, roles } = req.body;
    const db = await database(dbUrl);
    const collectionUsers = (await db.collection('users'));

    let query;
    if (isValidEmail(uid)) {
      query = { email: uid };
    } else {
      query = { _id: ObjectId(uid) };
    }
    const user = await collectionUsers.findOne(query);
    if (!user) {
      return next(404);
    }

    if (!(email || password)) {
      return next(400);
    }
    const passwords = bcrypt.hashSync(password, 10);
    await collectionUsers.updateOne(
      query, {
        $set: {
          email,
          password: passwords,
          roles,
        },
      },
    );
    const updateUser = await collectionUsers.findOne({ _id: ObjectId(user._id) });
    console.log('se puede modificar', updateUser);
    res.send(updateUser);
    next();
  },
  deleteUser: async (req, resp, next) => {
    const { uid } = req.params;
    const db = await database(dbUrl);
    const collectionUsers = (await db.collection('users'));
    let query;
    if (isValidEmail(uid)) {
      query = { email: uid };
    } else {
      query = { _id: ObjectId(uid) };
    }
    const user = await collectionUsers.findOne(query);
    console.log(user, 'userrrr');
    if (!user) {
      return next(404);
    }

    await collectionUsers.deleteOne(query);
    resp.send({ _id: user._id, email: user.email, roles: user.roles });

    next();
  },
};
