const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');
const db = require('../conection/connection');

const { secret } = config;

/** @module auth */
module.exports = (app, nextMain) => {
  /**
   * @name /auth
   * @description Crea token de autenticación.
   * @path {POST} /auth
   * @body {String} email Correo
   * @body {String} password Contraseña
   * @response {Object} resp
   * @response {String} resp.token Token a usar para los requests sucesivos
   * @code {200} si la autenticación es correcta
   * @code {400} si no se proveen `email` o `password` o ninguno de los dos
   * @auth No requiere autenticación
   */
  app.post('/auth', async (req, resp, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(400);
    }

    // TODO: autenticar a la usuarix
    const usersCollection = (await db()).collection('users');
    const checkUser = await usersCollection.findOne({ email });
    if (!checkUser) {
      return next(404);
    }
    const comparePasswords = await bcrypt.compare(password, checkUser.password);
   
    if (!comparePasswords) {
      return next(404);
    }
    const token = jwt.sign({ uid: checkUser._id }, secret, { expiresIn: '3h' });
   
    resp.status(200).send({ token });
 
    next();
  });

  return nextMain();
};
