
const {
  createUsers,
} = require('../../controller/usersController');
const getDB = require('./globalSetup.spec');

const init = async () => {
  getDB();
  console.log('conexxion con memory server');
};
init();
describe('creando usuario', () => {
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
