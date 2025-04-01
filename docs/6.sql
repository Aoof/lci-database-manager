Menu du jour
  DDL = Data Definition Language
         CREATE , ...
  DML = Data Manipulation Language
           INSERT, UPDATE, DELETE
a/ INSERT
     Syntax:  INSERT INTO name_of_table (column1, column2, ....)
              VALUES (value1, value2, ...)  ;

Example 1:  Using the schema c##scott, insert department 50 named
  'Marketing' located in the city of 'MONTREAL'.

  INSERT INTO dept(loc,deptno, dname)
  VALUES          ('MONTREAL',50,'Marketing');

   IF we have all the values of all the columns, WE don't have to
mention the column's name. BUT we have to respect the order of
the column when we provide the values in the insert statement.

Example 2:  Using the schema c##scott, insert department 52 named
  'Informatique' located in the city of 'Laval'.

  INSERT INTO dept
  VALUES (52,'Informatique','Laval');

    





  DCL = Data Control Language
           ROLLBACK   = Cancel all DML back to the last COMMIT
         

     INSERT INTO dept
  VALUES (53,'Cooking','Ottawa');


    , SAVEPOINT... ,

   Explicit COMMIT
   Implicit COMMIT :  When ever we have a DDL, there will be an
   Implicit commitl.


-----------------------------   UPDATE  ----------------
  Syntax:  UPDATE name_of_table
           SET   column1 = value1,  column2 = value2
          [ WHERE condition ]  ;

  If there is NO WHERE clause, all rows will be updated

Example 3: Move department 52 to the city of 'Toronto' and change
the name to 'Computer'.

  UPDATE dept
  SET dname = 'Computer' , loc = 'Toronto'
  WHERE deptno = 52;

  ----------------------------- DELETE -------------------
 Syntax:  DELETE FROM name_of_table
          [ WHERE condition ]  ;

  If there is NO WHERE clause, all rows will be deleted

Example 3: Remove department 52!!!!!!!!!!!

     DELETE FROM dept
     WHERE deptno = 52;

---------------------------------------- SEQUENCE ---------------
-- SEQUENCE is an ORACLE's object used to generate values for the PK
-- and the FK

   -- Syntax: CREATE SEQUENCE name_of_sequence
              [ START WITH 
                INCREMENT BY
                CACHE SIZE
                MINVALUE / MAXVALUE
                CYCLE / NOCYCLE
                  ... ]     ;
  By default:  Sequence start with number 1, nocycle, nomax, nomin,
               increment by 1, cache size is 20.

  Example 4: Create sequence EX_4_SEQ with all the default value.

     CREATE SEQUENCE EX_4_SEQ ;

Example 5: Create sequence EX_5_SEQ that start with number 100 ,
   increment by 5.

     CREATE SEQUENCE EX_5_SEQ START WITH 100 INCREMENT BY 5 ;

Example 6: Create sequence EX_5_SEQ that start with number 100 ,
   increment by 5, and cache size equal ZERO.

     CREATE SEQUENCE EX_6_SEQ START WITH 100 INCREMENT BY 5 NOCACHE;

----------- Use sequence in SQL*Plus  ---------
  .NEXTVAL for new value
  .CURRVAL for  current value
   SELECT EX_4_SEQ.NEXTVAL FROM dual ;
   SELECT EX_5_SEQ.NEXTVAL FROM dual ;
   SELECT EX_6_SEQ.NEXTVAL FROM dual ;

    SELECT EX_5_SEQ.currval FROM dual;

------------------ SEQUENCE 's info
  SELECT sequence_name, increment_by, cache_size, last_number
  FROM   user_sequences;

  ALL option of the sequence can be modified EXCEPT the option START WITH
Example 7: Modify sequence EX_6_SEQ so that it is incremented by 3
instead of increment by 5

  ALTER SEQUENCE EX_6_SEQ INCREMENT BY 3;

  DQL = Data Query Language
           SELECT , ...
------------------------------  USE sequence in AN INSERT ----

  Example 8: Create a sequence named dept_sequence that starts with
number 52, increment by 2 used to insert a new department, create
another sequence named emp_sequence that starts with 7935 increment by
1 used to insert a new employee. Then insert 2 new department with
3 new employees working in EACH department with all the PKs and FKs
number generated AUTOMATICALLY using the 2 sequences just create.
  (hint:  Use .nextval for the PKs, AND .currval for the Foreign key 's value)

CREATE SEQUENCE dept_sequence START WITH 52 INCREMENT BY 2;
CREATE SEQUENCE emp_sequence START WITH 7935;



 INSERT INTO dept(deptno, dname)
 VALUES (dept_sequence.NEXTVAL, 'Department X' );
   INSERT INTO emp(empno, ename, job, deptno)
   VALUES(emp_sequence.NEXTVAL,'Employee 1','job 1', dept_sequence.CURRVAL);
   INSERT INTO emp(empno, ename, job, deptno)
   VALUES(emp_sequence.NEXTVAL,'Employee 2','job 2', dept_sequence.CURRVAL);
   INSERT INTO emp(empno, ename, job, deptno)
   VALUES(emp_sequence.NEXTVAL,'Employee 3','job 3', dept_sequence.CURRVAL);

INSERT INTO dept(deptno, dname)
 VALUES (dept_sequence.NEXTVAL, 'Department Y' );
   INSERT INTO emp(empno, ename, job, deptno)
   VALUES(emp_sequence.NEXTVAL,'Employee 4','job 4', dept_sequence.CURRVAL);
   INSERT INTO emp(empno, ename, job, deptno)
   VALUES(emp_sequence.NEXTVAL,'Employee 5','job 5', dept_sequence.CURRVAL);
   INSERT INTO emp(empno, ename, job, deptno)
   VALUES(emp_sequence.NEXTVAL,'Employee 6','job 6', dept_sequence.CURRVAL);
