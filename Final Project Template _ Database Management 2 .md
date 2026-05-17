![][image1]

**School of Computer & Information Sciences**

**Project Documention**

*of*

**NAME OF MAIN SYSTEM**

*Submitted by:*  
**Firstname MI Lastname**  
**Firstname MI Lastname**  
**Firstname MI Lastname**  
**Firstname MI Lastname**

## **Table of Contents**

1. **Title Page ...................................... 1**  
2. **Table of Contents................................ 2**  
3. **Project Background .............................. 3**  
4. **Business Requirement............................. 4**  
5. **Development Team ................................ 5**  
6. **Data Model (ERD) ................................ 6**  
7. **Relational Model ................................ 7**  
8. **Data Dictionary ................................. 8**  
9. **Source Codes .................................... 9**  
10. **Pictorial Documentation ...................... 10**  
11. **Resume ....................................... 11**

**Project Background**

1. **Project Goal**  
   Provide a broad statement of what the database system intends to achieve for the organization.  
     
2. **Project Objective**  
   List specific, measurable outcomes (e.g., "To automate inventory tracking," "To reduce data redundancy by 40%").  
     
3. **Project Overview**  
   A brief description of the system, the problem it solves, and how it functions.  
     
4. **Target Audience**  
   Identify the end-users (e.g., Administrative Staff, Customers, System Managers).

5. **Functional Requirements**  
   List what the system must do (e.g., "The system shall allow users to generate monthly sales reports").  
     
6. **Non-Functional Requirements**  
   List system constraints (e.g., Security, Scalability, Performance, 24/7 Availability).  
   

## **Business Requirement**

*Describe the business rules and processes. Explain the logic governing how data is handled (e.g., "A customer can place multiple orders, but each order belongs to only one customer").*

## **Development Team**

| Team Member | Key Roles | Assigned Module/Transaction |
| :---- | :---- | :---- |
|  |  |  |
|  |  |  |
|  |  |  |

## 

## 

## 

## 

## 

## 

## 

## 

## 

## 

## 

## **Data Model (Entity-Relationship Diagram)**

*Identify first your Entities, Attributes, Relationship and Cardinalities and Modality.*

*Insert your ERD here using **Crow's Foot Notation**. (Tools like Draw.io are recommended).*

## ***Relational Model***

## ***Relational Schema***

*Example: STUDENT (StudentID, FirstName, LastName, DateOfBirth, \#CourseID)*

## ***Sample Tables***

*Insert tables with 5 rows of data for each entity.*

**Data Dictionary**

1. Student Information \= Student No \+ Full Name \+ Program \+ 

   Gender \+ Year Level

   1. Full Name \= Lastname \+ Firstname \+ \[Middlename\]  
      1. Lasname \= \[A-Z, a-z\]  
   2. Gender \= (“Male”, “Female”, “Prefer not to specify”)  
   3. Year Level \= \[1-5\]

    


2. 

   

 

		

## 

## 

## 

## 

## 

## 

## 

## 

## **Source Codes**

## **a. SQL Scripts (DDL)**

**\-- Create Database CREATE DATABASE \[ProjectName\]; \-- Example Table CREATE TABLE tbl\_Users ( UserID INT PRIMARY KEY, UserName VARCHAR(50) );**

#### **B. Database Implementation (Programmability)**

***Advanced logic implementation using Stored Procedures and Triggers.***

**i. Stored Procedures (Data Transactions)**   
**ii. Triggers (Automation/Audit)** 

#### **C. SQL Scripts (DML \- Data Manipulation Language)**

***Sample data to populate the tables for testing purposes.***

## **Pictorial Documentation**

*Attach screenshots of the database in action, UI wireframes, or photos of team meetings/collaboration sessions.*

## 

## 

## 

## 

## 

## 

## 

## 

## 

## 

## 

## 

## 

## 

## 

## 

## **Resume**

*Insert a brief professional resume (1 page max) for each team member, highlighting technical skills relevant to database management.*

[image1]: <data:image/png;base64,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>