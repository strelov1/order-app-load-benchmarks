import http from 'k6/http';

export let options = {
    vus: 500,
    duration: '5m',
};

export default function () {
    const BASE_URL = 'http://localhost:3000';

    const response = http.get(`${BASE_URL}/`);
    const products = JSON.parse(response.body);

    if (products && products.length >= 10) {
        const orderProducts = products.slice(0, 10).map(product => {
            return {
                productId: product.id,
                price: product.price,
                quantity: product.inventory > 10 ? 10 : product.inventory
            };
        });

        const payload = JSON.stringify({
            userId: Math.round(Math.random() * 1000),
            products: orderProducts,
        });

        const headers = {
            'Content-Type': 'application/json',
        };

       http.post(`${BASE_URL}/order`, payload, { headers: headers });
    }
}
