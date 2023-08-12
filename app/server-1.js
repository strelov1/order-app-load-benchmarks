import pg from 'pg'
import promClient from 'prom-client';
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
      const products = await getProducts(client, req.query.page);
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

const metricsHanlder = async (req, res) => {
  try {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
  } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
  }
};

createApp('app-1', { 
  listProductHandler,
  createOrderHandler,
  metricsHanlder
});