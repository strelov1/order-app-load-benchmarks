export const getProducts = async (connect, limit = 100, offset = 0) => {
    const result = await connect.query(`SELECT * FROM products WHERE inventory > 0 ORDER BY id ASC LIMIT $1 OFFSET $2`, [limit, offset]);
    return result.rows;
}

export const createOrder2 = async ({ userId, products }, connect) => {
    await connect.query('BEGIN');

    try {
        const productIds = products.map(p => p.productId);
        const result = await connect.query(`SELECT id, inventory FROM products WHERE id IN (${productIds.join(', ')}) FOR UPDATE`);
        const inventoryMap = new Map(result.rows.map(row => [row.id, row.inventory]));

        for (const item of products) {
            const availableInventory = inventoryMap.get(item.productId) || 0;
            if (availableInventory < item.quantity) {
                throw new Error(`Not enough inventory for product ID: ${item.productId}`);
            }
        }
    
        // Deduct inventory        
        const updateCases = products.map(p => `WHEN id=${p.productId} THEN inventory-${p.quantity}`).join(' ');
        await connect.query(`UPDATE products SET inventory = CASE ${updateCases} END WHERE id = ANY($1::int[])`, [productIds]);
        
        // Create an order record
        const orderResult = await connect.query('INSERT INTO orders(user_id) VALUES ($1) RETURNING id', [userId]);
        const orderId = orderResult.rows[0].id;
    
        // Link products to the order
        const orderItemsValues = products.map(p => `(${orderId}, ${p.productId}, ${p.quantity}, ${p.price})`).join(', ');
        await connect.query(`INSERT INTO order_items(order_id, product_id, quantity, price) VALUES ${orderItemsValues}`);
        await connect.query('COMMIT');
    } catch (error) {
        await connect.query('ROLLBACK');
        throw error;
    }
};

export const createOrder1 = async ({ userId, products }, connect) => {
    await connect.query('BEGIN');

    try {
        for (const item of products) {
            const result = await connect.query('SELECT inventory FROM products WHERE id = $1', [item.productId]);
            if (result.rows.length === 0 || result.rows[0].inventory < item.quantity) {
                throw new Error(`Not enough inventory for product ID: ${item.productId}`);
            }
        }
    
        // Deduct inventory
        for (const item of products) {
            await connect.query('UPDATE products SET inventory = inventory - $1 WHERE id = $2', [item.quantity, item.productId]);
        }
    
        // Create an order record
        const orderResult = await connect.query('INSERT INTO orders(user_id) VALUES ($1) RETURNING id', [userId]);
        const orderId = orderResult.rows[0].id;
    
        // Link products to the order
        for (const item of products) {
            await connect.query('INSERT INTO order_items(order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)', [
                orderId,
                item.productId,
                item.quantity,
                item.price
            ]);
        }
        await connect.query('COMMIT');
    } catch (error) {
        await connect.query('ROLLBACK');
        throw error;
    }
};

export const getOrders = async (connect) => {
    const result = await connect.query(`SELECT * FROM orders`);
    return result.rows;
}

export const getProductsState = async (connect) => {
    const result = await connect.query(`SELECT count(*) FROM products WHERE inventory > 0 `);
    return result.rows;
}

export const getOrderState = async (connect) => {
    const result = await connect.query(`SELECT count(*) FROM orders`);
    return result.rows;
}