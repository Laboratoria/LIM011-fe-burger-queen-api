const ObjectId = require('mongodb').ObjectID;
const config = require('../config');

const { dbUrl } = config;
const database = require('../conection/connection');

const db = database(dbUrl);
module.exports = {
  createProduct: async (req, res, next) => {
    const {
      name,
      price,
      image = '',
      type = '',
    } = req.body;
    const collectionProducts = await db.collection('products');
    if (!name || !price) {
      return next(400);
    }
    const newProduct = (await collectionProducts.insertOne({
      name,
      price,
      image,
      type,
    }));
    const product = await collectionProducts.findOne({ _id: ObjectId(newProduct) });
    res.send(product);
  },
  getProductId: async (req, resp, next) => {
    try {
      const { productId } = req.params;
      const collectionProducts = await db.collection('products');
      const searchProductId = await collectionProducts.findOne({ _id: ObjectId(productId) });
      if (!searchProductId) {
        return next(404);
      }

      resp.send(searchProductId);
    } catch (err) {
      return next(404);
    }
  },
  deleteProduct: async (req, res, next) => {
    try {
      const { productId } = req.params;
      const collectionProducts = await db.collection('products');
      const searchProductId = await collectionProducts.findOne({ _id: ObjectId(productId) });
      if (!searchProductId) {
        return next(404);
      }
      const searchProduct = await collectionProducts.findOne(searchProductId);
      await collectionProducts.deleteOne(searchProduct._id);
      res.send(searchProduct);
    } catch (error) {
      return next(404);
    }
  },
};
