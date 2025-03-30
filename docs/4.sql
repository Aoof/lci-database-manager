--Menu du jour
 -- Review last lecture
 -- Add MORE CONSTRAINT
--BREAK
 -- You: continue with Project Part 4a
connect sys/sys as sysdba
SPOOL c:\DB1\f07_spool.txt
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
  -- example ADD column email of type VARCHAR2(50) to table member
ALTER TABLE member 
ADD (email VARCHAR2(50) );

 -- ---------------------------- UNIQUE CONSTRAINT  -----------
   -- Syntax:  ALTER TABLE name_of_table
   --          ADD CONSTRAINT name_of_constraint UNIQUE (name_of_column) ;

--  Modify table member by adding the UNIQUE constraint to make sure that each
--  member has a different email address.

  ALTER TABLE member
  ADD CONSTRAINT member_email_UK UNIQUE(email);

  -- testing for unique constraint
INSERT INTO member(mid, name, email)
VALUES(1, 'Ahmed', 'hotboy@gmail.com');

INSERT INTO member(mid, name, email)
VALUES(2, 'aBDULRAHMAN', 'hotboy@gmail.com');

--------------------------------------- CHECK CONSTRAINT -------------


 -- Syntax:    ALTER TABLE name_of_table
   --          ADD CONSTRAINT name_of_constraint CHECK (condition) ;

--  Modify table VIDEO by adding the CHECK constraint to make sure that 
-- the price of the video is a positive number

  ALTER TABLE video
  ADD CONSTRAINT video_price_CC CHECK (price >= 0) ;

-- testing for CHECK constraint
INSERT INTO video(vid, title,price)
VALUES(10, 'Jaw', 5.00);

---------------------------- NOT NULL CONSTRAINT ---------------
--    Syntax:  ALTER TABLE name_of_table
--      MODIFY (name_of_column DATATYPE CONSTRAINT name_of_constraint NOT NULL);

--  Modify table VIDEO by adding the NOT NULL constraint to make sure that 
-- every video has a title

  ALTER TABLE video
  MODIFY ( title CONSTRAINT video_title_NN NOT NULL);

  -- Testing for NOT NULL
INSERT INTO video(vid,price)
VALUES(20, 5.00);




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


-----------------  CREATE TABLE and THE 5 CONSTRAINT AT THE SAME TIME  -----
  -- Can you create the constraints of the previous example at table creation time?
  -- if yes, create a user named c##paola and all the tables and the constraints
  -- at the same time.

  connect sys/sys as sysdba
SELECT to_char(sysdate,'DD Month YYYY Year HH:MI:SS Am') FROM dual;
   -- remove user
  DROP USER c##paola CASCADE;
CREATE USER c##paola IDENTIFIED BY 1234;
GRANT connect, resource TO c##paola;
ALTER USER c##paola QUOTA 100M ON users;
connect c##paola/1234;
  -- PRIMARY KEY, UNIQUE can be at column, table level
CREATE TABLE member(MID NUMBER, name VARCHAR2(50), phone NUMBER, email VARCHAR2(50),
    CONSTRAINT member_mid_PK PRIMARY KEY (mid) ,
    CONSTRAINT member_email_UK UNIQUE(email)      ) ; 

  -- CHECK constraint  can be at column, table level
  -- BUT, NOT NULL contraint MUST BE AT COLUMN LEVEL  

CREATE TABLE video(VID NUMBER CONSTRAINT video_vid_PK PRIMARY KEY, 
         title VARCHAR2(50) CONSTRAINT video_title_NN NOT NULL, 
         price NUMBER  CONSTRAINT video_price_CC CHECK (price >= 0) ) ;

CREATE TABLE rental (MID NUMBER, VID NUMBER, date_rent DATE, date_return DATE ,
    CONSTRAINT rental_mid_vid_PK PRIMARY KEY (mid,vid),
    CONSTRAINT rental_mid_FK FOREIGN KEY(mid) REFERENCES  member(mid),
    CONSTRAINT rental_vid_FK FOREIGN KEY(vid) REFERENCES  video(vid)   );


--   SUMMARY 

   PRIMARY KEY   column, table level                    ALTER TABLE ... ADD CONSTRAINT
                 (composit PK MUST BE at table level)

   UNIQU         column, table level                    ALTER TABLE ... ADD CONSTRAINT

   CHECK         column, table level                    ALTER TABLE ... ADD CONSTRAINT

   NOT NULL      column level ONLY                      ALTER TABLE ... MODIFY

   FOREIGN KEY   table level ONLY                       ALTER TABLE ... ADD CONSTRAINT

