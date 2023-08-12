import http from 'k6/http';

export let options = {
    vus: 200,
    duration: '2m',
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomSlice(arr, maxItemInOrder) {
    const result = [];
    const length = arr.length;

    const times = getRandomInt(1, maxItemInOrder);

    for (let i = 0; i < times; i++) {
        const randomIndex = getRandomInt(1, length);
        result.push(arr[randomIndex]);
    }

    return result;
}

function getProductsFromPage(url, page) {
    const response = http.get(`${url}/?page=${page}`);
    return JSON.parse(response.body);
}

export default function () {
    const BASE_URL = 'http://localhost:3000';

    const pagesToVisit = getRandomInt(1, 10);

    let products = [];

    for (let i = 0; i < pagesToVisit; i++) {
        const page = getRandomInt(1, 100000/100);

        products = getProductsFromPage(BASE_URL, page);
        if (!products || products.length === 0) {
            console.log('empty', page)
            break;
        }
    }

    if (!products || products.length === 0) {
        console.log('empty');
        return;
    }

    const maxItemInOrder = 10;
    const productSlice = getRandomSlice(products, maxItemInOrder).filter(item => item);

    if (productSlice && productSlice.length >= maxItemInOrder) {
        const quantity = getRandomInt(1, 10);
        
        const orderProducts = productSlice.map(product => {
            return {
                productId: product.id,
                price: product.price,
                quantity: product.inventory > quantity ? quantity : product.inventory
            };
        });

        const payload = JSON.stringify({
            userId: getRandomInt(1, 1000),
            products: orderProducts,
        });

        const headers = {
            'Content-Type': 'application/json',
        };

       http.post(`${BASE_URL}/order`, payload, { headers: headers });
    }
}
