// const ObjectId = require('mongodb').ObjectID;
const {
  createUsers,
} = require('../usersController');
const database = require('../../conection/__mocks__/connection');

describe('createUsers', () => {
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
        console.log('wea', result);
        expect(result.email).toStrictEqual(user.email);
      },
    };
    const next = (code) => code;
    await createUsers(req, res, next);
    // console.log('wea', req);
  //  console.log('wea1', res.send);
  });
});
