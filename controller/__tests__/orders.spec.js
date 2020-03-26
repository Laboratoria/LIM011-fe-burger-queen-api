const {
  createOrders,
  getOrderById,
  getOrders,
  updateOrder,
  deleteOrder,
} = require('../OrdersController');
const database = require('../../conection/connection');

describe('createOrder', () => {
  let allProductsIds;
  beforeAll(async () => {
    await database();
    const collectionProducts = (await database()).collection('products');
    allProductsIds = (await collectionProducts.insertMany([
      {
        name: 'Hamburguesa Atrevida',
        price: 15,
        image: 'hamburguesaAtrevida.png',
        type: 'burger',
        dateEntry: new Date(),
      },
      {
        name: 'Hamburguesa Simple',
        price: 10,
        image: 'HamburguesaSimple.jpg',
        type: 'burger',
        dateEntry: new Date(),
      },
      {
        name: 'Hamburguesa Hawaiana',
        price: 14,
        image: 'HamburguesaHawaiana.png',
        type: 'burger',
        dateEntry: new Date(),
      },
    ])).insertedIds;
  });
  afterAll(async () => {
    const collectionUsers = (await database()).collection('orders');
    await collectionUsers.deleteMany({});
    await database().close();
  });
  it('debería responder con un error 400 si no se envían userId ', (done) => {
    const req = {
      body: {
        products: 'Hamburguesa Atrevida',
      },
    };
    const next = (code) => {
      expect(code).toBe(400);
      done();
    };
    createOrders(req, {}, next);
  });
  it('debería responder con un error 400 si no se envían productos ', (done) => {
    const req = {
      body: {
        products: [],
        userId: '1234567890',
      },
    };
    const next = (code) => {
      expect(code).toBe(400);
      done();
    };
    createOrders(req, {}, next);
  });
  it('Debería crear una nueva orden', (done) => {
    const req = {
      body: {
        userId: '7894561230',
        client: 'client',
        products: [
          {
            qty: 2,
            productId: allProductsIds['0'],
          },
          {
            qty: 2,
            productId: allProductsIds['1'],
          },
        ],
        status: 'pending',
        dateEntry: new Date(),
        dateProcessed: new Date(),
      },
    };
    const resp = {
      send: (response) => {
        expect(response.products[0].product._id).toStrictEqual(allProductsIds['0']);
       
        done();
      },
    };
    createOrders(req, resp);
  });
});
describe('getOrderId', () => {
  let productsIds;
  let orderId;
  beforeAll(async () => {
    await database();
    const collectionProducts = (await database()).collection('products');
    productsIds = (await collectionProducts.insertMany([
      {
        name: 'products-01',
        price: 10,
        image: 'imagen.jpg',
        type: 'burger',
        dateEntry: new Date(),
      },
      {
        name: 'products-02',
        price: 12,
        image: 'imagen.jpg',
        type: 'burger',
        dateEntry: new Date(),
      },
    ])).insertedIds;
    const collectionOrders = (await database()).collection('orders');
    orderId = (await collectionOrders.insertOne(
      {
        userId: '01234567',
        client: 'client',
        products: [
          {
            qty: 2,
            productId: productsIds['0'],
          },
          {
            qty: 1,
            productId: productsIds['1'],
          },
        ],
        status: 'pending',
        dateEntry: new Date(),
      },
    )).insertedId;
  });

  afterAll(async () => {

    await (await database()).collection('products').deleteMany({});
    await (await database()).collection('orders').deleteMany({});
    await database().close();
  });
  it('Debería mostrar un error 404 si orderId no es válido', (done) => {
    const req = {
      params: {
        orderId: 'estenoesunidhexadesimal',
      },
    };
    const next = (code) => {
      expect(code).toBe(404);
      done();
    };
    getOrderById(req, {}, next);
  });
  it('debería mostrar un error 404 si el orden no existe', (done) => {
    const req = {
      params: {
        orderId: '4757568586856957676',
      },
    };
    const next = (code) => {
      expect(code).toBe(404);
      done();
    };
    getOrderById(req, {}, next);
  });
  it('debería obtener toda la orden con su respectiva información', (done) => {
    const req = {
      params: {
        orderId,
      },
    };
    const resp = {
      send: (response) => {
        expect(response._id).toStrictEqual(orderId);
        done();
      },
    };
    getOrderById(req, resp);
  });
});
describe('getOrders', () => {
  let productsIds;
  beforeAll(async () => {
    await database();
    const collectionProducts = (await database()).collection('products');
    productsIds = (await collectionProducts.insertMany([
      {
        name: 'Hamburguesa Atrevida',
        price: 15,
        image: 'hamburguesaAtrevida.png',
        type: 'burger',
        dateEntry: new Date(),
      },
      {
        name: 'Hamburguesa Simple',
        price: 10,
        image: 'HamburguesaSimple.jpg',
        type: 'burger',
        dateEntry: new Date(),
      },
      {
        name: 'Hamburguesa Hawaiana',
        price: 14,
        image: 'HamburguesaHawaiana.png',
        type: 'burger',
        dateEntry: new Date(),
      },
    ])).insertedIds;

    const collectionOrders = (await database()).collection('orders');
    // eslint-disable-next-line no-unused-vars
    const orderIds = (await collectionOrders.insertMany([
      {
        userId: '123456789',
        client: 'clientLiz',
        products: [
          {
            qty: 2,
            productId: productsIds['1'],
          },
          {
            qty: 1,
            productId: productsIds['2'],
          },
        ],
        status: 'pending',
        dateEntry: new Date(),
      },
      {
        userId: '70065678',
        client: 'clientKis',
        products: [
          {
            qty: 3,
            productId: productsIds['0'],
          },
          {
            qty: 2,
            productId: productsIds['1'],
          },
        ],
        status: 'delivered',
        dateEntry: new Date(),
      },
    ])).insertedIds;
  });

  afterAll(async () => {
    await (await database()).collection('products').deleteMany({});
    await (await database()).collection('orders').deleteMany({});
    await database().close();
  });
  it('Deberia de retonar con dos ordenes', (done) => {
    const req = { query: {} };
    const resp = {
      send: (result) => {
        expect(result.length).toBe(2);
        expect(result[0].client).toBe('clientLiz');
        expect(result[0].products.length).toBe(2);
        expect(result[0].status).toBe('pending');
        expect(result[1].client).toBe('clientKis');
        expect(result[1].products.length).toBe(2);
        expect(result[1].status).toBe('delivered');
        done();
      },
      set: (nameHeader, header) => {
        expect(nameHeader).toBe('link');
        expect(header).toBe('</orders?page=1&limit=10>; rel="first",</orders?page=1&limit=10>; rel="last",</orders?page=1&limit=10>; rel="prev",</orders?page=1&limit=10>; rel="next"');
        done();
      },
    };
    getOrders(req, resp);
  });
});
describe('updateOrder', () => {
  let productsIds;
  let orders = null;
  beforeAll(async () => {
    await database();
    const collectionProducts = (await database()).collection('products');
    productsIds = (await collectionProducts.insertMany([
      {
        name: 'Cafe con leche',
        price: 5,
        image: 'cafeConLeche.png',
        type: 'burger',
        dateEntry: new Date(),
      },
      {
        name: 'Cafe',
        price: 4,
        image: 'Cafe.png',
        type: 'burger',
        dateEntry: new Date(),
      },
    ])).insertedIds;
    const collectionOrders = (await database()).collection('orders');
    orders = await collectionOrders.insertMany([
      {
        userId: '0454646565656',
        client: 'Kiswari',
        products: [
          {
            qty: 2,
            productId: productsIds['0'],
          },
          {
            qty: 1,
            productId: productsIds['1'],
          },
        ],
        status: 'pending',
        dateEntry: new Date(),
      },
    ]);
  });

  afterAll(async () => { 
    await (await database()).collection('products').deleteMany({});
    await (await database()).collection('orders').deleteMany({});
    await database().close();
  });
  it('Deberia responder con 404 si la orden con `orderid´ indicado no existe ', (done) => {
    const orderId = 'noesunidhexadecimal';
    const req = {
      params: {
        orderId: { orderId },
      },
    };
    const next = (code) => {
      expect(code).toBe(404);
      done();
    };
    updateOrder(req, {}, next);
  });
  it('debería mostrar un error 400 si no se indica ninguna propiedad a modificar', (done) => {
    const orderId = orders.insertedIds[0];
    const req = {
      params: {
        orderId,
      },
      body: {},
    };
    const next = (code) => {
      expect(code).toBe(400);
      done();
    };
    updateOrder(req, {}, next);
  });
  it('debería mostrar un error 400 cuando el estado no es válido', (done) => {
    const orderId = orders.insertedIds[0];
    const req = {
      params: {
        orderId,
      },
      body: {
        status: 'noexistestatus',
      },
    };
    const next = (code) => {
      expect(code).toBe(400);
      done();
    };
    updateOrder(req, {}, next);
  });
  it('debería mostrar un error 404 si la orden no existe', (done) => {
    const req = {
      params: {
        orderId: '125657687898',
      },
      body: {
        userId: '779796996',
        client: 'Valentina',
        products: [
          {
            qty: 2,
            productId: productsIds['0'],
          },
          {
            qty: 1,
            productId: productsIds['1'],
          },
        ],
        status: 'pending',
        dateProcessed: new Date(),
      },
    };
    const next = (code) => {
      expect(code).toBe(404);
      done();
    };
    updateOrder(req, {}, next);
  });
  it('debería actualizar una nueva orden', (done) => {
    const orderId = orders.insertedIds[0];
    const req = {
      params: {
        orderId,
      },
      body: {
        userId: '01234567',
        client: 'Manuel',
        products: [
          {
            qty: 2,
            productId: productsIds['0'],
          },
          {
            qty: 1,
            productId: productsIds['1'],
          },
        ],
        dateProcessed: new Date(),
      },
    };
    const resp = {
      send: (response) => {
        expect(response.products[0].product._id).toStrictEqual(productsIds['0']);
        done();
      },
    };
    updateOrder(req, resp);
  });
  it('debería actualizar una nueva orden', (done) => {
    const orderId = orders.insertedIds[0];
    const req = {
      params: {
        orderId,
      },
      body: {
        status: 'delivered',
        dateProcessed: new Date(),
      },
    };
    const resp = {
      send: (response) => {
        expect(response.status).toStrictEqual('delivered');
        done();
      },
    };
    updateOrder(req, resp);
  });
});

describe('deleteOrder', () => {
  let productsIds;
  let orders;
  beforeAll(async () => {
    await database();
    const collectionProducts = (await database()).collection('products');
    productsIds = (await collectionProducts.insertMany([
      {
        name: 'Jugo de frutas natural',
        price: 10,
        image: 'Jugodefrutasnatural.png',
        type: 'burger',
        dateEntry: new Date(),
      },
    ])).insertedIds;
    const collectionOrders = (await database()).collection('orders');
    orders = await collectionOrders.insertMany([
      {
        userId: '2345678',
        client: 'Alejandra',
        products: [
          {
            qty: 2,
            productId: productsIds['0'],
          },
        ],
        status: 'pending',
        dateEntry: new Date(),
      },
    ]);
  });

  afterAll(async () => {
    await (await database()).collection('products').deleteMany({});
    await (await database()).collection('orders').deleteMany({});
    await database().close();
  });
  it('debería mostrar un error 404 si orderId no es válido o no existe', (done) => {
    const req = {
      params: {
        orders: 'noesunidHexadecimal',
      },
    };
    const next = (code) => {
      expect(code).toBe(404);
      done();
    };
    deleteOrder(req, {}, next);
  });
  it('Deberia eliminar una orden por su id', (done) => {
    const orderId = orders.insertedIds['0'];
    const req = {

      params: { orderId },

    };
    const resp = {
      send: (result) => {
        expect(result._id).toEqual(undefined);
        done();
      },
    };
    deleteOrder(req, resp);
  });
});
