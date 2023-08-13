-- CREATE DATABASE store;

\c store;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    inventory INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders2 (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    order_items JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$ 
DECLARE
    counter INTEGER := 0;
BEGIN 
    WHILE counter < 1000 LOOP
        INSERT INTO users(name, email, password) 
        VALUES (
            'User ' || counter, 
            'user' || counter || '@example.com',
            MD5('password' || counter)
        );
        counter := counter + 1;
    END LOOP;
END $$;


DO $$ 
DECLARE 
    i INTEGER := 0; 
BEGIN 
    WHILE i < 1000000 LOOP
        INSERT INTO products (name, description, price, inventory) 
        VALUES (
            'Product ' || i + 1, -- Name of the product
            'Description ' || i + 1, -- description of the product
            (RANDOM() * 1000)::NUMERIC(10, 2), -- Random price between 0 and 1000
            TRUNC(RANDOM() * 1000) -- Random inventory count between 0 and 1000
        );
        i := i + 1; 
    END LOOP; 
END $$;