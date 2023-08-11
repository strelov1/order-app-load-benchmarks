import express from 'express';
import pg from 'pg'
import bodyParser from 'body-parser';
import promClient from 'prom-client';

import { getProducts, createOrder, getOrders, getProductsState, getOrderState } from './pg.js';

const app = express();
app.use(bodyParser.json());

const pgClient = new pg.Client({ connectionString: process.env.DATABASE_URL });
await pgClient.connect();

const successfulOrdersCounter = new promClient.Counter({
  name: 'successful_orders_total',
  help: 'Total number of successful orders',
});

const failedOrdersCounter = new promClient.Counter({
  name: 'failed_orders_total',
  help: 'Total number of failed orders',
});

app.get('/', async (req, res) => {
  try {
    const products = await getProducts(pgClient);
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Internal server error");
  }
})

app.post('/order', async (req, res) => {
  const { userId, products } = req.body;
  try {
      await createOrder({ userId, products }, pgClient); 
      successfulOrdersCounter.inc();
      res.status(201).send('Order created successfully');
  } catch (error) {
      console.error("Error creating order:", error);
      failedOrdersCounter.inc()
      res.status(500).send("Internal server error");
  }
});

app.get('/orders', async (req, res) => {
  try {
    const orders = await getOrders(pgClient);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).send("Internal server error");
  }
});


app.get('/product-stat', async (req, res) => {
  try {
    const stat = await getProductsState(pgClient);
    res.json(stat);
  } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).send("Internal server error");
  }
});

app.get('/order-stat', async (req, res) => {
  try {
    const stat = await getOrderState(pgClient);
    res.json(stat);
  } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).send("Internal server error");
  }
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

app.listen(3000, () => {
  console.log(`Example app listening on port ${3000}`)
})