const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');

const { dbUrl } = config;
const database = require('../conection/connection');

// console.log(db);


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
    const db = await database(dbUrl);
    const checkUser = await db.collection('users').findOne({ email });
    if (!checkUser) {
      console.log('no existe el usuario registrado');
      return next(404);
    }
    const comparePasswords = await bcrypt.compare(password, checkUser.password);
    /* console.log(password);
    console.log(checkUser.password); */
    if (!comparePasswords) {
      return next(404);
    }
    const token = jwt.sign({ uid: checkUser._id }, secret, { expiresIn: '3h' });
    console.log('auth', checkUser);
    console.log('auth', token);
    resp.send({ token });
    console.log('token(200) :)');
    // next();
  });

  return nextMain();
};
