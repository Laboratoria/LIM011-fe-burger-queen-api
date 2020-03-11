
const { MongoMemoryServer } = require('mongodb-memory-server');
const {
  createUsers,
} = require('../../controller/usersController');
const db = require('../../conection/connection');

describe('createUsers', () => {
  beforeAll(async () => {
    const mongod = new MongoMemoryServer();
    const con = await mongod.getConnectionString();
    process.env.DB_URL = con;
    // console.log('qqqq', con);
    // console.log('conectado');
  });
  beforeEach(async () => {
    await db();
  });
  /* afterAll(async () => {
    await database.close();
    console.log('cerrado');
  }); */
  it('deberia crear usuarios', (done) => {
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
        done();
      },
    };
    const next = (code) => code;
    createUsers(req, res, next);
  });
});
