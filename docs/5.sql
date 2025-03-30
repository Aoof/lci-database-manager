DDL = Create
DML = Insert, update, delete
DCL = Rollback, commit
DQL = Data Query Language

   SELECT ---------- FROM 1 table
  Syntax:  SELECT name_of_column1,  name_of_column2, ...
           FROM   name_of_table
         [ WHERE  search condition ] ;

Example 1:  Using schema c##scott , write a query to display the
employee number, name, job , and salary of all employees.

    SELECT empno, ename, job, sal 
    FROM   emp ;

Example 2:  Using schema c##scott , write a query to display the
employee number, name, job , and salary of all employees who earn
more than 2999. (hint: use comparision operator = for equal, > greater
than,  >= for greater or equal,  <= for less or equal ,  <> for not equal)


    SELECT empno, ename, job, sal 
    FROM   emp
    WHERE  sal > 2999 ;

Example 3:  Using schema c##scott , write a query to display the
employee number, name, job , and salary of all employees who earn
between 1600 and 2850. (hint: use comparision operator = for equal, > greater
than,  >= for greater or equal,  <= for less or equal ,  <> for not equal)
use logical operator AND)


    SELECT empno, ename, job, sal 
    FROM   emp
    WHERE  sal >= 1600 AND sal <= 2850 ;

==  SELECT empno, ename, job, sal 
    FROM   emp
    WHERE  sal BETWEEN 1600 AND  2850 ;

Example 4:  Using schema c##scott , write a query to display the
employee number, name, job , and salary of all employees who WORK as
a CLERK OR earn MORE THAN 2450. (hint: use comparision operator = for equal, > greater
than,  >= for greater or equal,  <= for less or equal ,  <> for not equal)
use logical operator OR)

SELECT empno, ename, job, sal 
    FROM   emp
    WHERE  job = 'CLERK' OR sal > 2450 ;
---------------------
   OPERATOR LIKE
      % wildcard is for any number of different characters
      _ wildcard is for only 1 different characters

Example 5:  Using schema c##scott , write a query to display the
employee number, name, job , and salary of all employees whose name
start with 'M'.

    SELECT empno, ename, job, sal 
    FROM   emp
    WHERE  ename LIKE 'M%';

Example 6:  Using schema c##scott , write a query to display the
employee number, name, job , and salary of all employees whose name
ENDED with 'N'.

    SELECT empno, ename, job, sal 
    FROM   emp
    WHERE  ename LIKE '%N';


Example 7:  Using schema c##scott , write a query to display the
employee number, name, job , and salary of all employees whose name
contained the character 'A'

    SELECT empno, ename, job, sal 
    FROM   emp
    WHERE  ename LIKE '%A%';
-----------------------------
   IS NULL / IS NOT NULL operator
Example 8:  Using schema c##scott , write a query to display the
employee number, name, job ,  salary and commision  of all employees who earn a 
commission

    SELECT empno, ename, job, sal , comm
    FROM   emp
    WHERE comm IS NOT NULL;

Example 9:  Using schema c##scott , write a query to display the
employee number, name, job ,  salary and commision  of all employees 
who DO NOT earn any  commission

    SELECT empno, ename, job, sal , comm
    FROM   emp
    WHERE comm IS NULL;
-----------------------------------------------------------

   SELECT FROM multiple tables

   Syntax:   SELECT t1.column1, t1.column2, ...t2.column1, t2.column2,...
             FROM t1, t2, ...
             WHERE join condition
          [  AND  search condition ] ;

 n-1 law:  For a select of n tables, WE MUST HAVE n-1 join conditions
The cartesian product will be occured if the law is violated

   cartesian product = number of rows in one table multiply by the
                       number of rows of the others tables


  -- EQUI JOIN ----
Example 10:  Using schema c##scott , write a query to display the
employee number, name, job , department number, deparment name of all
employees (hint: the department name is in the table dept)


   SELECT empno, ename, job, emp.deptno, dept.deptno, dname
   FROM   emp, dept
   WHERE  emp.deptno = dept.deptno;
      

--------------- SELF JOIN
Example 11:  Using schema c##scott , write a query to display the
employee number, name, job , manager's number, manager's name of all
employees (hint: mgr is the id of the manager, USE SELF JOIN)


SELECT worker.empno, worker.ename, worker.job, worker.mgr, 
       manager.empno, manager.ename
FROM   emp worker , emp manager
WHERE  worker.mgr = manager.empno;

---------------- OUTER JOIN 

  INSERT INTO emp(empno, ename, sal, job)
  VALUES(8888,'Jacky Chan',1,'ACTOR');


Example 12:  Using schema c##scott , write a query to display the
employee number, name, job , manager's number, manager's name of all
employees INCLUDING the employees who have NO MANAGER  
(hint: mgr is the id of the manager, USE SELF JOIN and OUTER JOIN.
Put the outer join operator (+) on the missing side of data)


SELECT worker.empno, worker.ename, worker.job, worker.mgr, 
       manager.empno, manager.ename
FROM   emp worker , emp manager
WHERE  worker.mgr = manager.empno(+);



Example 13:  Using schema c##scott , write a query to display the
employee number, name, job , department number, deparment name of all
employees INCLUDING the department that has no employee working in 
it(hint: the department name is in the table dept, use outer join. Put
the outer join operator (+) on the missing side of data)

   SELECT empno, ename, job, emp.deptno, dept.deptno, dname
   FROM   emp, dept
   WHERE  emp.deptno (+)= dept.deptno;


Example 14:  Using schema c##scott , write a query to display the
employee number, name, job , department number, deparment name of all
employees INCLUDING the employee who work for NONE of the department
(hint: the department name is in the table dept, use outer join. Put
the outer join operator (+) on the missing side of data)

   SELECT empno, ename, job, emp.deptno, dept.deptno, dname
   FROM   emp, dept
   WHERE  emp.deptno = dept.deptno(+);



