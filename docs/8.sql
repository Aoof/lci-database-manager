GROUP FUNCTION
COUNT(*)
  Ex1: Using the schema c##scott, write a query to display the number of rows of table
  emp (hint: use group function COUNT(*) )

  connect c##scott/tiger
   SELECT COUNT(*) FROM emp;
COUNT(name_of_column) use to find the number of row that contain a value in a particular column

  Ex2: Using the schema c##scott, write a query to display the number of employees
       who earn a comm (hint: use function COUNT(name_of_column) )
  sol: SELECT COUNT(comm) FROM emp;

  MAX(name_of_column)/MIN(name_of_column)/AVG(name_of_column)/SUM(name_of_column)
   Return the Maximum/Minimum/Average/Sum of all values of a column

   Ex3: Using the schema c##scott, write a query to display the highest/Lowest/
        Average, and the sum of the salary of all employees

  sol: SELECT MAX(sal),MIN(sal), AVG(sal), SUM(sal)
       FROM   emp;

    Ex4: Using the schema c##scott, write a query to display the highest/Lowest/
        Average, and the sum of the salary of all employees of EACH department

  sol: SELECT deptno, MAX(sal),MIN(sal), AVG(sal), SUM(sal)
       FROM   emp
       GROUP BY deptno;

Ex5: Using the schema c##scott, write a query to display the highest/Lowest/
        Average, and the sum of the salary of all employees of EACH job

  sol: SELECT job, MAX(sal),MIN(sal), AVG(sal), SUM(sal)
       FROM   emp
       GROUP BY job;

Ex6: Using the schema c##scott, write a query to display the highest/Lowest/
        Average, and the sum of the salary of all employees of EACH department
       EXCEPT the job President

  sol: SELECT deptno, MAX(sal),MIN(sal), AVG(sal), SUM(sal)
       FROM   emp
       WHERE job <> 'PRESIDENT'
       GROUP BY deptno;


Ex7: Using the schema c##scott, write a query to display the highest/Lowest/
        Average, and the sum of the salary of all employees EXCEPT the job President
        of EACH department which has the minimum salary greater than 900
        

  sol: SELECT deptno, MAX(sal),MIN(sal), AVG(sal), SUM(sal)
       FROM   emp
       WHERE job <> 'PRESIDENT' 
       GROUP BY deptno
       HAVING MIN(sal) > 900;

Lab 9
Question 1
Use script 7clearwater (Traiding Company),working with table inventory of database CLEARWATER, 
display the
sum of quantity on hand, minimum price, maximum price of each item having
the sum of quantity on hand greater than 200 of all the inventories with size L,
M.

Question 2

Using database NORTHWOODS (script 7northwoods), create SQL command to find the
birthdate of the youngest and oldest student. Named the column â€œYoungestâ€ and
â€œOldestâ€ respectively.


