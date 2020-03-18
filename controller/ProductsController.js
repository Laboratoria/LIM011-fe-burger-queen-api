const ObjectId = require('mongodb').ObjectID;
const db = require('../conection/connection');
const { pagination } = require('./utils');

module.exports = {
  createProduct: async (req, res, next) => {
    const {
      name, price, imagen, type,
    } = req.body;
    if (!name || !price) {
      return next(400);
    }
    const productsCollection = (await db()).collection('products');
    const newProduct = (await productsCollection.insertOne({
      name,
      price,
      imagen,
      type,
      dateEntry: new Date(),
    })).insertedId;
    // console.log('id', typeof newProduct);
    const product = await productsCollection.findOne(newProduct);
    // console.log('product', product);
    res.send(product);
  },
  getProductById: async (req, resp, next) => {
    const { productId } = req.params;
    if (!ObjectId.isValid(productId)) {
      return next(404);
    }
    const query = { _id: ObjectId(productId) };
    const productsCollection = (await db()).collection('products');
    const checkProduct = await productsCollection.findOne(query);
    if (!checkProduct) {
      return next(404);
    }
    /* console.log('verificando', checkProduct);
    console.log('is valid', ObjectId.isValid(productId)); */
    resp.send(checkProduct);
  },
  getProducts: async (req, resp, next) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const productsCollection = (await db()).collection('products');
    const allProducts = await productsCollection.find().skip(startIndex).limit(limit).toArray();
    // console.log('todos', allProducts);
    const numberOfProducts = await productsCollection.find().count();
    const numberOfPages = Math.ceil(numberOfProducts / limit);
    // console.log('number', numberOfProducts);
    const linksHeader = pagination('products', page, numberOfPages, limit);
    resp.set('link', `${linksHeader.first},${linksHeader.last},${linksHeader.prev},${linksHeader.next}`);
    resp.send(allProducts);
  },
  updateProduct: async (req, res, next) => {
    const { productId } = req.params;
    const {
      name, price, imagen, type,
    } = req.body;
    if (!ObjectId.isValid(productId)) {
      return next(404);
    }
    const query = { _id: ObjectId(productId) };
    const productsCollection = (await db()).collection('products');
    const checkProduct = await productsCollection.findOne(query);
    if (!checkProduct) {
      return next(404);
    }
    if (!name && !price && !imagen && !type) {
      return next(400);
    }
    if (typeof price !== 'number') {
      return next(400);
    }
    const updateProps = {
      name: name || checkProduct.name,
      price: price || checkProduct.price,
      imagen: imagen || checkProduct.imagen,
      type: type || checkProduct.type,
    };
    await productsCollection.updateOne(query,
      { $set: updateProps });
    const updateProduct = await productsCollection.findOne(query);
    console.log('verificando', updateProduct);
    res.send(updateProduct);
  },
  deleteProduct: async (req, res, next) => {
    const { productId } = req.params;
    if (!ObjectId.isValid(productId)) {
      return next(404);
    }
    const query = { _id: ObjectId(productId) };
    const productsCollection = (await db()).collection('products');
    const checkProduct = await productsCollection.findOne(query);
    if (!checkProduct) {
      return next(404);
    }
    const deletedProduct = await productsCollection.deleteOne({ _id: checkProduct._id });
    res.send(deletedProduct);
  },
};
