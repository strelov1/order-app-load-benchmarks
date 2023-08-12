import express from 'express';
import promClient from 'prom-client';

const aggregatorRegistry = new promClient.AggregatorRegistry();

// rate(request_total[1m])
export const httpRequest = new promClient.Counter({
    name: 'request_total',
    help: 'Total number of request',
});

// rate(request_failed_total[1m])
export const httpFailedRequest = new promClient.Counter({
    name: 'request_failed_total',
    help: 'Total number of failed request',
});

export const successfulOrdersCounter = new promClient.Counter({
    name: 'successful_orders_total',
    help: 'Total number of successful orders',
});

export const failedOrdersCounter = new promClient.Counter({
    name: 'failed_orders_total',
    help: 'Total number of failed orders',
});

export const metricSererver = () => {
    const metricsServer = express();
    metricsServer.get('/metrics', (req, res) => {
        aggregatorRegistry.clusterMetrics().then((metrics) => {
            res.set('Content-Type', aggregatorRegistry.contentType);
            res.send(metrics);
        });
    });
    metricsServer.listen(3001); 
}
