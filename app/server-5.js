import pg from 'pg'
import cluster from "cluster";
import os from 'os';

import { createApp } from './app.js';
import { getProducts2 as getProducts, createOrder2 as createOrder } from './query.js';
import { httpRequest, httpFailedRequest, successfulOrdersCounter, failedOrdersCounter, metricSererver } from './metrics.js';

const totalCPUs = os.availableParallelism();

if (cluster.isPrimary) {
  console.log(`Number of CPUs is ${totalCPUs}`);
  console.log(`Primary ${process.pid} is running`);
 
  // Fork workers.
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  metricSererver();
 
  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log("Let's fork another worker!");
    cluster.fork();
  });
} else {
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
    res.end(null);
  };

  createApp('app-3', { 
    listProductHandler,
    createOrderHandler,
    metricsHanlder
  });
}

