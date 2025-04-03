## 1. Database Schema Overview

The model is based on an online retail system. It includes tables for customers, products, categories, suppliers, orders, order details, and system users. Relationships are enforced using primary and foreign key constraints, and additional rules are set with UNIQUE, CHECK, and NOT NULL constraints.

---

## 2. Data Definition: Creating Tables and Constraints

### Table: Customers

```sql
CREATE TABLE Customers (
    customer_id INT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    address VARCHAR(255),
    created_at DATE DEFAULT SYSDATE
);
```

### Table: Categories

```sql
CREATE TABLE Categories (
    category_id INT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description VARCHAR(255)
);
```

### Table: Suppliers

```sql
CREATE TABLE Suppliers (
    supplier_id INT PRIMARY KEY,
    supplier_name VARCHAR(100) NOT NULL,
    contact_info VARCHAR(255)
);
```

### Table: Products

```sql
CREATE TABLE Products (
    product_id INT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    category_id INT NOT NULL,
    supplier_id INT,
    price DECIMAL(10,2) CHECK(price > 0),
    stock_quantity INT DEFAULT 0 CHECK(stock_quantity >= 0),
    created_at DATE DEFAULT SYSDATE,
    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES Categories(category_id),
    CONSTRAINT fk_supplier FOREIGN KEY (supplier_id) REFERENCES Suppliers(supplier_id)
);
```

### Table: Orders

```sql
CREATE TABLE Orders (
    order_id INT PRIMARY KEY,
    customer_id INT NOT NULL,
    order_date DATE DEFAULT SYSDATE,
    status VARCHAR(20) CHECK(status IN ('Pending', 'Shipped', 'Delivered', 'Cancelled')),
    total DECIMAL(10,2) DEFAULT 0,
    CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)
);
```

### Table: Order_Details

```sql
CREATE TABLE Order_Details (
    order_detail_id INT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK(quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES Products(product_id)
);
```

### Table: System_Users

```sql
CREATE TABLE System_Users (
    user_id INT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK(role IN ('Admin', 'Manager', 'Sales'))
);
```

_Note: Alter or drop tables later using ALTER TABLE and DROP TABLE commands when needed._

---

## 3. Sequences for Auto-Incremented IDs

Sequences allow automatic generation of primary key values.

```sql
CREATE SEQUENCE seq_customers START WITH 1000 INCREMENT BY 1;
CREATE SEQUENCE seq_products START WITH 2000 INCREMENT BY 1;
CREATE SEQUENCE seq_orders START WITH 3000 INCREMENT BY 1;
CREATE SEQUENCE seq_order_details START WITH 4000 INCREMENT BY 1;
```

To use them in INSERT statements, you might call:

```sql
INSERT INTO Customers (customer_id, first_name, last_name, email)
VALUES (NEXTVAL(seq_customers), 'Alice', 'Smith', 'alice.smith@example.com');
```

And you can check current sequence values with CURRVAL:

```sql
SELECT CURRVAL(seq_customers) FROM dual;
```

_Alter a sequence if needed:_

```sql
ALTER SEQUENCE seq_customers INCREMENT BY 2;
```

---

## 4. Data Manipulation: INSERT, UPDATE, DELETE

### INSERT Examples

```sql
-- Insert a new product.
INSERT INTO Products (product_id, product_name, category_id, supplier_id, price, stock_quantity)
VALUES (NEXTVAL(seq_products), 'Wireless Mouse', 1, 101, 29.99, 150);
```

### UPDATE Examples

```sql
-- Update stock quantity after new inventory arrival.
UPDATE Products
SET stock_quantity = stock_quantity + 50
WHERE product_id = 2001;
```

### DELETE Examples

```sql
-- Delete an order that was cancelled.
DELETE FROM Orders
WHERE order_id = 3005 AND status = 'Cancelled';
```

---

## 5. Data Retrieval: SELECT, GROUP BY, HAVING, and JOIN

### Basic SELECT with String Functions

```sql
SELECT UPPER(first_name) AS first_name, INITCAP(last_name) AS last_name,
       SUBSTR(email, 1, 10) AS email_prefix
FROM Customers
WHERE email LIKE '%@example.com';
```

### SELECT with JOIN, GROUP BY, HAVING, and Aggregate Functions

```sql
SELECT c.customer_id, CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
       COUNT(o.order_id) AS order_count,
       SUM(o.total) AS total_spent
FROM Customers c
JOIN Orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name
HAVING SUM(o.total) > 500
ORDER BY total_spent DESC;
```

### Using Mathematical and Date Functions

```sql
SELECT order_id, total,
       ROUND(POWER(total, 1/2.0), 2) AS square_root_total,
       TO_CHAR(order_date, 'DD-MON-YYYY') AS formatted_date,
       ADD_MONTHS(order_date, 1) AS next_month
FROM Orders
WHERE order_date >= LAST_DAY(ADD_MONTHS(SYSDATE, -1)) + 1;
```

_Other functions like MOD, ABS, CEIL, FLOOR, and INTERVAL can be integrated as needed in similar queries._

---

## 6. Views: Creating and Managing Virtual Tables

### Creating a Simple View

```sql
CREATE VIEW Order_Summary AS
SELECT o.order_id, c.first_name || ' ' || c.last_name AS customer_name,
       o.order_date, o.status, o.total
FROM Orders o
JOIN Customers c ON o.customer_id = c.customer_id;
```

### Creating or Replacing a View with Additional Options

```sql
CREATE OR REPLACE VIEW Product_Inventory
AS
SELECT p.product_id, INITCAP(p.product_name) AS product_name, c.category_name,
       p.stock_quantity, p.price,
       LPAD(p.product_id, 6, '0') AS padded_product_id
FROM Products p
JOIN Categories c ON p.category_id = c.category_id
WITH READ ONLY
WITH CHECK OPTION;
```

_Force view creation can be applied in some database systems if needed._

---

## 7. Transactions: SAVEPOINT, ROLLBACK, COMMIT

When performing multiple data manipulation tasks, transactions ensure data integrity.

```sql
-- Start a transaction (implicit in many systems)
BEGIN;

-- Create a savepoint before a set of operations.
SAVEPOINT before_order_update;

-- Update order totals.
UPDATE Orders
SET total = total + 10.00
WHERE order_id = 3002;

-- If an error occurs, rollback to the savepoint.
-- ROLLBACK TO before_order_update;

-- Otherwise, commit the transaction.
COMMIT;
```

---

## 8. User Management

Database administrators might need to manage users and their privileges.

### Create a New User and Grant Privileges

```sql
CREATE USER retail_manager IDENTIFIED BY 'securePassword123';
GRANT SELECT, INSERT, UPDATE, DELETE ON Customers TO retail_manager;
GRANT SELECT, INSERT, UPDATE, DELETE ON Orders TO retail_manager;
```

### Alter and Drop User

```sql
ALTER USER retail_manager IDENTIFIED BY 'newSecurePassword456';

DROP USER retail_manager;
```

---

## 9. Miscellaneous Commands and Functions

### Additional String Functions

```sql
SELECT REPLACE(product_name, 'Wireless', 'Cordless') AS new_product_name,
       LPAD(product_name, 20, '*') AS padded_name,
       RTRIM(product_name) AS trimmed_name,
       LENGTH(product_name) AS name_length
FROM Products;
```

### Additional Mathematical Functions

```sql
SELECT product_id, price,
       MOD(price, 5) AS remainder,
       ABS(price - 30) AS price_difference,
       CEIL(price) AS ceil_price,
       FLOOR(price) AS floor_price
FROM Products;
```

### Additional Date Functions

```sql
SELECT order_id, order_date,
       MONTHS_BETWEEN(SYSDATE, order_date) AS months_since_order,
       INTERVAL '1' DAY AS one_day_interval
FROM Orders;
```

### Miscellaneous Operators and Aggregates

```sql
SELECT COUNT(*) AS total_customers,
       MAX(total) AS highest_order,
       MIN(total) AS lowest_order,
       AVG(total) AS average_order
FROM Orders
WHERE total IS NOT NULL;
```

### Using NVL and NVL2

```sql
SELECT customer_id,
       NVL(phone, 'No Phone Provided') AS phone_info,
       NVL2(address, 'Has Address', 'No Address') AS address_status
FROM Customers;
```

### Spooling (Output to a File) – Example in SQL\*Plus

```sql
SPOOL order_report.txt

SELECT order_id, total, TO_CHAR(order_date, 'DD-MON-YYYY')
FROM Orders
ORDER BY order_date;

SPOOL OFF
```

---

## 10. Summary

This extensive database model demonstrates how to logically incorporate every listed SQL command and function into one cohesive system. The model supports data definition, manipulation, retrieval, and management while providing examples for constraints, transactions, sequences, views, string and date functions, and more. This structure not only meets administrative needs (user management and sequence control) but also supports robust reporting and data analysis through views and advanced queries.

This design can serve as a template for a real-world system and can be extended or modified to fit specific business requirements.

