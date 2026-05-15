CREATE TABLE Customer (
    Customer_ID NUMBER(10) PRIMARY KEY,
    First_name VARCHAR2(50) NOT NULL,
    Middle_Name VARCHAR2(50),
    Last_name VARCHAR2(50) NOT NULL,
    DOB DATE NOT NULL,
    Street VARCHAR2(100) NOT NULL,
    City VARCHAR2(50) NOT NULL,
    Governorate VARCHAR2(50) NOT NULL,
    National_ID CHAR(14) UNIQUE NOT NULL,
    Email VARCHAR2(100) UNIQUE NOT NULL,
    
    -- Built-in Auth Columns 
    Username VARCHAR2(32) DEFAULT 'TBD' UNIQUE NOT NULL,
    Password VARCHAR2(100) DEFAULT 'TBD' NOT NULL 
);


CREATE TABLE Branch (
    Branch_ID NUMBER(10) PRIMARY KEY,
    Branch_Name VARCHAR2(100) NOT NULL,
    Street VARCHAR2(100) NOT NULL,
    City VARCHAR2(50) NOT NULL,
    Governorate VARCHAR2(50) NOT NULL
);

CREATE TABLE Department (
    Dep_ID NUMBER(10) PRIMARY KEY,
    Dep_Name VARCHAR2(100) NOT NULL
);

CREATE TABLE Jobs (
    Job_ID NUMBER(10) PRIMARY KEY,
    Job_Title VARCHAR2(100) NOT NULL,
    Min_Salary NUMBER(10, 2) NOT NULL,
    Max_Salary NUMBER(10, 2) NOT NULL
);

CREATE TABLE Employees (
    Employee_ID NUMBER(10) PRIMARY KEY,
    First_Name VARCHAR2(50) NOT NULL,
    Middle_Name VARCHAR2(50),
    Last_Name VARCHAR2(50) NOT NULL,
    Salary NUMBER(10, 2) NOT NULL CHECK (Salary > 0),
    Email VARCHAR2(100) UNIQUE NOT NULL,
    Hire_Date DATE NOT NULL,
    USERNAME VARCHAR2(32) DEFAULT 'TBD' UNIQUE NOT NULL,
    PASSWORD VARCHAR2(32) DEFAULT 'TBD' NOT NULL,
    Branch_ID NUMBER(10) NOT NULL,
    Job_ID NUMBER(10) NOT NULL,
    Dep_ID NUMBER(10) NOT NULL,
    Supervisor_ID NUMBER(10),
    FOREIGN KEY (Branch_ID) REFERENCES Branch(Branch_ID),
    FOREIGN KEY (Job_ID) REFERENCES Jobs(Job_ID),
    FOREIGN KEY (Dep_ID) REFERENCES Department(Dep_ID),
    FOREIGN KEY (Supervisor_ID) REFERENCES Employees(Employee_ID) ON DELETE SET NULL
);

CREATE TABLE Account (
    Account_Number NUMBER(12) PRIMARY KEY,
    Account_Type VARCHAR2(20) NOT NULL CHECK (Account_Type IN ('Savings', 'Retail', 'Corporate', 'Student', 'Joint')),
    Balance NUMBER(15, 2) NOT NULL CHECK (Balance >= 0),
    Status VARCHAR2(20) NOT NULL CHECK (Status IN ('Active', 'Inactive', 'Closed')),
    Branch_ID NUMBER(10) NOT NULL,
    FOREIGN KEY (Branch_ID) REFERENCES Branch(Branch_ID)
);



CREATE TABLE Loan (
    Loan_ID NUMBER(10) PRIMARY KEY,
    Customer_ID NUMBER(10) NOT NULL,
    Loan_Amount NUMBER(15, 2) NOT NULL CHECK (Loan_Amount > 0),
    Interest_Rate NUMBER(5, 2) NOT NULL CHECK (Interest_Rate >= 0),
    Due_Date DATE NOT NULL,
    Status VARCHAR2(20) NOT NULL CHECK (Status IN ('Pending', 'Approved', 'Rejected', 'Paid', 'Overdue')),
    Loan_Term NUMBER(3, 0),
    Monthly_Payment NUMBER(15, 2),
    Total_Paid_Off NUMBER(15, 2) DEFAULT 0,
    Loan_State VARCHAR2(20) DEFAULT 'ACTIVE' CHECK (Loan_State IN ('ACTIVE', 'PAID')),
    Start_Date DATE DEFAULT SYSDATE,

    FOREIGN KEY (Customer_ID) REFERENCES Customer(Customer_ID)
);




CREATE TABLE Card (
    Card_ID NUMBER(10) PRIMARY KEY,
    Account_Number NUMBER(12) NOT NULL,
    Card_Type VARCHAR2(20) NOT NULL CHECK (Card_Type IN ('Debit', 'Credit', 'Prepaid')),
    Expiry_Date DATE NOT NULL,
    Issue_Date DATE NOT NULL,
    Card_Status VARCHAR2(20) NOT NULL CHECK (Card_Status IN ('Active', 'Expired', 'Blocked', 'Suspended')),
    Card_Limit NUMBER(15, 2),
    Card_Number CHAR(16) UNIQUE NOT NULL,
    CVV CHAR(3) NOT NULL,
    
    CONSTRAINT chk_card_type_limit CHECK (
        (Card_Type = 'Credit' AND Card_Limit IS NOT NULL) OR 
        (Card_Type IN ('Debit', 'Prepaid') AND Card_Limit IS NULL)
    ),
    
    FOREIGN KEY (Account_Number) REFERENCES Account(Account_Number)
);


CREATE TABLE Bank_Transaction (
    Transaction_ID NUMBER(12) PRIMARY KEY,
    Sender_Account_Number NUMBER(12),
    Receiver_Account_Number NUMBER(12),
    Amount NUMBER(15, 2) NOT NULL CHECK (Amount > 0),
    Transaction_Type VARCHAR2(10) NOT NULL CHECK (Transaction_Type IN('Deposit', 'Withdrawal', 'Transfer', 'Payment')),
    Transaction_Time TIMESTAMP NOT NULL,
    Status VARCHAR2(10) NOT NULL CHECK (Status IN ('Pending','Completed','Failed','Canceled')),
    
    CONSTRAINT chk_transaction_logic CHECK (
        (Transaction_Type = 'Deposit' AND Sender_Account_Number IS NULL) OR 
        (Transaction_Type = 'Withdrawal' AND Receiver_Account_Number IS NULL) OR 
        (Transaction_Type IN ('Transfer', 'Payment'))
    ),
    
    FOREIGN KEY (Sender_Account_Number) REFERENCES Account(Account_Number),
    FOREIGN KEY (Receiver_Account_Number) REFERENCES Account(Account_Number)
);


CREATE TABLE Dependants (
    Employee_ID NUMBER(10) NOT NULL,
    National_ID VARCHAR2(14) UNIQUE NOT NULL,
    First_Name VARCHAR2(50) NOT NULL,
    Relationship VARCHAR2(50) NOT NULL,
    Middle_Name VARCHAR2(50),
    Last_Name VARCHAR2(50) NOT NULL,
    PRIMARY KEY (Employee_ID, National_ID), 
    FOREIGN KEY (Employee_ID) REFERENCES Employees(Employee_ID) ON DELETE CASCADE
);

CREATE TABLE Customer_Phone (
    Customer_ID NUMBER(10) NOT NULL,
    Customer_Phone NUMBER(11) NOT NULL,
    PRIMARY KEY (Customer_ID, Customer_Phone),
    FOREIGN KEY (Customer_ID) REFERENCES Customer(Customer_ID) ON DELETE CASCADE
);

CREATE TABLE Employee_Phone (
    Employee_ID NUMBER(10) NOT NULL,
    Employee_Phone NUMBER(11) NOT NULL,
    PRIMARY KEY (Employee_ID, Employee_Phone),
    FOREIGN KEY (Employee_ID) REFERENCES Employees(Employee_ID) ON DELETE CASCADE
);

CREATE TABLE Customer_Account (
    Customer_ID NUMBER(10) NOT NULL,
    Account_Number NUMBER(12) NOT NULL,
    PRIMARY KEY (Customer_ID, Account_Number),
    FOREIGN KEY (Customer_ID) REFERENCES Customer(Customer_ID) ON DELETE CASCADE,
    FOREIGN KEY (Account_Number) REFERENCES Account(Account_Number) ON DELETE CASCADE
);

CREATE TABLE Department_Managers (
    Employee_ID NUMBER(10) NOT NULL,
    Dep_ID NUMBER(10) NOT NULL,
    PRIMARY KEY (Employee_ID, Dep_ID),
    FOREIGN KEY (Employee_ID) REFERENCES Employees(Employee_ID) ON DELETE CASCADE,
    FOREIGN KEY (Dep_ID) REFERENCES Department(Dep_ID) ON DELETE CASCADE
);