// const ObjectId = require('mongodb').ObjectID;
const {
  createUsers,
  getUserById,
  getUsers,
  deleteUser,
  updateUser,
} = require('../usersController');
const database = require('../../conection/__mocks__/connection');

describe('createUsers', () => {
  beforeAll(async () => {
    await database();
    const collectionUsers = await (await database()).collection('users');
    // eslint-disable-next-line no-unused-vars
    await collectionUsers.insertMany([
      {
        email: 'tester1@test.pe',
        roles: { admin: true },
      },
      {
        email: 'tester2@test.pe',
        roles: { admin: false },
      },
    ]);
    // console.log('users', users);
  });
  afterAll(async () => {
    await (await database()).collection('users').deleteMany({});
    (await database()).close();
  });
  it('Debería responder con 400 cuando falta correo', (done) => {
    const req = {
      body: {
        password: 'test123',
        roles: {
          admin: false,
        },
      },
    };
    const next = (code) => {
      expect(code).toBe(400);
      done();
    };
    createUsers(req, {}, next);
  });
  it('Debería responder con 400 cuando falta password', (done) => {
    const req = {
      body: {
        email: 'tester@test.pe',
        roles: {
          admin: false,
        },
      },
    };
    const next = (code) => {
      expect(code).toBe(400);
      done();
    };
    createUsers(req, {}, next);
  });
  it('Debería responder con 400 cuando el password tiene menos de 6 caracteres', (done) => {
    const req = {
      body: {
        email: 'tester@test',
        password: 'te',
        roles: {
          admin: false,
        },
      },
    };
    const next = (code) => {
      expect(code).toBe(400);
      done();
    };
    createUsers(req, {}, next);
  });
  it('Debería responder con 400 cuando el correo enviado no es válido', (done) => {
    const req = {
      body: {
        email: 'tester',
        password: 'test123',
        roles: {
          admin: false,
        },
      },
    };
    const next = (code) => {
      expect(code).toBe(400);
      done();
    };
    createUsers(req, {}, next);
  });
  it('Debería crear un nuevo usuario, aun si falta especificar roles', (done) => {
    const req = {
      body: {
        email: 'tester@test.pe',
        password: 'test123',
      },
    };
    /* const next = (code) => {
      expect(code).toBe(200);
      done();
    }; */
    const res = {
      send: (result) => {
        console.log('estoy aqui');
        expect(result.email).toEqual('tester@test.pe');
        done();
      },
    };
    createUsers(req, res);
  });
  it('Debería crear un nuevo usuario', (done) => {
    const user = {
      email: 'tester@test.pe',
      roles: {
        admin: false,
      },
    };
    const req = {
      body: {
        email: 'tester@test.pe',
        password: 'test123',
        roles: {
          admin: false,
        },
      },
    };
    const res = {
      send: (result) => {
        expect(result.email).toBe(user.email);
        done();
      },
    };
    createUsers(req, res);
  });
  it('Debería responder con 403 cuando usuario ya existe', (done) => {
    const req = {
      body: {
        email: 'tester1@test.pe',
        password: 'test123',
        roles: {
          admin: false,
        },
      },
    };
    const next = (code) => {
      expect(code).toBe(403);
      done();
    };
    createUsers(req, {}, next);
  });
});
describe('getUsers- (PAGINACION)', () => {
  beforeAll(async () => {
    await database();
    const collectionUsers = await (await database()).collection('users');
    await collectionUsers.insertMany([
      {
        email: 'tester1@test',
        roles: { admin: true },
      },
      {
        email: 'tester2@test',
        roles: { admin: false },
      },
      {
        email: 'tester3@test',
        roles: { admin: false },
      },
    ]);
  });

  afterAll(async () => {
    await (await database()).collection('users').deleteMany({});
    await database().close();
  });

  it('Deberia retornar 3 usuarios', (done) => {
    const req = {
      query: {},
    };

    const resp = {
      set: (nameHeader, header) => {
        expect(nameHeader).toBe('link');
        expect(header).toBe('</users?limit=10&page=1>; rel="first", </users?limit=10&page=1>; rel="prev", </users?limit=10&page=1>; rel="next", </users?limit=10&page=1>; rel="first"');
      },
      send: (result) => {
        expect(result.length).toBe(3);
        expect(result[0].email).toBe('tester1@test');
      },
    };
    done();
    getUsers(req, resp);
  });
});
describe('getUserById', () => {
  let users = null;
  beforeAll(async () => {
    await database();
    const collectionUsers = await (await database()).collection('users');
    users = await collectionUsers.insertMany([
      {
        email: 'user@test.pe',
        roles: { admin: true },
      },
    ]);
  });
  afterAll(async () => {
    await (await database()).collection('users').deleteMany({});
    await database().close();
  });
  it('Debería responder con 404 cuando usuario no existe', (done) => {
    const req = {
      params: {
        uid: 'user123@test.pe',
      },
    };
    const next = (code) => {
      expect(code).toBe(404);
      done();
    };
    getUserById(req, {}, next);
  });
  it('Deberia obtener un usuario por su id', (done) => {
    const userId = users.insertedIds['0'];
    const req = {
      params: {
        uid: userId,
      },
    };
    const resp = {
      send: (response) => {
        expect(response._id).toEqual(userId);
        done();
      },
    };
    getUserById(req, resp);
  });
  it('Deberia obtener un usuario por su email', (done) => {
    const req = {
      params: {
        uid: 'user@test.pe',
      },
    };
    const resp = {
      send: (response) => {
        expect(response.email).toBe('user@test.pe');
        done();
      },
    };
    getUserById(req, resp);
  });
});
describe('deleteUser', () => {
  let users = null;
  beforeAll(async () => {
    await database();
    const collectionUsers = await (await database()).collection('users');
    users = await collectionUsers.insertMany([
      {
        email: 'test@test.pe',
        roles: { admin: false },
      },
      {
        email: 'test@delete.pe',
        roles: { admin: false },
      },
    ]);
  });

  afterAll(async () => {
    await (await database()).collection('users').deleteMany({});
    await database().close();
  });

  it('Deberia de poder eliminar un usuario por su uid', (done) => {
    const userId = users.insertedIds['0'];
    const req = {
      params: {
        uid: userId,
      },
    };

    const resp = {
      send: (response) => {
        expect(response._id).toEqual(userId);
        done();
      },
    };
    deleteUser(req, resp);
  });

  it('Deberia  eliminar un usuario por su email', (done) => {
    const req = {
      params: {
        uid: 'test@delete.pe',
      },
    };
    const resp = {
      send: (response) => {
        expect(response.email).toBe('test@delete.pe');
        done();
      },
    };
    deleteUser(req, resp);
  });
});
describe('updateUser', () => {
  let users = null;
  beforeAll(async () => {
    await database();
    const collectionUsers = await (await database()).collection('users');
    users = await collectionUsers.insertMany([
      {
        email: 'test@test.pe',
        roles: { admin: true },
      },
      {
        email: 'test2@test.pe',
        roles: { admin: false },
      },
    ]);
    // console.log('user', users);
  });

  afterAll(async () => {
    await (await database()).collection('users').deleteMany({});
    await database().close();
  });
  it('Deberia actualizar un usuario por su uid', (done) => {
    const userId = users.insertedIds['0'];
    // console.log('userId', userId);
    const req = {
      params: {
        uid: userId,
      },
      body: {
        email: 'tester@update.pe',
      },
    };
    const resp = {
      send: (response) => {
        expect(response._id).toEqual(userId);
        expect(response.email).toBe('tester@update.pe');
        done();
      },
    };
    updateUser(req, resp);
  });

  it('Deberia actualizar un usuario por su email', (done) => {
    const req = {
      params: {
        uid: 'tester@test.pe',
      },
      body: {
        email: 'email2@update.pe',
      },
    };
    const resp = {
      send: (response) => {
        expect(response.email).toBe('email2@update.pe');
        done();
      },
    };
    updateUser(req, resp);
  });
});
