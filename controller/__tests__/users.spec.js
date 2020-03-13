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
  });
  afterAll(async () => {
    await (await database()).collection('users').deleteMany({});
    (await database()).close();
  });
  it('Debería crear un nuevo usuario', async (done) => {
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
      send(result) {
        expect(result.email).toStrictEqual(user.email);
      },
    };
    done();
    const next = (code) => code;
    await createUsers(req, res, next);
    // console.log('wea', req);
  });
  it('Debería responder con 400 cuando falta correo', async (done) => {
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
    };
    done();
    await createUsers(req, {}, next);
  });
  it('Debería responder con 400 cuando falta password', async (done) => {
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
    };
    done();
    await createUsers(req, {}, next);
  });
  it('Debería responder con 400 cuando el correo enviado no es válido', async (done) => {
    const req = {
      body: {
        email: 'tester@test',
        roles: {
          admin: false,
        },
      },
    };
    const next = (code) => {
      expect(code).toBe(400);
    };
    done();
    await createUsers(req, {}, next);
  });
  it('Debería responder con 400 cuando el password tiene menos de 6 caracteres', async (done) => {
    const req = {
      body: {
        email: 'tester@test',
        password: 'tests',
        roles: {
          admin: false,
        },
      },
    };
    const next = (code) => {
      expect(code).toBe(400);
    };
    done();
    await createUsers(req, {}, next);
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
    // console.log(' collectio', collectionUsers);
    users = await collectionUsers.insertMany([
      {
        email: 'user@test',
        roles: { admin: true },
      },
    ]);
  });
  afterAll(async () => {
    await (await database()).collection('users').deleteMany({});
    await database().close();
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
      },
    };
    done();
    getUserById(req, resp);
  });
  it('Deberia obtener un usuario por su email', (done) => {
    const req = {
      params: {
        uid: 'testert@test',
      },
    };
    const resp = {
      send: (response) => {
        expect(response.email).toBe('testert@test');
      },
    };
    done();
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
        email: 'test@test',
        roles: { admin: false },
      },
      {
        email: 'test@delete',
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
      },
    };
    done();
    deleteUser(req, resp);
  });

  it('Deberia  eliminar un usuario por su email', (done) => {
    const req = {
      params: {
        uid: 'test@delete',
      },
    };
    const resp = {
      send: (response) => {
        expect(response.email).toBe('test@delete');
      },
    };
    done();
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
        email: 'test@test',
        roles: { admin: true },
      },
      {
        email: 'test2@test',
        roles: { admin: false },
      },
    ]);
  });

  afterAll(async () => {
    await (await database()).collection('users').deleteMany({});
    await database().close();
  });

  it('Deberia actualizar un usuario por su uid', (done) => {
    const userId = users.insertedIds['0'];
    const req = {
      params: {
        uid: userId,
      },
      headers: {
        authenticatedUser: {
          roles: {
            admin: true,
          },
        },
      },
      body: {
        email: 'tester@update',
      },
    };
    const resp = {
      send: (response) => {
        expect(response._id).toEqual(userId);
        expect(response.email).toBe('tester@update');
      },
    };
    done();
    updateUser(req, resp);
  });

  it('Deberia actualizar un usuario por su email', (done) => {
    const req = {
      params: {
        uid: 'tester@test',
      },
      headers: {
        authenticatedUser: {
          roles: {
            admin: true,
          },
        },
      },
      body: {
        email: 'terter@update',
      },
    };
    const resp = {
      send: (response) => {
        expect(response.email).toBe('email2@update');
      },
    };
    done();
    updateUser(req, resp);
  });

});
