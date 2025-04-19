-- This script contains all the queries for the final project based on the new schema structure
CONNECT sys/sys as SYSDBA;
DROP USER c##lci_database_manager CASCADE;
CREATE USER c##lci_database_manager IDENTIFIED BY 1234;
GRANT connect, resource TO c##lci_database_manager;
ALTER USER c##lci_database_manager QUOTA 200M ON users;

CONNECT c##lci_database_manager/1234;

-- Creating Tables with Constraints

-- Table: Customers
CREATE TABLE Customers (
    customer_id NUMBER(8) CONSTRAINT customers_customer_id_pk PRIMARY KEY,
    first_name VARCHAR2(50) CONSTRAINT customers_first_name_nn NOT NULL,
    last_name VARCHAR2(50) CONSTRAINT customers_last_name_nn NOT NULL,
    email VARCHAR2(100) CONSTRAINT customers_email_uq UNIQUE CONSTRAINT customers_email_nn NOT NULL,
    phone VARCHAR2(15),
    address VARCHAR2(255),
    created_at DATE DEFAULT SYSDATE
);

-- Table: Categories
CREATE TABLE Categories (
    category_id NUMBER(2) CONSTRAINT categories_category_id_pk PRIMARY KEY,
    category_name VARCHAR2(100) CONSTRAINT categories_category_name_nn NOT NULL,
    description VARCHAR2(255)
);

-- Table: Suppliers
CREATE TABLE Suppliers (
    supplier_id NUMBER(5) CONSTRAINT suppliers_supplier_id_pk PRIMARY KEY,
    supplier_name VARCHAR2(100) CONSTRAINT suppliers_supplier_name_nn NOT NULL,
    contact_info VARCHAR2(255)
);

-- Table: Products
CREATE TABLE Products (
    product_id NUMBER(8) CONSTRAINT products_product_id_pk PRIMARY KEY,
    product_name VARCHAR2(100) CONSTRAINT products_product_name_nn NOT NULL,
    category_id NUMBER(2) CONSTRAINT products_category_id_nn NOT NULL,
    supplier_id NUMBER(5),
    price NUMBER(10,2) CONSTRAINT products_price_ck CHECK(price > 0),
    stock_quantity NUMBER(6) DEFAULT 0 CONSTRAINT products_stock_quantity_ck CHECK(stock_quantity >= 0),
    created_at DATE DEFAULT SYSDATE,
    CONSTRAINT products_category_id_fk FOREIGN KEY (category_id) REFERENCES Categories(category_id),
    CONSTRAINT products_supplier_id_fk FOREIGN KEY (supplier_id) REFERENCES Suppliers(supplier_id)
);

-- Table: Orders
CREATE TABLE Orders (
    order_id NUMBER(8) CONSTRAINT orders_order_id_pk PRIMARY KEY,
    customer_id NUMBER(8) CONSTRAINT orders_customer_id_nn NOT NULL,
    order_date DATE DEFAULT SYSDATE,
    status VARCHAR2(20) CONSTRAINT orders_status_ck CHECK(status IN ('Pending', 'Shipped', 'Delivered', 'Cancelled')),
    total NUMBER(10,2) DEFAULT 0,
    CONSTRAINT orders_customer_id_fk FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)
);

-- Table: Order_Details
CREATE TABLE Order_Details (
    order_id NUMBER(8) CONSTRAINT order_details_order_id_nn NOT NULL,
    product_id NUMBER(8) CONSTRAINT order_details_product_id_nn NOT NULL,
    quantity NUMBER(4) CONSTRAINT order_details_quantity_nn NOT NULL CONSTRAINT order_details_quantity_ck CHECK(quantity > 0),
    unit_price NUMBER(10,2) CONSTRAINT order_details_unit_price_nn NOT NULL,
    CONSTRAINT order_details_pk PRIMARY KEY (order_id, product_id),
    CONSTRAINT order_details_order_id_fk FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    CONSTRAINT order_details_product_id_fk FOREIGN KEY (product_id) REFERENCES Products(product_id)
);

-- Table: System_Users
CREATE TABLE System_Users (
    user_id NUMBER(5) CONSTRAINT system_users_user_id_pk PRIMARY KEY,
    username VARCHAR2(50) CONSTRAINT system_users_username_uq UNIQUE CONSTRAINT system_users_username_nn NOT NULL,
    password VARCHAR2(255) CONSTRAINT system_users_password_nn NOT NULL,
    role VARCHAR2(20) CONSTRAINT system_users_role_ck CHECK(role IN ('Admin', 'Manager', 'Sales'))
);

-- Inserting Sample Data

-- Inserting into Customers
INSERT INTO Customers VALUES (1, 'John', 'Smith', 'john.smith@email.com', '555-123-4567', '123 Main St, Anytown, CA 90210', SYSDATE);
INSERT INTO Customers VALUES (2, 'Jane', 'Doe', 'jane.doe@email.com', '555-234-5678', '456 Oak Ave, Somewhere, NY 10001', SYSDATE);
INSERT INTO Customers VALUES (3, 'Robert', 'Johnson', 'robert.johnson@email.com', '555-345-6789', '789 Pine Rd, Nowhere, TX 75001', SYSDATE);
INSERT INTO Customers VALUES (4, 'Emily', 'Williams', 'emily.williams@email.com', '555-456-7890', '321 Elm Blvd, Anywhere, FL 33101', SYSDATE);
INSERT INTO Customers VALUES (5, 'Michael', 'Brown', 'michael.brown@email.com', '555-567-8901', '654 Maple Dr, Everywhere, WA 98101', SYSDATE);
INSERT INTO Customers VALUES (6, 'Sarah', 'Davis', 'sarah.davis@email.com', '555-678-9012', '987 Cedar Ln, Somewhere, IL 60601', SYSDATE);

-- Inserting into Categories
INSERT INTO Categories VALUES (1, 'Electronics', 'Electronic devices and accessories');
INSERT INTO Categories VALUES (2, 'Clothing', 'Apparel and fashion items');
INSERT INTO Categories VALUES (3, 'Home & Kitchen', 'Household items and kitchen appliances');
INSERT INTO Categories VALUES (4, 'Books', 'Books, e-books, and publications');

-- Inserting into Suppliers
INSERT INTO Suppliers VALUES (1, 'Tech Innovations Inc.', 'contact@techinnovations.com');
INSERT INTO Suppliers VALUES (2, 'Fashion Forward Ltd.', 'info@fashionforward.com');
INSERT INTO Suppliers VALUES (3, 'Home Essentials Co.', 'support@homeessentials.com');
INSERT INTO Suppliers VALUES (4, 'Literary Treasures Publishing', 'orders@literarytreasures.com');
INSERT INTO Suppliers VALUES (5, 'Global Imports', 'sales@globalimports.com');

-- Inserting into Products
INSERT INTO Products VALUES (1, 'Smartphone X1', 1, 1, 699.99, 50, SYSDATE);
INSERT INTO Products VALUES (2, 'Laptop Pro 15"', 1, 1, 1299.99, 25, SYSDATE);
INSERT INTO Products VALUES (3, 'Wireless Headphones', 1, 1, 149.99, 100, SYSDATE);
INSERT INTO Products VALUES (4, 'Men\'s Casual Shirt', 2, 2, 39.99, 200, SYSDATE);
INSERT INTO Products VALUES (5, 'Women\'s Dress', 2, 2, 59.99, 150, SYSDATE);
INSERT INTO Products VALUES (6, 'Coffee Maker', 3, 3, 89.99, 75, SYSDATE);
INSERT INTO Products VALUES (7, 'Blender', 3, 3, 49.99, 100, SYSDATE);
INSERT INTO Products VALUES (8, 'Bestselling Novel', 4, 4, 24.99, 300, SYSDATE);
INSERT INTO Products VALUES (9, 'Cookbook', 4, 4, 34.99, 150, SYSDATE);
INSERT INTO Products VALUES (10, 'Smart Watch', 1, 5, 199.99, 50, SYSDATE);

-- Inserting into Orders
INSERT INTO Orders VALUES (1, 1, TO_DATE('2023-01-15', 'YYYY-MM-DD'), 'Delivered', 749.98);
INSERT INTO Orders VALUES (2, 2, TO_DATE('2023-02-20', 'YYYY-MM-DD'), 'Shipped', 1299.99);
INSERT INTO Orders VALUES (3, 3, TO_DATE('2023-03-10', 'YYYY-MM-DD'), 'Delivered', 189.98);
INSERT INTO Orders VALUES (4, 4, TO_DATE('2023-04-05', 'YYYY-MM-DD'), 'Pending', 119.98);
INSERT INTO Orders VALUES (5, 5, TO_DATE('2023-05-12', 'YYYY-MM-DD'), 'Shipped', 249.97);
INSERT INTO Orders VALUES (6, 6, TO_DATE('2023-06-18', 'YYYY-MM-DD'), 'Cancelled', 0);

-- Inserting into Order_Details
INSERT INTO Order_Details VALUES (1, 1, 1, 699.99);
INSERT INTO Order_Details VALUES (1, 3, 1, 149.99);
INSERT INTO Order_Details VALUES (2, 2, 1, 1299.99);
INSERT INTO Order_Details VALUES (3, 4, 2, 39.99);
INSERT INTO Order_Details VALUES (3, 8, 1, 24.99);
INSERT INTO Order_Details VALUES (4, 6, 1, 89.99);
INSERT INTO Order_Details VALUES (4, 9, 1, 34.99);
INSERT INTO Order_Details VALUES (5, 5, 1, 59.99);
INSERT INTO Order_Details VALUES (5, 7, 1, 49.99);
INSERT INTO Order_Details VALUES (5, 10, 1, 199.99);

-- Inserting into System_Users
INSERT INTO System_Users VALUES (1, 'admin', 'hashed_password_123', 'Admin');
INSERT INTO System_Users VALUES (2, 'manager1', 'hashed_password_456', 'Manager');
INSERT INTO System_Users VALUES (3, 'sales1', 'hashed_password_789', 'Sales');
INSERT INTO System_Users VALUES (4, 'sales2', 'hashed_password_012', 'Sales');

-- Creating Sequences for Auto-incrementing IDs
CREATE SEQUENCE customers_seq START WITH 7 INCREMENT BY 1;
CREATE SEQUENCE products_seq START WITH 11 INCREMENT BY 1;
CREATE SEQUENCE orders_seq START WITH 7 INCREMENT BY 1;

CREATE SEQUENCE system_users_seq START WITH 5 INCREMENT BY 1;

-- Example of using sequences
-- INSERT INTO Customers (customer_id, first_name, last_name, email, phone, address, created_at)
-- VALUES (customers_seq.NEXTVAL, 'New', 'Customer', 'new.customer@email.com', '555-999-8888', 'New Address', SYSDATE);

-- Creating Views

-- View: Customer Orders Summary
CREATE OR REPLACE VIEW customer_orders_summary AS
SELECT c.customer_id, c.first_name, c.last_name, COUNT(o.order_id) AS total_orders, 
       SUM(o.total) AS total_spent
FROM Customers c
LEFT JOIN Orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name;

-- View: Product Category Summary
CREATE OR REPLACE VIEW product_category_summary AS
SELECT c.category_id, c.category_name, COUNT(p.product_id) AS product_count,
       AVG(p.price) AS avg_price, SUM(p.stock_quantity) AS total_stock
FROM Categories c
LEFT JOIN Products p ON c.category_id = p.category_id
GROUP BY c.category_id, c.category_name;

-- View: Order Details Extended (Read-only)
CREATE OR REPLACE VIEW order_details_extended AS
SELECT o.order_id, c.customer_id, c.first_name || ' ' || c.last_name AS customer_name,
       p.product_id, p.product_name, od.quantity, od.unit_price, (od.quantity * od.unit_price) AS line_total,
       o.order_date, o.status
FROM Order_Details od
JOIN Orders o ON od.order_id = o.order_id
JOIN Customers c ON o.customer_id = c.customer_id
JOIN Products p ON od.product_id = p.product_id
WITH READ ONLY;

-- Query 1: Find all orders for a specific customer
SELECT o.order_id, o.order_date, o.status, o.total
FROM Orders o
WHERE o.customer_id = 1;

-- Query 2: Find all products in a specific category with stock > 0
SELECT p.product_id, p.product_name, p.price, p.stock_quantity
FROM Products p
WHERE p.category_id = 1 AND p.stock_quantity > 0
ORDER BY p.price DESC;

-- Query 3: Calculate total sales by category
SELECT c.category_name, SUM(od.quantity * od.unit_price) AS total_sales
FROM Order_Details od
JOIN Products p ON od.product_id = p.product_id
JOIN Categories c ON p.category_id = c.category_id
JOIN Orders o ON od.order_id = o.order_id
WHERE o.status != 'Cancelled'
GROUP BY c.category_name
ORDER BY total_sales DESC;

-- Query 4: Find customers who haven't placed any orders
SELECT c.customer_id, c.first_name, c.last_name, c.email
FROM Customers c
LEFT JOIN Orders o ON c.customer_id = o.customer_id
WHERE o.order_id IS NULL;

-- Query 5: Find the most popular products (most ordered)
SELECT p.product_id, p.product_name, SUM(od.quantity) AS total_ordered
FROM Products p
JOIN Order_Details od ON p.product_id = od.product_id
JOIN Orders o ON od.order_id = o.order_id
WHERE o.status != 'Cancelled'
GROUP BY p.product_id, p.product_name
ORDER BY total_ordered DESC;

COMMIT;