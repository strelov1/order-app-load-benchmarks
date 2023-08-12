import pg from 'pg'
import { createApp } from './app.js';
import { getProducts, createOrder1 as createOrder } from './query.js';
import { httpRequest, httpFailedRequest, successfulOrdersCounter, failedOrdersCounter } from './metrics.js';

const client = new pg.Client({ 
  connectionString: process.env.DATABASE_URL
});

await client.connect();

const listProductHandler = async (req, res) => {
  httpRequest.inc();
  try {
      const limit = 100;
      const page = parseInt(req.query.page, 10) || 1;
      const offset = (page - 1) * limit;
      const products = await getProducts(client, limit, offset);
      res.json(products);
  } catch (error) {
      console.error("Error fetching products:", error);
      httpFailedRequest.inc();
      res.status(500).send("Internal server error");
  }
}

const createOrderHandler = async (req, res) => {
  httpRequest.inc();
  const { userId, products } = req.body;
  try {
      await createOrder({ userId, products }, client); 
      successfulOrdersCounter.inc();
      res.status(201).send('Order created successfully');
  } catch (error) {
      console.error("Error creating order:", error);
      httpFailedRequest.inc();
      failedOrdersCounter.inc();
      res.status(500).send("Internal server error");
  }
}


createApp('app-1', { 
  listProductHandler,
  createOrderHandler
});