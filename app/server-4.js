import pg from 'pg'
import promClient from 'prom-client';
import { createApp } from './app.js';
import { getProducts2 as getProducts, createOrder2 as createOrder } from './query.js';
import { httpRequest, httpFailedRequest, successfulOrdersCounter, failedOrdersCounter } from './metrics.js';


const pgClient = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL,
  // max: 20,
  connectionTimeoutMillis : 0,
  idleTimeoutMillis: 0
});

const listProductHandler = async (req, res) => {
  httpRequest.inc();
  const client = await pgClient.connect();
  try {
      const products = await getProducts(client, req.query.page);
      res.json(products);
  } catch (error) {
      console.error("Error fetching products:", error);
      httpFailedRequest.inc();
      res.status(500).send("Internal server error");
  } finally {
      client.release();
  }
}

const createOrderHandler = async (req, res) => {
  httpRequest.inc();
  const client = await pgClient.connect();
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
  } finally {
      client.release();
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

createApp('app-2', { 
  listProductHandler,
  createOrderHandler,
  metricsHanlder
});