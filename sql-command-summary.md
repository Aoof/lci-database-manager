# SQL Commands Summary

## Table of Contents

- [Data Retrieval](#data-retrieval)
  - [SELECT](#1-select)
  - [CREATE VIEW](#2-create-view)
  - [GROUP BY](#3-group-by)
  - [HAVING](#4-having)
- [Data Manipulation](#data-manipulation)
  - [INSERT](#5-insert)
  - [UPDATE](#6-update)
  - [DELETE](#7-delete)
- [Data Definition](#data-definition)
  - [CREATE TABLE](#8-create-table)
  - [ALTER TABLE](#9-alter-table)
  - [DROP TABLE](#10-drop-table)
- [Constraints](#constraints)
  - [PRIMARY KEY](#11-primary-key)
  - [FOREIGN KEY](#12-foreign-key)
  - [UNIQUE](#13-unique)
  - [CHECK](#14-check)
  - [NOT NULL](#15-not-null)
- [Transactions](#transactions)
  - [SAVEPOINT](#16-savepoint)
  - [ROLLBACK](#17-rollback)
  - [COMMIT](#18-commit)
- [User Management](#user-management)
  - [CREATE USER](#19-create-user)
  - [GRANT](#20-grant)
  - [DROP USER](#21-drop-user)
  - [ALTER USER](#22-alter-user)
- [Sequences](#sequences)
  - [CREATE SEQUENCE](#23-create-sequence)
  - [NEXTVAL / CURRVAL](#24-nextval--currval)
  - [ALTER SEQUENCE](#25-alter-sequence)
- [Views](#views)
  - [CREATE OR REPLACE VIEW](#26-create-or-replace-view)
  - [WITH READ ONLY](#27-with-read-only)
  - [WITH CHECK OPTION](#28-with-check-option)
  - [FORCE VIEW](#29-force-view)
- [String Functions](#string-functions)
  - [SUBSTR](#30-substr)
  - [UPPER / LOWER / INITCAP](#31-upper--lower--initcap)
  - [REPLACE](#32-replace)
  - [LPAD / RPAD](#33-lpad--rpad)
  - [LTRIM / RTRIM](#34-ltrim--rtrim)
  - [LENGTH](#35-length)
- [Mathematical Functions](#mathematical-functions)
  - [MOD](#36-mod)
  - [POWER](#37-power)
  - [ABS / CEIL / FLOOR](#38-abs--ceil--floor)
  - [ROUND](#39-round)
- [Date Functions](#date-functions)
  - [ADD_MONTHS](#40-add_months)
  - [LAST_DAY](#41-last_day)
  - [MONTHS_BETWEEN](#42-months_between)
  - [INTERVAL](#43-interval)
  - [TO_CHAR](#44-to_char)
- [Miscellaneous](#miscellaneous)
  - [IS NULL / IS NOT NULL](#45-is-null--is-not-null)
  - [NVL](#46-nvl)
  - [NVL2](#47-nvl2)
  - [SPOOL](#48-spool)
  - [COUNT](#49-count)
  - [MAX / MIN / AVG / SUM](#50-max--min--avg--sum)
  - [ORDER BY](#51-order-by)
  - [LIKE](#52-like)
  - [JOIN](#53-join)

## Data Retrieval

### 1. SELECT

**Description:** Used to retrieve data from one or more tables.
**Example:**

```sql
SELECT empno, ename, job, sal
FROM emp
WHERE sal > 2999;
```

### 2. CREATE VIEW

**Description:** Creates a virtual table based on a SELECT query.
**Example:**

```sql
CREATE OR REPLACE VIEW employee AS
SELECT empno, ename, job, deptno FROM emp;
```

### 3. GROUP BY

**Description:** Groups rows sharing a property and applies aggregate functions.
**Example:**

```sql
SELECT deptno, MAX(sal), MIN(sal), AVG(sal), SUM(sal)
FROM emp
GROUP BY deptno;
```

### 4. HAVING

**Description:** Filters groups based on a condition.
**Example:**

```sql
SELECT deptno, MAX(sal), MIN(sal), AVG(sal), SUM(sal)
FROM emp
GROUP BY deptno
HAVING MIN(sal) > 900;
```

---

## Data Manipulation

### 5. INSERT

**Description:** Adds new rows to a table.
**Example:**

```sql
INSERT INTO dept(loc, deptno, dname)
VALUES ('MONTREAL', 50, 'Marketing');
```

### 6. UPDATE

**Description:** Modifies existing rows in a table.
**Example:**

```sql
UPDATE dept
SET dname = 'Computer', loc = 'Toronto'
WHERE deptno = 52;
```

### 7. DELETE

**Description:** Removes rows from a table.
**Example:**

```sql
DELETE FROM dept
WHERE deptno = 52;
```

---

## Data Definition

### 8. CREATE TABLE

**Description:** Creates a new table in the database.
**Example:**

```sql
CREATE TABLE student (sid NUMBER, sname VARCHAR2(50), birthdate DATE);
```

### 9. ALTER TABLE

**Description:** Modifies the structure of an existing table.
**Examples:**

- Add a column:

```sql
ALTER TABLE member ADD (gender CHAR(1));
```

- Drop a column:

```sql
ALTER TABLE member DROP COLUMN phone;
```

### 10. DROP TABLE

**Description:** Deletes a table and its data permanently.
**Example:**

```sql
DROP TABLE student;
```

---

## Constraints

### 11. PRIMARY KEY

**Description:** Ensures that a column (or combination of columns) has unique values and cannot be NULL.
**Example:**

```sql
ALTER TABLE member ADD CONSTRAINT member_mid_PK PRIMARY KEY (mid);
```

### 12. FOREIGN KEY

**Description:** Establishes a relationship between two tables.
**Example:**

```sql
ALTER TABLE rental ADD CONSTRAINT rental_mid_FK FOREIGN KEY(mid) REFERENCES member(mid);
```

### 13. UNIQUE

**Description:** Ensures all values in a column are unique.
**Example:**

```sql
ALTER TABLE member ADD CONSTRAINT member_email_UK UNIQUE(email);
```

### 14. CHECK

**Description:** Ensures that all values in a column satisfy a specific condition.
**Example:**

```sql
ALTER TABLE video ADD CONSTRAINT video_price_CC CHECK (price >= 0);
```

### 15. NOT NULL

**Description:** Ensures that a column cannot have NULL values.
**Example:**

```sql
ALTER TABLE video MODIFY (title CONSTRAINT video_title_NN NOT NULL);
```

---

## Transactions

### 16. SAVEPOINT

**Description:** Creates a point in a transaction to which you can roll back.
**Example:**

```sql
SAVEPOINT savepoint_name;
```

### 17. ROLLBACK

**Description:** Undoes changes made in the current transaction.
**Example:**

```sql
ROLLBACK TO savepoint_name;
```

### 18. COMMIT

**Description:** Saves all changes made in the current transaction.
**Example:**

```sql
COMMIT;
```

---

## User Management

### 19. CREATE USER

**Description:** Creates a new database user.
**Example:**

```sql
CREATE USER c##sofia IDENTIFIED BY 1234;
```

### 20. GRANT

**Description:** Grants privileges to a user.
**Example:**

```sql
GRANT connect, resource TO c##sofia;
```

### 21. DROP USER

**Description:** Deletes a user and all their objects.
**Example:**

```sql
DROP USER c##sofia CASCADE;
```

### 22. ALTER USER

**Description:** Modifies a user's attributes.
**Example:**

```sql
ALTER USER c##sofia QUOTA 100M ON users;
```

---

## Sequences

### 23. CREATE SEQUENCE

**Description:** Creates a sequence to generate unique values.
**Example:**

```sql
CREATE SEQUENCE dept_sequence START WITH 52 INCREMENT BY 2;
```

### 24. NEXTVAL / CURRVAL

**Description:** Retrieves the next or current value of a sequence.
**Examples:**

- Get the next value:

```sql
SELECT dept_sequence.NEXTVAL FROM dual;
```

- Get the current value:

```sql
SELECT dept_sequence.CURRVAL FROM dual;
```

### 25. ALTER SEQUENCE

**Description:** Modifies an existing sequence.
**Example:**

```sql
ALTER SEQUENCE dept_sequence INCREMENT BY 5;
```

---

## Views

### 26. CREATE OR REPLACE VIEW

**Description:** Creates or updates a view.
**Example:**

```sql
CREATE OR REPLACE VIEW employee AS
SELECT empno, ename, job, deptno FROM emp;
```

### 27. WITH READ ONLY

**Description:** Restricts a view to be read-only.
**Example:**

```sql
CREATE OR REPLACE VIEW employee_read AS
SELECT empno, ename, job, deptno FROM emp
WITH READ ONLY;
```

### 28. WITH CHECK OPTION

**Description:** Ensures that data modifications through a view adhere to the view's WHERE clause.
**Example:**

```sql
CREATE OR REPLACE VIEW employee_30 AS
SELECT empno, ename, job, sal, deptno
FROM emp
WHERE deptno = 30
WITH CHECK OPTION;
```

### 29. FORCE VIEW

**Description:** Creates a view even if the base tables do not exist.
**Example:**

```sql
CREATE OR REPLACE FORCE VIEW child_detail AS
SELECT mid, mname, cid, cname, mom_id
FROM mother, child
WHERE mother.mid = child.mom_id;
```

---

## String Functions

### 30. SUBSTR

**Description:** Extracts a substring from a string.
**Example:**

```sql
SELECT term_desc, SUBSTR(term_desc, 1, 4)
FROM term;
```

### 31. UPPER / LOWER / INITCAP

**Description:** Converts strings to uppercase, lowercase, or capitalizes the first letter.
**Examples:**

- Uppercase:

```sql
SELECT UPPER(s_last) FROM student;
```

- Lowercase:

```sql
SELECT LOWER(s_last) FROM student;
```

- Capitalize:

```sql
SELECT INITCAP(s_last) FROM student;
```

### 32. REPLACE

**Description:** Replaces occurrences of a substring within a string.
**Example:**

```sql
SELECT REPLACE(term_desc, '200', '202') FROM term;
```

### 33. LPAD / RPAD

**Description:** Pads a string with characters on the left or right.
**Example:**

```sql
SELECT LPAD(credits, 3, '0') FROM course;
```

### 34. LTRIM / RTRIM

**Description:** Removes characters from the left or right of a string.
**Example:**

```sql
SELECT LTRIM(call_id, 'MIS ') FROM course;
```

### 35. LENGTH

**Description:** Returns the length of a string.
**Example:**

```sql
SELECT LENGTH('example') FROM dual;
```

---

## Mathematical Functions

### 36. MOD

**Description:** Returns the remainder of a division operation.
**Example:**

```sql
SELECT MOD(10, 3)
FROM dual;
```

### 37. POWER

**Description:** Raises a number to the power of another number.
**Example:**

```sql
SELECT POWER(2, 3)
FROM dual;
```

### 38. ABS / CEIL / FLOOR

**Description:** Performs mathematical operations on numbers.
**Examples:**

- Absolute value:

```sql
SELECT ABS(-5) FROM dual;
```

- Round up:

```sql
SELECT CEIL(259.01) FROM dual;
```

- Round down:

```sql
SELECT FLOOR(259.99) FROM dual;
```

### 39. ROUND

**Description:** Rounds a number to a specified precision.
**Example:**

```sql
SELECT ROUND(123.456, 2)
FROM dual;
```

---

## Date Functions

### 40. ADD_MONTHS

**Description:** Adds a specified number of months to a date.
**Example:**

```sql
SELECT ADD_MONTHS(sysdate, 11)
FROM dual;
```

### 41. LAST_DAY

**Description:** Returns the last day of the month for a given date.
**Example:**

```sql
SELECT LAST_DAY(TO_DATE('19 02 2024', 'DD MM YYYY'))
FROM dual;
```

### 42. MONTHS_BETWEEN

**Description:** Calculates the number of months between two dates.
**Example:**

```sql
SELECT MONTHS_BETWEEN(sysdate, TO_DATE('25 03 1997', 'DD MM YYYY')) FROM dual;
```

### 43. INTERVAL

**Description:** Represents a period of time.
**Examples:**

- Year to month:

```sql
SELECT TO_YMINTERVAL('0-11') FROM dual;
```

- Day to second:

```sql
SELECT TO_DSINTERVAL('0 23:59:30') FROM dual;
```

### 44. TO_CHAR

**Description:** Converts a date or number to a string.
**Example:**

```sql
SELECT TO_CHAR(sysdate, 'DD Month YYYY Day Year HH:MI:SS Am')
FROM dual;
```

---

## Miscellaneous

### 45. IS NULL / IS NOT NULL

**Description:** Checks for NULL or non-NULL values.
**Examples:**

- IS NOT NULL:

```sql
SELECT empno, ename, job, sal, comm
FROM emp
WHERE comm IS NOT NULL;
```

- IS NULL:

```sql
SELECT empno, ename, job, sal, comm
FROM emp
WHERE comm IS NULL;
```

### 46. NVL

**Description:** Replaces NULL with a specified value.
**Example:**

```sql
SELECT empno, ename, sal, NVL(comm, 0), sal * 12 + NVL(comm, 0) "Annual Salary"
FROM emp;
```

### 47. NVL2

**Description:** Returns different values based on whether a column is NULL or NOT NULL.
**Example:**

```sql
SELECT NVL2(comm, 2000, 500) FROM emp;
```

### 48. SPOOL

**Description:** Writes the output of SQL commands to a file.
**Example:**

```sql
SPOOL c:\DB1\output.txt;
```

### 49. COUNT

**Description:** Returns the number of rows matching a condition.
**Example:**

```sql
SELECT COUNT(*)
FROM emp;
```

### 50. MAX / MIN / AVG / SUM

**Description:** Aggregate functions to calculate maximum, minimum, average, and sum.
**Example:**

```sql
SELECT MAX(sal), MIN(sal), AVG(sal), SUM(sal)
FROM emp;
```

### 51. ORDER BY

**Description:** Sorts the result set in ascending or descending order.
**Example:**

```sql
SELECT ename, sal
FROM emp
ORDER BY sal DESC;
```

### 52. LIKE

**Description:** Searches for a specified pattern in a column.
**Examples:**

- Starts with 'M':

```sql
SELECT empno, ename, job, sal
FROM emp
WHERE ename LIKE 'M%';
```

- Ends with 'N':

```sql
SELECT empno, ename, job, sal
FROM emp
WHERE ename LIKE '%N';
```

### 53. JOIN

**Description:** Combines rows from two or more tables based on a related column.
**Examples:**

- Inner Join:

```sql
SELECT empno, ename, job, emp.deptno, dept.dname
FROM emp, dept
WHERE emp.deptno = dept.deptno;
```

- Outer Join:

```sql
SELECT empno, ename, job, emp.deptno, dept.dname
FROM emp, dept
WHERE emp.deptno = dept.deptno(+);
```

