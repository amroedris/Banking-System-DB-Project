CREATE TABLE Customer (
    Customer_ID NUMBER(10) PRIMARY KEY NOT NULL,
    First_name VARCHAR2(50) NOT NULL,
    Middle_Name VARCHAR2(50),
    Last_name VARCHAR2(50) NOT NULL,
    DOB DATE NOT NULL,
    Street VARCHAR2(100) NOT NULL,
    City VARCHAR2(50) NOT NULL,
    Governorate VARCHAR2(50) NOT NULL,
    National_ID CHAR(14) UNIQUE NOT NULL,
    Email VARCHAR2(100) UNIQUE NOT NULL
);


CREATE TABLE Branch (
    Branch_ID INT PRIMARY KEY NOT NULL,
    Branch_Name VARCHAR(100) NOT NULL,
    Street VARCHAR(100) NOT NULL,
    City VARCHAR(50) NOT NULL,
    Governorate VARCHAR(50)NOT NULL
);

CREATE TABLE Department (
    Dep_ID INT PRIMARY KEY NOT NULL,
    Dep_Name VARCHAR(100)NOT NULL
);

CREATE TABLE Jobs (
    Job_ID INT PRIMARY KEY NOT NULL,
    Job_Title VARCHAR(100) NOT NULL,
    Min_Salary DECIMAL(10, 2) NOT NULL,
    Max_Salary DECIMAL(10, 2)NOT NULL
);

CREATE TABLE Employees (
    Employee_ID Number(10) PRIMARY KEY NOT NULL,
    First_Name VARCHAR2(50) NOT NULL,
    Middle_Name VARCHAR2(50),
    Last_Name VARCHAR2(50) NOT NULL,
    Salary DECIMAL(10, 2) NOT NULL CHECK (Salary > 0),
    Email VARCHAR(100) UNIQUE NOT NULL,
    Hire_Date DATE NOT NULL,
    Branch_ID INT NOT NULL,
    Job_ID INT NOT NULL,
    Dep_ID INT NOT NULL,
    Supervisor_ID INT,
    FOREIGN KEY (Branch_ID) REFERENCES Branch(Branch_ID),
    FOREIGN KEY (Job_ID) REFERENCES Jobs(Job_ID),
    FOREIGN KEY (Dep_ID) REFERENCES Department(Dep_ID),
    FOREIGN KEY (Supervisor_ID) REFERENCES Employees(Employee_ID) ON DELETE SET NULL
);

CREATE TABLE Account (
    Account_Number NUMBER(12) PRIMARY KEY NOT NULL,
    Account_Type VARCHAR2(20) NOT NULL CHECK (Account_Type IN ('Savings', 'Retail', 'Corporate', 'Student', 'Joint')),
    Balance DECIMAL(15, 2) NOT NULL CHECK (Balance >= 0),
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('Active', 'Inactive', 'Closed')),
    Branch_ID INT NOT NULL,
    FOREIGN KEY (Branch_ID) REFERENCES Branch(Branch_ID)
);



CREATE TABLE Loan (
    Loan_ID NUMBER(10) PRIMARY KEY NOT NULL,
    Customer_ID INT NOT NULL, 
    Loan_Amount DECIMAL(15, 2) NOT NULL,
    Interest_Rate DECIMAL(5, 2) NOT NULL,
    Due_Date DATE NOT NULL,
    CHECK (Loan_Amount > 0),
    CHECK (Interest_Rate >= 0),
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('Pending', 'Approved', 'Rejected', 'Paid', 'Overdue')),
    
    FOREIGN KEY (Customer_ID) REFERENCES Customer(Customer_ID)
);



CREATE TABLE Card (
    Card_ID NUMBER(10) PRIMARY KEY NOT NULL,
    Account_Number INT NOT NULL,
    Card_Type VARCHAR(20) NOT NULL CHECK (Card_Type IN ('Debit', 'Credit', 'Prepaid')),
    Expiry_Date DATE NOT NULL,
    Issue_Date DATE NOT NULL,
    Card_Status VARCHAR(20)  NOT NULL CHECK (Card_Status IN ('Active', 'Expired', 'Blocked', 'Suspended')),
    Card_Limit DECIMAL(15, 2) CHECK ((Card_Type = 'Credit' AND Card_Limit IS NOT NULL) OR (Card_Type IN ('Debit','Prepaid') AND Card_Limit IS NULL)),
    Card_Number CHAR(16) UNIQUE  NOT NULL,
    CVV CHAR(3) NOT NULL,
    
    FOREIGN KEY (Account_Number) REFERENCES Account(Account_Number)
);

CREATE TABLE Bank_Transaction (
    Transaction_ID NUMBER(12) PRIMARY KEY NOT NULL,
    Sender_Account_Number NUMBER(12) NULL,
    Receiver_Account_Number NUMBER(12) NULL,
    Amount DECIMAL(15, 2) NOT NULL CHECK (Amount > 0),
    Transaction_Type VARCHAR(10) NOT NULL CHECK (Transaction_Type IN('Deposit', 'Withdrawal', 'Transfer', 'Payment')),
    Transaction_Time TIMESTAMP NOT NULL,
    Status VARCHAR(10) NOT NULL CHECK (Status IN ('Pending','Completed','Failed','Canceled')),
    
    CHECK (
    (Transaction_Type = 'Deposit' AND Sender_Account_Number IS NULL)
 OR (Transaction_Type = 'Withdrawal' AND Receiver_Account_Number IS NULL)
 OR (Transaction_Type = 'Transfer') OR (Transaction_Type = 'Payment')
),
    
    FOREIGN KEY (Sender_Account_Number) REFERENCES Account(Account_Number),
    FOREIGN KEY (Receiver_Account_Number) REFERENCES Account(Account_Number)
);


CREATE TABLE Dependants (
    Employee_ID INT  NOT NULL,
    National_ID VARCHAR(14) UNIQUE  NOT NULL,
    First_Name VARCHAR(50) NOT NULL,
    Relationship VARCHAR(50) NOT NULL,
    Middle_Name VARCHAR(50),
    Last_Name VARCHAR(50) NOT NULL,
    PRIMARY KEY (Employee_ID, National_ID), 
    FOREIGN KEY (Employee_ID) REFERENCES Employees(Employee_ID) ON DELETE CASCADE
);

CREATE TABLE Customer_Phone (
    Customer_ID INT  NOT NULL,
    Customer_Phone NUMBER(11)  NOT NULL,
    PRIMARY KEY (Customer_ID, Customer_Phone),
    FOREIGN KEY (Customer_ID) REFERENCES Customer(Customer_ID) ON DELETE CASCADE
);

CREATE TABLE Employee_Phone (
    Employee_ID INT NOT NULL,
    Employee_Phone NUMBER(11) NOT NULL,
    PRIMARY KEY (Employee_ID, Employee_Phone),
    FOREIGN KEY (Employee_ID) REFERENCES Employees(Employee_ID) ON DELETE CASCADE
);

CREATE TABLE Customer_Account (
    Customer_ID INT  NOT NULL,
    Account_Number INT  NOT NULL,
    PRIMARY KEY (Customer_ID, Account_Number),
    FOREIGN KEY (Customer_ID) REFERENCES Customer(Customer_ID) ON DELETE CASCADE,
    FOREIGN KEY (Account_Number) REFERENCES Account(Account_Number)ON DELETE CASCADE
);

CREATE TABLE Department_Managers (
    Employee_ID INT  NOT NULL,
    Dep_ID INT NOT NULL,
    PRIMARY KEY (Employee_ID, Dep_ID),
    FOREIGN KEY (Employee_ID) REFERENCES Employees(Employee_ID) ON DELETE CASCADE,
    FOREIGN KEY (Dep_ID) REFERENCES Department(Dep_ID) ON DELETE CASCADE
);