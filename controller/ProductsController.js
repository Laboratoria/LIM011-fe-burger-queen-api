const ObjectId = require('mongodb').ObjectID;
const db = require('../conection/connection');
const { pagination } = require('./utils');

module.exports = {
  createProduct: async (req, resp, next) => {
    const {
      name, price, image = '', type = '',
    } = req.body;
    const collectionProducts = (await db()).collection('products');
    if (!name || !price) {
      return next(400);
    }
    const productId = (await collectionProducts.insertOne({
      name,
      price,
      image,
      type,
      dateEntry: new Date(),
    })).insertedId;
    const product = await collectionProducts.findOne({ _id: ObjectId(productId) });
    resp.send(product);
  },
  getProductById: async (req, resp, next) => {
    const { productId } = req.params;
    const query = (ObjectId.isValid(productId) ? { _id: ObjectId(productId) } : { _id: productId });
    const productsCollection = (await db()).collection('products');
    const checkProduct = await productsCollection.findOne(query);
    if (!checkProduct) {
      return next(404);
    }
    resp.send(checkProduct);
  },
  getProducts: async (req, resp) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;
    const startIndex = (page - 1) * limit;
    const productsCollection = (await db()).collection('products');
    const allProducts = await productsCollection.find().skip(startIndex).limit(limit).toArray();
    const numberOfProducts = await productsCollection.find().count();
    const numberOfPages = Math.ceil(numberOfProducts / limit);
    const linksHeader = pagination('products', page, numberOfPages, limit);
    resp.set('link', `${linksHeader.first},${linksHeader.last},${linksHeader.prev},${linksHeader.next}`);
    resp.send(allProducts);
  },
  updateProduct: async (req, res, next) => {
    const { productId } = req.params;
    const query = (ObjectId.isValid(productId) ? { _id: ObjectId(productId) } : { _id: productId });
    const productsCollection = (await db()).collection('products');
    const checkProduct = await productsCollection.findOne(query);
    if (!checkProduct) {
      return next(404);
    }
    const {
      name, price, imagen, type,
    } = req.body;
    if (!name && !price && !imagen && !type) {
      return next(400);
    }
    if (price && typeof price !== 'number') {
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
    res.send(updateProduct);
  },
  deleteProduct: async (req, res, next) => {
    const { productId } = req.params;
    const query = (ObjectId.isValid(productId) ? { _id: ObjectId(productId) } : { _id: productId });
    const productsCollection = (await db()).collection('products');
    const checkProduct = await productsCollection.findOne(query);
    if (!checkProduct) {
      return next(404);
    }
    const deletedProduct = await productsCollection.deleteOne({ _id: checkProduct._id });
    res.send(deletedProduct);
  },
};
