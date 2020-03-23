const ObjectId = require('mongodb').ObjectID;
const db = require('../conection/connection');
const { pagination } = require('./utils');

module.exports = {
  createOrders: async (req, res, next) => {
    const { userId, products, client = '' } = req.body;
    if (!userId || products.length === 0) {
      return next(400);
    }
    const productsCollection = (await db()).collection('products');
    const getArrayOfProducts = await Promise.all(
      products.map(async (el) => ({
        qty: el.qty,
        product: await productsCollection.findOne({ _id: ObjectId(el.productId) }),
      })),
    );

    const newOrder = {
      userId,
      client,
      products: getArrayOfProducts,
      status: 'pending',
      dateEntry: new Date(),
      dateProcessed: '',
    };
    const ordersCollection = (await db()).collection('orders');
    const saveOrder = (await ordersCollection.insertOne(newOrder)).insertedId;
    const order = await ordersCollection.findOne(saveOrder);
    res.send(order);
  },
  getOrderById: async (req, res, next) => {
    const { orderId } = req.params;
    const query = (ObjectId.isValid(orderId) ? { _id: ObjectId(orderId) } : { _id: orderId });
    const ordersCollection = (await db()).collection('orders');
    const checkOrder = await ordersCollection.findOne(query);

    if (!checkOrder) {
      return next(404);
    }
    res.send(checkOrder);
  },
  getOrders: async (req, resp) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;
    const startIndex = (page - 1) * limit;
    const ordersCollection = (await db()).collection('orders');
    const allOrders = await ordersCollection.find().skip(startIndex).limit(limit).toArray();
    const numberOfOrders = await ordersCollection.find().count();
    const numberOfPages = Math.ceil(numberOfOrders / limit);
    const linksHeader = pagination('orders', page, numberOfPages, limit);
    resp.set('link', `${linksHeader.first},${linksHeader.last},${linksHeader.prev},${linksHeader.next}`);
    resp.send(allOrders);
  },
  deleteOrder: async (req, res, next) => {
    const { orderId } = req.params;
    const query = (ObjectId.isValid(orderId) ? { _id: ObjectId(orderId) } : { _id: orderId });
    const ordersCollection = (await db()).collection('orders');
    const checkOrder = await ordersCollection.findOne(query);
    if (!checkOrder) {
      return next(404);
    }
    const deletedOrder = await ordersCollection.deleteOne({ _id: checkOrder._id });
    res.send(deletedOrder);
  },

  updateOrder: async (req, res, next) => {
    const {
      userId, products, client, status,
    } = req.body;
    const { orderId } = req.params;
    const query = (ObjectId.isValid(orderId) ? { _id: ObjectId(orderId) } : { _id: orderId });
    const ordersCollection = (await db()).collection('orders');
    const checkOrder = await ordersCollection.findOne(query);
    if (!checkOrder) {
      return next(404);
    }
    if ((!userId && !client && !products && !status)) {
      return next(400);
    }
    if ((status !== 'preparing' && status !== 'pending' && status !== 'canceled' && status !== 'delivering' && status !== 'delivered')) {
      return next(400);
    }
    let groupOfProducts;
    if (!products) {
      groupOfProducts = checkOrder.products;
    } else {
      const productsCollection = (await db()).collection('products');
      groupOfProducts = await Promise.all(
        products.map(async (el) => ({
          qty: el.qty,
          product: await productsCollection.findOne({ _id: ObjectId(el.productId) }),
        })),
      );
    }
    const updateOrders = {
      userId: userId || checkOrder.userId,
      client: client || checkOrder.client,
      products: groupOfProducts,
      status: status || checkOrder.status,
      dateProcessed: new Date(),
    };
    await ordersCollection.updateOne(query,
      { $set: updateOrders });
    const updatenewOrder = await ordersCollection.findOne(query);

    res.send(updatenewOrder);
  },
};
