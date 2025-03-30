  -- Enter user-name   : sys/sys as sysdba
connect sys/sys as sysdba
  -- syntax to create SPOOL file:
  --   SPOOL disk:\existing_folder\new_file_name.txt
SPOOL c:\ahmed\j24_ahmed_spool.txt
  -- display the current time
SELECT to_char(sysdate,'DD MM YYYY Day Month Year HH:MI:SS Am') FROM dual;
  -- syntax to remove a user
  --  DROP USER name_of_user CASCADE;
DROP USER c##ahmed CASCADE;
   
  -- syntax to create a new user
  --   CREATE USER c##_name_of_user IDENTIFIED BY password ;
CREATE USER c##ahmed IDENTIFIED BY 1234;
  -- syntax to provide needed privileges
  -- GRANT connect, resource TO name_of_user ;
GRANT connect, resource TO c##ahmed ;
  -- to connect to a normal user after the SQL prompt 
  --  syntax to connect a normal user: CONNECT user_name/password
connect c##ahmed/1234
  --  syntax to create table
  --  CREATE TABLE name_of_table (column1 DATATYPE, column2 DATATYPE, ...) ;
  --  Example 1: Create the tables of the final design below using datatype
  -- NUMBER for IDs, VARCHAR2 for texts, and DATE for dates

   --   STUDENT (SID, sname, birthdate)
   --   COURSE (CID, cname, credit)
CREATE TABLE student (sid NUMBER, sname VARCHAR2(50), birthdate DATE) ;
CREATE TABLE course (cid NUMBER, cname VARCHAR2(50), credit NUMBER) ;
  -- to display the name of all tables belonged to the current user do:
SELECT table_name FROM user_tables;
  -- syntax to display the structure/definition of a table
  --  DESCRIBE name_of_table OR  DESC name_of_table
DESC student
DESC course

   --  to save the SPOOL file do:
SPOOL OFF;


