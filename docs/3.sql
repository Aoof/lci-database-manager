connect sys/sys as sysdba
SPOOL c:\DB1\j31_spool.txt
SELECT to_char(sysdate,'DD Month YYYY Year HH:MI:SS Am') FROM dual;
   -- remove user
  DROP USER c##sofia CASCADE;
CREATE USER c##sofia IDENTIFIED BY 1234;
GRANT connect, resource TO c##sofia;
ALTER USER c##sofia QUOTA 100M ON users;
connect c##sofia/1234;
  -- Example 1: create the tables of the final design below:
  --    MEMBER(MID, name, phone)
  --    VIDEO (VID, title, price)
  --    RENTAL(MID,VID, date_rent, date_return)
  -- Note: the attributes in UPPER CASE are the Primary Key
  --  Using the E.R.D below to add the FOREIGN KEY to the table created

       --   MEMBER    ---E     RENTAL   3---  VIDEO  

  -- create table member
CREATE TABLE member(MID NUMBER, name VARCHAR2(50), phone NUMBER ) ; 
CREATE TABLE video(VID NUMBER, title VARCHAR2(50), price NUMBER ) ;
CREATE TABLE rental(MID NUMBER, VID NUMBER, date_rent DATE, 
                         date_return DATE) ;

  --  syntax to add column to existing table:
  --  ALTER TABLE name_of_table
  --  ADD (name_of_column_datatype) ;
  -- example ADD column GENDER of type CHAR(1) to table member
ALTER TABLE member 
ADD (gender CHAR(1));

   --  syntax to remove a column from a table:
  --  ALTER TABLE name_of_table
  --  DROP COLUMN name_of_column ;
  -- example REMOVE column PHONE from table member
ALTER TABLE member 
DROP COLUMN phone;




SELECT table_name FROM user_tables;
DESC member
DESC video
DESC RENTAL 

  -- add primary key to existing table
  -- syntax:   ALTER TABLE  name_of_table
  --           ADD CONSTRAINT name_of_constraint PRIMARY KEY (name_of_column) ;

  -- add PK to table member
ALTER TABLE member
ADD CONSTRAINT member_mid_PK PRIMARY KEY (mid) ;

 






-- add PK to table video
ALTER TABLE video
ADD CONSTRAINT video_vid_PK PRIMARY KEY (vid) ;
-- add PK to table rental
ALTER TABLE rental
ADD CONSTRAINT rental_mid_vid_PK PRIMARY KEY (mid,vid) ;


  -- add FOREIGN KEY to exiting tables
  -- syntax:  ALTER name_of_table
  --          ADD CONSTRAINT name_of_constraint FOREIGN KEY (name_of_column)
  --          REFERENCES name_of_parent_table (unique_column) ;

  -- add foreign key mid to table rental
ALTER TABLE rental
ADD CONSTRAINT rental_mid_FK FOREIGN KEY(mid)
REFERENCES  member(mid);

-- add foreign key vid to table rental
ALTER TABLE rental
ADD CONSTRAINT rental_vid_FK FOREIGN KEY(vid)
REFERENCES  video(vid);

  -- insert a video
INSERT INTO video(vid, title)
VALUES(10, 'Jaw');





-- display constraint's info
SELECT constraint_name, constraint_type, table_name FROM user_constraints;

------------------------------------ CREATION TABLE AND KEYs AT THE SAME TIME

  -- Example 2: create a new user named c##puja and create all tables of the model of example 1 
  -- with the key created at table creation time

  -- syntax of column level:
  -- CREATE TABLE name_of_table (column1 DATATYPE CONSTRAINT name_of_constraint PRIMARY KEY, 
  --                               column2 DATATYPE, ... );

  -- connect to DBA user
connect sys/sys as sysdba
DROP USER c##puja CASCADE;
CREATE USER c##puja IDENTIFIED BY 1234;
GRANT connect, resource TO c##puja;
ALTER USER c##puja QUOTA 100M ON users;
connect c##puja/1234;

CREATE TABLE member(MID NUMBER CONSTRAINT member_mid_PK PRIMARY KEY , name VARCHAR2(40),
                                    phone NUMBER);
CREATE TABLE video(VID NUMBER CONSTRAINT video_vid_PK PRIMARY KEY , title VARCHAR2(40),
                                    price NUMBER);


  -- composite  primary key, and FOREIGN KEY must be at TABLE LEVEL
  -- syntax of TABLE level:
  -- CREATE TABLE name_of_table (column1 DATATYPE, column2 DATATYPE, ... ,
  --     CONSTRAINT name_of_constraint PRIMARY KEY (name_of_column, ...),
  --     CONSTRAINT name_of_constraint FOREIGN KEY (name_of_column)
  --     REFERENCES name_of_parent_table (unique_column)       );

  -- create table rental with PK and FK at table level:

CREATE TABLE rental (MID NUMBER, VID NUMBER, date_rent DATE, date_return DATE ,
    CONSTRAINT rental_mid_vid_PK PRIMARY KEY (mid,vid),
    CONSTRAINT rental_mid_FK FOREIGN KEY(mid) REFERENCES  member(mid),
    CONSTRAINT rental_vid_FK FOREIGN KEY(vid) REFERENCES  video(vid)   );

-- display constraint's info
SELECT constraint_name, constraint_type, table_name FROM user_constraints;


SPOOL OFF;
