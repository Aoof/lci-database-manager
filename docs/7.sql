VIEW
  a SELECT statement look like a table
  Why view?
      Syntax:   CREATE OR REPLACE [FORCE] VIEW name_of_view AS
                    SELECT statement
               [ WITH READ ONLY
                 WITH CHECK OPTION ] ;


    1/ For sensitive data, we want to hide the sensitive data
       Example 1: Using schema c##scott, create a view named  employee contain column
empno, ename, job, deptno of table emp. Give user c##puja full privileges on the
view employee so that c##puja can help c##scott to manipulate the data of table emp.

  sol:  
connect sys/sys as sysdba
GRANT create view to c##scott;
CREATE USER c##puja IDENTIFIED BY 1234;
GRANt connect, resource TO c##puja;
connect c##puja/1234;
-- scott
CREATE OR REPLACE VIEW employee AS
           SELECT empno, ename, job, deptno FROM emp;
GRANT SELECT, UPDATE, INSERT, DELETE on EMPLOYEE to c##puja;

-- puja
  SELECT * FROM c##scott.employee;
  UPDATE c##scott.employee SET job = 'MANAGER' WHERE empno = 7934;
  




    2/ To make the select simpler
 Example 2: using schema c##scott, create a view named employee_detail WITH column
empno, ename, job, sal, of table emp and column dename, loc from table dept.  give
c##puja the select privilege to access the view just created.
   CREATE OR REPLACE VIEW employee_detail AS
   SELECT empno, ename, job, sal, dname, loc
   FROM   EMP,DEPT
   WHERE  emp.deptno = dept.deptno;

   GRANT SELECT on EMPLOYEE_DETAIL to c##puja;
-- connor
  SELECT * FROM c##scott.employee_DETAIL;
------------------------------------------  WITH READ ONLY  --------------
  Example 3: Create a view similar to example 1 with the option WITH READ ONLY so that the view
is just to DISPLAY the data of the table emp
-- c##scott
CREATE OR REPLACE VIEW employee_Read AS
           SELECT empno, ename, job, deptno FROM emp
WITH READ ONLY;
GRANT SELECT, UPDATE, DELETE, INSERT on EMPLOYEE_REad TO c##puja;

-- puja
  SELECT * FROM c##scott.employee_read;
  UPDATE c##scott.employee_read SET job = 'PRESIDENT' WHERE empno = 7934;
-----------------------------
                    WITH CHECK OPTION  -----------------

Example 4: create a view named employee_30 contain all the employees of 
department 30 with
column empno, ename, job, salary, deptno. 
 Make sure that data remain inside the view,
no employee can change the deparment number.  (hint: use option WITH CHECK OPTION)

  -- c##scott
CREATE OR REPLACE VIEW employee_30 AS
           SELECT empno, ename, job, sal, deptno 
           FROM emp 
           WHERE deptno = 30
           WITH CHECK OPTION;
 
  GRANT SELECT, UPDATE, DELETE, INSERT on EMPLOYEE_30 TO c##puja;

-- puja
  SELECT * FROM c##scott.employee_30;
  UPDATE c##scott.employee_30 SET job = 'SALESMAN' , sal = 2000 
  WHERE empno = 7900;
  UPDATE c##scott.employee_30 SET deptno = 40 WHERE empno = 7900;
-------------------------------------  FORCE -------------------
Can we create a view based on the two table NOT YET to be created????
IF YES , create a view named child_detail containing all the columns of the two entities of the
design below

    MOTHER  ---E   CHILD
MOTHER(MID, mname)
CHILD(CID, cname, mom_id)

sol:   CREATE OR REPLACE FORCE VIEW child_detail AS
          SELECT mid, mname, cid, cname, mom_id
          FROM   mother, child
          WHERE  mother.mid = child.mom_id;

-- 3 years later
       CREATE TABLE mother(mid NUMBER, mname VARCHAR2(60));
    ALTER TABLE mother
    ADD CONSTRAINT mother_mid_pk PRIMARY KEY (mid);
       CREATE TABLE child(cid NUMBER, cname VARCHAR2(60), mom_id NUMBER, 
        CONSTRAINT  child_c_id_pk PRIMARY KEY(cid),
        CONSTRAINT  child_mom_id_fk FOREIGN KEY(mom_id)
        REFERENCES  mother(mid) );

   INSERT INTO mother
   VALUES(1,'Stephanie');
   INSERT INTO child
   VALUES(10, 'Elena',1);
---------------------------------------------------------------------------
SINGLE ROW FUNCTION
connect c##des03/tiger  (script 7northwoods)
SELECT table_name FROM user_tables;


 -- Character Datatype
UPPER (string) / LOWER (string)
Return the string with all the characters converted into
UPPER or LOWER case

Ex:
SELECT s_last, UPPER(s_last), LOWER (s_last)
 FROM student ;



 SELECT s_id, s_dob, s_last from student WHERE s_last = 'MILLER';

SELECT S_ID, S_DOB, S_Last 
FROM student 
WHERE UPPER (s_last) ='MILLER' ;
 

INITCAP (string)
Return the string with only the first character in upper case

Ex: 

SELECT f_rank, INITCAP (f_rank)
FROM faculty;




REPLACE (string, search_string, replacement_string)
Replace the occurent of the search_string
with the replacement_string


Ex: 
SELECT term_desc, REPLACE (term_desc, '200', '202')
    FRom term;



Question:  Write the statement to update the term description of the
term number 4 by adding 10 year to the original year.

UPDATE term
SET term_desc = (SELECT REPLACE (term_desc, '200', '201')
                 FROM term WHERE term_id = 4)
WHERE term_id = 4;


SUBSTR (string, start_position, length)
Return a string starting at the start position and of
specified length (use negative start position to start
from the right side)

Ex: SELECT term_desc, SUBSTR(term_desc, 1, 4)
 FROM term;


Fall 2005


SELECT term_desc, SUBSTR(term_desc, -4, 4)
 FROM term;

LPAD/ RPAD (string, number of characters, padding character)
Return the value of the string with specified number of
padding character added to the LEFT or to the RIGHT
Ex: 
SELECT course_id, credits, LPAD(credits,3,'0'),
 RPAD(credits,5,'*')
 FROM course;

 UPDATE course SET credits = 11 WHERE course_id = 3;


LTRIM/ RTRIM (string, search_string)
Return the string with the occurence of the search string
TRIMMED on the left side OR of the right side

Ex: 
SELECT call_id, LTRIM (call_id, 'MIS ')
FROM course;



LENGTH (string)



Return an INTEGER representing the string's length
SELECT LENGTH ('kunj'), LENGTH('Hardeep') ,term_desc,
 LENGTh (term_desc)
FROM term;


---------------------------
NUMBER DATATYPE
 ABS(number) Return the abolute value of a number
 Ex: 

SELECT ABS(-5) , ABS(5)
 FROM dual;


 CEIL (number)

Return the value of the number round UP to the next INTEGER
 Ex: SELECT CEIL(259.00), CEIL(259.01), CEIL(259.99)
 FROM dual;


FLOOR (number)
Return the value of the number round DOWN to the previous INTEGER
 Ex: SELECT FLOOR(259.00), FLOOR(259.01), FLOOR(259.99)
 FROM dual;


ROUND (number, precision) Return the number rounded to the
specified precision


SELECT ROUND(456.4) , ROUND(456.5) , ROUND (456.6) from DUAL;
Ex: SELECT ROUND(123.456)
 FROM dual; 123

 SELECT ROUND(123.456, 1)
 FROM dual;


 123.5
 SELECT ROUND(123.456, 2)
 FROM dual;



123.46
 SELECT ROUND(456.123,-1)
 FROM dual;



 460
 SELECT ROUND(456.123, -3)
 FROM dual;



500
 SELECT ROUND(456.123, -3)
 FROM dual; 0
 SELECT ROUND(500.123, -3)
 FROM dual; 1000


POWER(number, power)
Return the value representing a number raised to the
specified power
 Ex: SELECT Power(2,2), Power(2,3), Power(7,7)
 FROM dual;


MOD (number, divisor) Return the remainder (modulus) for
a number and divisor
 Ex: SELECT MOD(8,2), MOD(10,3), MOD (150, 20)
 FROM dual;



------------------- DATE datatype ------------
TO_CHAR (date, format) Convert a date into character with
the specified format
connect to any user,
run script 7northwoods


 SELECT table_name FROM user_tables;
 SELECT sysdate
 FROM dual;


 SELECT TO_CHAR(sysdate, 'DD Month YYYY Day Year HH:MI:SS Am')
 FROM dual;





 SELECT TO_CHAR(TO_DATE('25 03 1997', 'DD MM YYYY'), 'DD Month YYYY
Day Year HH:MI:SS')
 FROM dual;


SELECT TO_CHAR(TO_DATE('24 06 1999', 'DD MM YYYY'), 'DD Month YYYY Day
Year HH:MI:SS')
 FROM dual;


-- round with date
 SELECT ROUND(TO_DATE('16 01 1992', 'DD MM YYYY'),'MONTH') from DUAL;

 1 OF fEB 92
 SELECT ROUND(TO_DATE('30 06 1983', 'DD MM YYYY'),'year')
 FROM dual; 83 01 01
 SELECT ROUND(TO_DATE('01 07 1983', 'DD MM YYYY'),'year')
 FROM dual;
01 01 1984

 SELECT ROUND(sysdate,'month')
 FROM dual;

SELECT ROUND(sysdate + 120,'year')
 FROM dual;


 SELECT ROUND(sysdate - 150,'year')
 FROM dual;


 SELECT ROUND(sysdate,'month')
 FROM dual; 


SELECT ROUND(sysdate - 10,'month')
 FROM dual; 
------------------------------------------------



 ADD_MONTHS (date, month_to_add) Return a date that is the
specified month after the input date
 Ex:
 SELECT ADD_MONTHS(sysdate, 11)
 FROM dual;


-- MONTHS_BETWEEN (date1, date2) Return number of months
including decimal faction between the 2 dates


 Ex: SELECT ADD_MONTHS(sysdate, 11) FROM dual;
SELECT ADD_MONTHS(sysdate, 11)
 FROM dual;

 months
today is 22 Mar 2024 --- result is 229

find month old
 SELECT FLOOR(MONTHS_BETWEEN(sysdate, TO_DATE('25 03 1997', 'DD MM
YYYY')))
 FROM dual;
-- find age


 SELECT FLOOR(MONTHS_BETWEEN(sysdate, TO_DATE('25 03 1997', 'DD MM
YYYY'))/12)
 FROM dual;


-- LAST_DAY (date) Return the date that is the last day of the months specified in
the
input date
 Ex: SELECT LAST_DAY (TO_DATE('19 02 2024', 'DD MM YYYY'))
 FROM dual; 29-FEB-24

SELECT LAST_DAY (TO_DATE('19 02 2025', 'DD MM YYYY'))
 FROM dual; 25-FEB-28

 SELECT LAST_DAY (TO_DATE('19 02 2024', 'DD MM YYYY'))
 FROM dual;


---------------------------------------        --------------

---------- FUNCTION works WITH any datatype ------------
connect c##scott/tiger
SELECT table_name FROM user_tables;
emp
Ex: Display the employee name, monthly salary, commission , and
the annual salary (including the one time commission per year) of all employees
(hint: use NVL function)


 SELECT ename, sal, comm, sal*12 + comm "Annual Salary" FROM emp;

NULL = un known
0 is a known


comm IS NULL = unknown
 connect scott/tiger;
 SELECT empno, ename, sal, comm , sal*12 + comm "Annual Salary" FROM
emp;


 SELECT empno , ename, sal, comm , NVL(comm,0),NVL(comm,50),
 sal*12+NVL(comm,0) "Annual Salary"
 FROM emp;



SELECT empno, ename, NVL(ename,'NOT AVAILABLE') FROM emp;
SELECT empno, ename, hiredate, NVL(hiredate,sysdate) FROM emp;


-----------
NVL2(column, value1, value2)
NOT NULL replace with value1
NULL replace with Value2



Ex: For employee who earns a commission, replace that amount with
2000, and for those who do not have a commission, give them 500.
Display NEW annual salary of all employees (hint: use NVL2 function)

SELECT empno , ename, sal, comm , NVL2(comm,2000,500), sal*12 +
NVL2(comm,2000,500) "Annual Salary"
FROM emp;





 --------------- INTERVAL datatype ---------------
 INTERVAL Year to Month
 INTERVAL DAY TO second
connect c##des03/tiger
 10 - 9
 desc student
 time_enrolled


Ex: Display the student name, time_enrolled, and the ARRIVAL time
 of all students

 SELECT s_last, s_first, time_enrolled, sysdate - time_enrolled "Arrival Date"
 FROM student;


Ex: Display the student name, time_enrolled, and time_enrolled
with 11 months added (hint: USE TO_YMINTERVAL to convert a string
represent an interval to INTERVAL datatype)



SELECT s_last, s_first, time_enrolled, time_enrolled +
 TO_YMINTERVAL ('0-11') "11 Month longer"
FROM student;



------------------ DAY TO SECOND -------------
DESC course_section
Ex: Display the c_sec_id, c_sec_duration of all course section
 SELECT c_sec_id, c_sec_duration
 FROM course_section;
 00 00:00:50

desc course_section
Ex: Display the c_sec_id, c_sec_duration , and c_sec_duration with
30 second longer (hint: use the TO_DSINTERVAL to convert a string
representing an interval into INTERVAL datatype)
 
SELECT c_sec_id, c_sec_duration, c_sec_duration +
 TO_DSINTERVAL ('0 00:00:30') "30 sec longer"
 FROM course_section;


Ex: Display the c_sec_id, c_sec_duration , and c_sec_duration with
23 hours 59 minutes and 30 second longer (hint: use the TO_DSINTERVAL to
convert a string
representing an iterval into INTERVAL datatype)
SELECT c_sec_id, c_sec_duration, c_sec_duration +
 TO_DSINTERVAL ('0 23:59:30')
 FROM course_section;


