CONNECT sys/sys as SYSDBA;
DROP USER c##lci_database_manager CASCADE;
CREATE USER c##lci_database_manager IDENTIFIED BY 1234;
GRANT connect, resource TO c##lci_database_manager;
ALTER USER c##lci_database_manager QUOTA 200M ON users;

CONNECT c##lci_database_manager/1234;

-- Creating Tables with Constraints

DROP TABLE System_Users CASCADE;
DROP TABLE Order_Details CASCADE;
DROP TABLE Orders CASCADE;
DROP TABLE Products CASCADE;
DROP TABLE Suppliers CASCADE;
DROP TABLE Categories CASCADE;
DROP TABLE Customers CASCADE;

CREATE TABLE Customers (
    customer_id NUMBER(8) CONSTRAINT customers_customer_id_pk PRIMARY KEY,
    first_name VARCHAR2(50) CONSTRAINT customers_first_name_nn NOT NULL,
    last_name VARCHAR2(50) CONSTRAINT customers_last_name_nn NOT NULL,
    email VARCHAR2(100) CONSTRAINT customers_email_uq UNIQUE CONSTRAINT customers_email_nn NOT NULL,
    phone VARCHAR2(15),
    address VARCHAR2(255),
    created_at DATE DEFAULT SYSDATE
);

CREATE TABLE Categories (
    category_id NUMBER(2) CONSTRAINT categories_category_id_pk PRIMARY KEY,
    category_name VARCHAR2(100) CONSTRAINT categories_category_name_nn NOT NULL,
    description VARCHAR2(255)
);

CREATE TABLE Suppliers (
    supplier_id NUMBER(5) CONSTRAINT suppliers_supplier_id_pk PRIMARY KEY,
    supplier_name VARCHAR2(100) CONSTRAINT suppliers_supplier_name_nn NOT NULL,
    contact_info VARCHAR2(255)
);

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

CREATE TABLE Orders (
    order_id NUMBER(8) CONSTRAINT orders_order_id_pk PRIMARY KEY,
    customer_id NUMBER(8) CONSTRAINT orders_customer_id_nn NOT NULL,
    order_date DATE DEFAULT SYSDATE,
    status VARCHAR2(20) CONSTRAINT orders_status_ck CHECK(status IN ('Pending', 'Shipped', 'Delivered', 'Cancelled')),
    total NUMBER(10,2) DEFAULT 0,
    CONSTRAINT orders_customer_id_fk FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)
);

CREATE TABLE Order_Details (
    order_id NUMBER(8) CONSTRAINT order_details_order_id_nn NOT NULL,
    product_id NUMBER(8) CONSTRAINT order_details_product_id_nn NOT NULL,
    quantity NUMBER(4) CONSTRAINT order_details_quantity_nn NOT NULL CONSTRAINT order_details_quantity_ck CHECK(quantity > 0),
    unit_price NUMBER(10,2) CONSTRAINT order_details_unit_price_nn NOT NULL,
    CONSTRAINT order_details_pk PRIMARY KEY (order_id, product_id),
    CONSTRAINT order_details_order_id_fk FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    CONSTRAINT order_details_product_id_fk FOREIGN KEY (product_id) REFERENCES Products(product_id)
);

CREATE TABLE System_Users (
    user_id NUMBER(5) CONSTRAINT system_users_user_id_pk PRIMARY KEY,
    username VARCHAR2(50) CONSTRAINT system_users_username_uq UNIQUE CONSTRAINT system_users_username_nn NOT NULL,
    password VARCHAR2(255) CONSTRAINT system_users_password_nn NOT NULL,
    role VARCHAR2(20) CONSTRAINT system_users_role_ck CHECK(role IN ('Admin', 'Manager', 'Sales'))
);

-- Adjusting sequences to start from 1
CREATE SEQUENCE customers_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE categories_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE suppliers_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE products_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE orders_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE system_users_seq START WITH 1 INCREMENT BY 1;

-- Inserting Sample Data in proper order to use sequences for all keys

-- Insert Categories first (referenced by Products)
INSERT INTO Categories VALUES (categories_seq.NEXTVAL, 'Electronics', 'Electronic devices and accessories');
INSERT INTO Categories VALUES (categories_seq.NEXTVAL, 'Clothing', 'Apparel and fashion items');
INSERT INTO Categories VALUES (categories_seq.NEXTVAL, 'Home & Kitchen', 'Household items and kitchen appliances');
INSERT INTO Categories VALUES (categories_seq.NEXTVAL, 'Books', 'Books, e-books, and publications');

-- Insert Suppliers next (referenced by Products)
INSERT INTO Suppliers VALUES (suppliers_seq.NEXTVAL, 'Tech Innovations Inc.', 'contact@techinnovations.com');
INSERT INTO Suppliers VALUES (suppliers_seq.NEXTVAL, 'Fashion Forward Ltd.', 'info@fashionforward.com');
INSERT INTO Suppliers VALUES (suppliers_seq.NEXTVAL, 'Home Essentials Co.', 'support@homeessentials.com');
INSERT INTO Suppliers VALUES (suppliers_seq.NEXTVAL, 'Literary Treasures Publishing', 'orders@literarytreasures.com');
INSERT INTO Suppliers VALUES (suppliers_seq.NEXTVAL, 'Global Imports', 'sales@globalimports.com');

-- Insert Customers (referenced by Orders)
INSERT INTO Customers VALUES (customers_seq.NEXTVAL, 'John', 'Smith', 'john.smith@email.com', '555-123-4567', '123 Main St, Anytown, CA 90210', DATE '2000-01-15');
INSERT INTO Customers VALUES (customers_seq.NEXTVAL, 'Jane', 'Doe', 'jane.doe@email.com', '555-234-5678', '456 Oak Ave, Somewhere, NY 10001', DATE '2004-02-20');
INSERT INTO Customers VALUES (customers_seq.NEXTVAL, 'Robert', 'Johnson', 'robert.johnson@email.com', '555-345-6789', '789 Pine Rd, Nowhere, TX 75001', DATE '2015-03-10');
INSERT INTO Customers VALUES (customers_seq.NEXTVAL, 'Emily', 'Williams', 'emily.williams@email.com', '555-456-7890', '321 Elm Blvd, Anywhere, FL 33101', DATE '2017-04-05');
INSERT INTO Customers VALUES (customers_seq.NEXTVAL, 'Michael', 'Brown', 'michael.brown@email.com', '555-567-8901', '654 Maple Dr, Everywhere, WA 98101', DATE '2018-05-12');
INSERT INTO Customers VALUES (customers_seq.NEXTVAL, 'Sarah', 'Davis', 'sarah.davis@email.com', '555-678-9012', '987 Cedar Ln, Somewhere, IL 60601', DATE '2019-06-18');

-- Insert Products using sequences for both primary and foreign keys
INSERT INTO Products VALUES (products_seq.NEXTVAL, 'Smartphone X1', 1, 1, 699.99, 50, SYSDATE);
INSERT INTO Products VALUES (products_seq.NEXTVAL, 'Laptop Pro 15"', 1, 1, 1299.99, 25, SYSDATE);
INSERT INTO Products VALUES (products_seq.NEXTVAL, 'Wireless Headphones', 1, 1, 149.99, 100, SYSDATE);
INSERT INTO Products VALUES (products_seq.NEXTVAL, 'Men\'s Casual Shirt', 2, 2, 39.99, 200, SYSDATE);
INSERT INTO Products VALUES (products_seq.NEXTVAL, 'Women\'s Dress', 2, 2, 59.99, 150, SYSDATE);
INSERT INTO Products VALUES (products_seq.NEXTVAL, 'Coffee Maker', 3, 3, 89.99, 75, SYSDATE);
INSERT INTO Products VALUES (products_seq.NEXTVAL, 'Blender', 3, 3, 49.99, 100, SYSDATE);
INSERT INTO Products VALUES (products_seq.NEXTVAL, 'Bestselling Novel', 4, 4, 24.99, 300, SYSDATE);
INSERT INTO Products VALUES (products_seq.NEXTVAL, 'Cookbook', 4, 4, 34.99, 150, SYSDATE);
INSERT INTO Products VALUES (products_seq.NEXTVAL, 'Smart Watch', 1, 5, 199.99, 50, SYSDATE);

-- Insert Orders and Order_Details
-- John's order
INSERT INTO Orders VALUES (orders_seq.NEXTVAL, 1, TO_DATE('2023-01-15', 'YYYY-MM-DD'), 'Delivered', 849.98);
INSERT INTO Order_Details VALUES (orders_seq.CURRVAL, 1, 1, 699.99); -- Smartphone X1
INSERT INTO Order_Details VALUES (orders_seq.CURRVAL, 3, 1, 149.99); -- Wireless Headphones

-- Jane's order
INSERT INTO Orders VALUES (orders_seq.NEXTVAL, 2, TO_DATE('2023-02-20', 'YYYY-MM-DD'), 'Shipped', 1299.99);
INSERT INTO Order_Details VALUES (orders_seq.CURRVAL, 2, 1, 1299.99); -- Laptop Pro 15"

-- Robert's order
INSERT INTO Orders VALUES (orders_seq.NEXTVAL, 3, TO_DATE('2023-03-10', 'YYYY-MM-DD'), 'Delivered', 189.98);
INSERT INTO Order_Details VALUES (orders_seq.CURRVAL, 8, 1, 24.99); -- Bestselling Novel
INSERT INTO Order_Details VALUES (orders_seq.CURRVAL, 6, 1, 89.99); -- Coffee Maker
INSERT INTO Order_Details VALUES (orders_seq.CURRVAL, 9, 1, 34.99); -- Cookbook

-- Emily's order
INSERT INTO Orders VALUES (orders_seq.NEXTVAL, 4, TO_DATE('2023-04-05', 'YYYY-MM-DD'), 'Pending', 119.98);
INSERT INTO Order_Details VALUES (orders_seq.CURRVAL, 5, 1, 59.99); -- Women's Dress
INSERT INTO Order_Details VALUES (orders_seq.CURRVAL, 7, 1, 49.99); -- Blender

-- Michael's order
INSERT INTO Orders VALUES (orders_seq.NEXTVAL, 5, TO_DATE('2023-05-12', 'YYYY-MM-DD'), 'Shipped', 249.97);
INSERT INTO Order_Details VALUES (orders_seq.CURRVAL, 10, 1, 199.99); -- Smart Watch
INSERT INTO Order_Details VALUES (orders_seq.CURRVAL, 4, 2, 39.99); -- Men's Casual Shirt (2 pieces)

-- Sarah's order (cancelled, no items)
INSERT INTO Orders VALUES (orders_seq.NEXTVAL, 6, TO_DATE('2023-06-18', 'YYYY-MM-DD'), 'Cancelled', 0);

-- Insert System Users
INSERT INTO System_Users VALUES (system_users_seq.NEXTVAL, 'admin', 'hashed_password_123', 'Admin');
INSERT INTO System_Users VALUES (system_users_seq.NEXTVAL, 'manager1', 'hashed_password_456', 'Manager');
INSERT INTO System_Users VALUES (system_users_seq.NEXTVAL, 'sales1', 'hashed_password_789', 'Sales');
INSERT INTO System_Users VALUES (system_users_seq.NEXTVAL, 'sales2', 'hashed_password_012', 'Sales');

COMMIT;

-- Creating Views
CREATE OR REPLACE VIEW v_customers AS
SELECT first_name, last_name, email, phone, address, created_at FROM Customers WITH READ ONLY;

CREATE OR REPLACE VIEW elite_customers AS
SELECT first_name, last_name, email, phone, address, created_at FROM Customers
WHERE created_at < ADD_MONTHS(SYSDATE, -6 * 12) WITH CHECK OPTION;

