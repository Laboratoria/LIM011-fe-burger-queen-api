const {
  createProduct,
  getProductById,
  getProducts,
  deleteProduct,
  updateProduct,
} = require('../ProductsController');
const database = require('../../conection/connection');

describe('createProducts', () => {
  beforeAll(async () => {
    await database();
  });
  afterAll(async () => {
    await (await database()).collection('products').deleteMany({});
    (await database()).close();
  });
  it('Debería responder con 400 cuando falta price', (done) => {
    const req = {
      body: {
        name: 'Hamburguesa simple',
      },
    };
    const next = (code) => {
      expect(code).toBe(400);
      done();
    };
    createProduct(req, {}, next);
  });
  it('Debería responder con 400 cuando falta name', (done) => {
    const req = {
      body: {
        price: 15,
      },
    };
    const next = (code) => {
      expect(code).toBe(400);
      done();
    };
    createProduct(req, {}, next);
  });
  it('Debería crear un nuevo producto', (done) => {
    const req = {
      body: {
        name: 'Hamburguesa simple',
        price: 10,
      },
    };
    const resp = {
      send: (result) => {
        expect(result.name).toBe('Hamburguesa simple');
        done();
      },
    };
    createProduct(req, resp);
  });
});
describe('getProductById', () => {
  let products = null;
  beforeAll(async () => {
    await database();
    const productsCollection = await (await database()).collection('products');
    products = await productsCollection.insertMany([
      {
        name: 'Hamburguesa simple',
        price: 10,
        type: 'Hamburguesas',
      },
    ]);
  });
  afterAll(async () => {
    await (await database()).collection('products').deleteMany({});
    (await database()).close();
  });
  it('Debería responder con 404 si el producto con `productId` indicado no existe', (done) => {
    const productId = 'product2020';
    const req = {
      params: { productId },
    };
    const next = (code) => {
      expect(code).toBe(404);
      done();
    };
    getProductById(req, {}, next);
  });
  it('Debería obtener toda la informacion del producto a buscar', (done) => {
    const productId = products.insertedIds[0];
    const req = {
      params: { productId },
    };
    const resp = {
      send: (result) => {
        expect(result._id).toEqual(productId);
        expect(result.name).toBe('Hamburguesa simple');
        expect(result.price).toBe(10);
        expect(result.type).toBe('Hamburguesas');
        done();
      },
    };
    getProductById(req, resp);
  });
});
describe('getProducts', () => {
  beforeAll(async () => {
    await database();
    const productsCollection = await (await database()).collection('products');
    await productsCollection.insertMany([
      {
        name: 'Café americano',
        price: 5,
        type: 'Desayuno',
      },
      {
        name: 'Sandwich de jamón y queso',
        price: 10,
        type: 'Desayuno',
      },
      {
        name: 'Hamburguesa simple',
        price: 10,
        type: 'Hamburguesas',
      },
      {
        name: 'Papas fritas',
        price: 5,
        type: 'Acompañamientos',
      },
      {
        name: 'Agua 750ml',
        price: 7,
        type: 'Bebidas',
      },
    ]);
  });
  afterAll(async () => {
    await (await database()).collection('products').deleteMany({});
    (await database()).close();
  });
  it('Debería retornar la segunda página con dos productos', (done) => {
    const req = {
      query: { page: 2, limit: 2 },
    };
    const resp = {
      send: (result) => {
        expect(result.length).toBe(2);
        expect(result[0].name).toBe('Hamburguesa simple');
        expect(result[1].price).toBe(5);
        done();
      },
      set: (nameHeader, header) => {
        expect(nameHeader).toBe('link');
        expect(header).toEqual('</products?page=1&limit=2>; rel="first",</products?page=3&limit=2>; rel="last",</products?page=1&limit=2>; rel="prev",</products?page=3&limit=2>; rel="next"');
        done();
      },
    };
    getProducts(req, resp);
  });
  it('Debería retornar la primera página con 5 productos, límite 10 por defecto', (done) => {
    const req = {
      query: { },
    };
    const resp = {
      send: (result) => {
        expect(result.length).toBe(5);
        expect(result[0].name).toBe('Café americano');
        expect(result[1].price).toBe(10);
        done();
      },
      set: (nameHeader, header) => {
        expect(nameHeader).toBe('link');
        expect(header).toEqual('</products?page=1&limit=10>; rel="first",</products?page=1&limit=10>; rel="last",</products?page=1&limit=10>; rel="prev",</products?page=1&limit=10>; rel="next"');
        done();
      },
    };
    getProducts(req, resp);
  });
});
describe('updateProduct', () => {
  let products = null;
  beforeAll(async () => {
    await database();
    const productsCollection = await (await database()).collection('products');
    products = await productsCollection.insertMany([
      {
        name: 'Café con leche',
        price: 5,
        type: 'Desayunos',
      },
    ]);
    // console.log('products', products);
  });
  afterAll(async () => {
    await (await database()).collection('products').deleteMany({});
    (await database()).close();
  });
  it('Debería responder con 404 si el producto con `productId` indicado no existe', (done) => {
    const productId = 'product2020';
    const req = {
      params: { productId },
    };
    const next = (code) => {
      expect(code).toBe(404);
      done();
    };
    updateProduct(req, {}, next);
  });
  it('Debería responder con 400 si no se indican ninguna propiedad a modificar', (done) => {
    const productId = products.insertedIds[0];
    const req = {
      params: { productId },
      body: { },
    };
    const next = (code) => {
      expect(code).toBe(400);
      done();
    };
    updateProduct(req, {}, next);
  });
  it('Debería responder con 400 si el tipo de dato ingresado como price no es un numero', (done) => {
    const productId = products.insertedIds[0];
    const req = {
      params: { productId },
      body: {
        price: '10',
      },
    };
    const next = (code) => {
      expect(code).toBe(400);
      done();
    };
    updateProduct(req, {}, next);
  });
  it('Debería actualizar la información de un producto según propiedades recibidas', (done) => {
    const productId = products.insertedIds[0];
    const req = {
      params: { productId },
      body: {
        price: 7,
      },
    };
    const resp = {
      send: (result) => {
        expect(result._id).toEqual(productId);
        expect(result.name).toBe('Café con leche');
        expect(result.price).toBe(7);
        expect(result.type).toBe('Desayunos');
        done();
      },
    };
    updateProduct(req, resp);
  });
  it('Debería actualizar la información de un producto según propiedades recibidas', (done) => {
    const productId = products.insertedIds[0];
    const req = {
      params: { productId },
      body: {
        type: 'Bebidas',
      },
    };
    const resp = {
      send: (result) => {
        expect(result._id).toEqual(productId);
        expect(result.name).toBe('Café con leche');
        expect(result.type).toBe('Bebidas');
        done();
      },
    };
    updateProduct(req, resp);
  });
});
describe('deleteProduct', () => {
  let products = null;
  beforeAll(async () => {
    await database();
    const productsCollection = await (await database()).collection('products');
    products = await productsCollection.insertMany([
      {
        name: 'Jugo de frutas natural',
        price: 7,
        type: 'Desayunos',
      },
    ]);
  });
  afterAll(async () => {
    await (await database()).collection('products').deleteMany({});
    (await database()).close();
  });
  it('Debería responder con 404 si el producto con `productId` indicado no existe', (done) => {
    const productId = 'product2020';
    const req = {
      params: { productId },
    };
    const next = (code) => {
      expect(code).toBe(404);
      done();
    };
    deleteProduct(req, {}, next);
  });
  it('Debería elmininar un producto por su id', (done) => {
    const productId = products.insertedIds[0];
    const req = {
      params: { productId },
    };
    const resp = {
      send: (result) => {
        expect(result._id).toEqual(undefined);
        done();
      },
    };
    deleteProduct(req, resp);
  });
});
