const bcrypt = require('bcrypt');
const ObjectId = require('mongodb').ObjectID;
const isValidEmail = require('./utils');
const config = require('../config');
const { isAdmin } = require('../middleware/auth');

const { dbUrl } = config;
const database = require('../conection/connection');


module.exports = {
  getUsers: async (req, res, next) => {
    // console.log('viendo el req', req);
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;
    const startIndex = (page - 1) * limit;
    // const endIndex = page * limit;
    /* console.log('viendo los limit', limit);
    console.log('viendo los pages', page);
    console.log('hola', req.params); */
    // const startIndex = (page - 1) * 10;
    const db = await database(dbUrl);
    const allUsers = (await db.collection('users').find()
      .skip(startIndex).limit(limit)
      .toArray())
      .map(({ _id, email, roles }) => ({ _id, email, roles }));
    const numberOfUsers = await db.collection('users').find().count();
    const numberOfPages = Math.ceil(numberOfUsers / limit);
    console.log('numero de usuarios', numberOfUsers);
    console.log('numero de paginas', numberOfPages);
    console.log('todos los usuarios', allUsers);
    const linksHeader = {
      next: `</users?page=${page + 1}&limit=${limit}>; rel="next"`,
      last: `</users?page=${numberOfPages}&limit=${limit}>; rel="last"`,
      first: `</users?page=1&limit=${limit}>; rel="first"`,
      prev: `</users?page=${page > 1 ? page - 1 : 1}&limit=${limit}>; rel="prev"`,
    };
    console.log('links', linksHeader);
    console.log('links|', linksHeader.next);
    res.set('link', `${linksHeader.first},${linksHeader.last},${linksHeader.prev},${linksHeader.next}`);
    res.send(allUsers);
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
    if (!isAdmin(req) && roles) {
      return next(403);
    }
    if (!(email || password)) {
      return next(400);
    }
    const passwords = bcrypt.hashSync(password, 10);
    // if (req.body.email) {
    // user.email = req.body.email;
    //  }
    // if (req.body.password) {
    // user.password = bcrypt.hashSync(req.body.password, 10);
    // }
    await collectionUsers.updateOne(
      query, {
        $set: {
          email: req.body.email || user.email,
          password: passwords || user.passwords,
          roles: user.roles || user.roles,
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
