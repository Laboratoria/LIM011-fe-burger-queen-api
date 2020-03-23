const bcrypt = require('bcrypt');
const ObjectId = require('mongodb').ObjectID;
const { isValidEmail, pagination } = require('./utils');
const { isAdmin } = require('../middleware/auth');
const db = require('../conection/connection');


module.exports = {
  getUsers: async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;
    const startIndex = (page - 1) * limit;
    const usersCollection = (await db()).collection('users');
    const allUsers = (await usersCollection.find({})
      .skip(startIndex).limit(limit)
      .toArray())
      .map(({ _id, email, roles }) => ({ _id, email, roles }));
    const numberOfUsers = await usersCollection.find().count();
    const numberOfPages = Math.ceil(numberOfUsers / limit);
    const linksHeader = pagination('users', page, numberOfPages, limit);
    res.set('link', `${linksHeader.first},${linksHeader.last},${linksHeader.prev},${linksHeader.next}`);
    res.send(allUsers);
  },
  getUserById: async (req, resp, next) => {
    const { uid } = req.params;
    let query;
    if (isValidEmail(uid)) {
      query = { email: uid };
    } else {
      query = { _id: ObjectId(uid) };
    }
    const usersCollection = (await db()).collection('users');
    const checkUser = await usersCollection.findOne(query);
    if (!checkUser) {
      return next(404);
    }
    resp.send({
      _id: checkUser._id,
      email: checkUser.email,
      roles: checkUser.roles,
    });
  },
  createUsers: async (req, resp, next) => {
    const { email, password, roles } = req.body;
    if (!email || !password) {
      return next(400);
    }
    if (password.length < 4) {
      return next(400);
    }
    if (!isValidEmail(email)) {
      return next(400);
    }
    let newRoles;
    if (!roles) {
      newRoles = { admin: false };
    } else {
      newRoles = roles;
    }
    const usersCollection = (await db()).collection('users');
    const checkNewUser = await usersCollection.findOne({ email });
    if (checkNewUser) {
      return next(403);
    }
    const newUserId = await usersCollection.insertOne({
      email,
      password: bcrypt.hashSync(password, 10),
      roles: newRoles,
    });
    const user = await usersCollection.findOne({ _id: ObjectId(newUserId.insertedId) });
    resp.send({
      _id: user._id,
      email: user.email,
      roles: user.roles,
    });
  },
  updateUser: async (req, res, next) => {
    const { uid } = req.params;
    const { email, password, roles } = req.body;
    const collectionUsers = ((await db()).collection('users'));
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
    await collectionUsers.updateOne(
      query, {
        $set: {
          email: email || user.email,
          password: password ? bcrypt.hashSync(password, 10) : user.passwords,
          roles: roles || user.roles,
        },
      },
    );
    const updateUser = await collectionUsers.findOne({ _id: ObjectId(user._id) });
    res.send(updateUser);
  },
  deleteUser: async (req, resp, next) => {
    const { uid } = req.params;
    const usersCollection = (await db()).collection('users');
    let query;
    if (isValidEmail(uid)) {
      query = { email: uid };
    } else {
      query = { _id: ObjectId(uid) };
    }
    const user = await usersCollection.findOne(query);
    if (!user) {
      return next(404);
    }

    await usersCollection.deleteOne(query);
    resp.send({ _id: user._id, email: user.email, roles: user.roles });
  },
};
