// const ObjectId = require('mongodb').ObjectID;
const {
  createUsers,
  getUserById,
  getUsers,
  deleteUser,
  updateUser,
} = require('../usersController');
const database = require('../../conection/__mocks__/connection');

describe('CREAR USUARIO', () => {
  beforeAll(async () => {
    await database();
  });
  afterAll(async () => {
    await (await database()).collection('users').deleteMany({});
    await database().close();
  });
  it('Debería crear un nuevo usuario', async () => {
    const user = {
      email: 'tester@test',
      roles: {
        admin: false,
      },
    };
    const req = {
      body: {
        email: 'tester@test',
        password: 'test1',
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
    const next = (code) => code;
    await createUsers(req, res, next);
    // console.log('wea', req);
  });
});
describe('OBTENER USUARIO- (PAGINACION)', () => {
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

  it('Deberia retoner 3 usuarios', () => {
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
    getUsers(req, resp);
  });
});
describe('OBTNENER USUARIO POR SU ID', () => {
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
  it('Deberia obtener un usuario por su id', () => {
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
    getUserById(req, resp);
  });
  it('Deberia obtener un usuario por su email', () => {
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
    getUserById(req, resp);
  });
});
describe('ELIMINAR USUARIO', () => {
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

  it('Deberia de poder eliminar un usuario por su uid', () => {
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

    deleteUser(req, resp);
  });

  it('Deberia  eliminar un usuario por su email', () => {
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

    deleteUser(req, resp);
  });
});
describe('MODIFICAR USUARIOS', () => {
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

  it('Deberia actualizar un usuario por su uid', () => {
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

    updateUser(req, resp);
  });

  it('Deberia actualizar un usuario por su email', () => {
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

    updateUser(req, resp);
  });

});
