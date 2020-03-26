const jwt = require('jsonwebtoken');
const ObjectId = require('mongodb').ObjectID;
const db = require('../conection/connection');

module.exports = (secret) => (req, resp, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return next();
  }
  const [type, token] = authorization.split(' ');
  if (type.toLowerCase() !== 'bearer') {
    return next();
  }
  jwt.verify(token, secret, async (err, decodedToken) => {
    if (err) {
      return next(403);
    }
    
    const decode = decodedToken.uid;
    const usersCollection = (await db()).collection('users');
    const exitUser = await usersCollection.findOne({ _id: ObjectId(decode) });


    if (!exitUser) {
      return next(404);
    }
    req.headers.user = exitUser;
  
    next();

  });
};


module.exports.isAuthenticated = (req) => (
  // TODO: decidir por la informacion del request si la usuaria esta autenticada
  req.headers.user
);


module.exports.isAdmin = (req) => (
  // TODO: decidir por la informacion del request si la usuaria es admin
  req.headers.user.roles.admin
);

module.exports.isUserOrAdmin = (req, resp, next) => (
  ((module.exports.isAdmin(req))
  || ((module.exports.isAuthenticated(req).email === req.params.uid)
  || (module.exports.isAuthenticated(req)._id.toString() === (req.params.uid))))
    ? next()
    : next(403)
);


module.exports.requireAuth = (req, resp, next) => (
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : next()
);

module.exports.requireAdmin = (req, resp, next) => (
  // eslint-disable-next-line no-nested-ternary
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : (!module.exports.isAdmin(req))
      ? next(403)
      : next()
);
