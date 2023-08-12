import express from 'express';
import bodyParser from 'body-parser';
import promClient from 'prom-client';

export function createApp(appName, handlers) {
    const app = express();

    app.use(bodyParser.json());
    app.get('/', handlers.listProductHandler)
    app.post('/order', handlers.createOrderHandler);

    // app.get('/orders', async (req, res) => {
    //     const client = await pgClient.connect();
    //     try {
    //         const orders = await getOrders(client);
    //         res.json(orders);
    //     } catch (error) {
    //         console.error("Error fetching orders:", error);
    //         res.status(500).send("Internal server error");
    //     } finally {
    //         client.release();
    //     }
    // });

    // app.get('/product-stat', async (req, res) => {
    //     const client = await pgClient.connect();
    //     try {
    //         const stat = await getProductsState(client);
    //         res.json(stat);
    //     } catch (error) {
    //         console.error("Error creating order:", error);
    //         res.status(500).send("Internal server error");
    //     } finally {
    //         client.release();
    //     }
    // });

    // app.get('/order-stat', async (req, res) => {
    //     const client = await pgClient.connect();
    //     try {
    //         const stat = await getOrderState(client);
    //         res.json(stat);
    //     } catch (error) {
    //         console.error("Error creating order:", error);
    //         res.status(500).send("Internal server error");
    //     } finally {
    //        client.release();
    //     }
    // });

    app.get('/metrics', async (req, res) => {
        res.set('Content-Type', promClient.register.contentType);
        res.end(await promClient.register.metrics());
    });

    const port = 3000;
    app.listen(port, () => {
        console.log(`${appName} listening on port ${port}`)
    })
}