-- ==========================================
-- MINIMAL DATA FOR TESTING
-- ==========================================

-- 1. INDEPENDENT TABLES (no foreign keys)

-- Branches
INSERT INTO Branch (Branch_ID, Branch_Name, Street, City, Governorate)
VALUES (101, 'Giza Main Branch', 'Pyramids Road', 'Giza', 'Giza');

INSERT INTO Branch (Branch_ID, Branch_Name, Street, City, Governorate)
VALUES (102, 'Downtown Branch', 'Talaat Harb', 'Cairo', 'Cairo');

-- Departments
INSERT INTO Department (Dep_ID, Dep_Name) VALUES (10, 'Retail Banking');
INSERT INTO Department (Dep_ID, Dep_Name) VALUES (20, 'IT Support');

-- Jobs (with prefixed titles to tie them to departments)
-- RB_ prefix = Retail Banking (Dep_ID 10), IT_ prefix = IT Support (Dep_ID 20)
INSERT INTO Jobs (Job_ID, Job_Title, Min_Salary, Max_Salary) VALUES (1, 'RB_Department_Manager', 12000.00, 35000.00);
INSERT INTO Jobs (Job_ID, Job_Title, Min_Salary, Max_Salary) VALUES (2, 'RB_Teller', 5000.00, 12000.00);
INSERT INTO Jobs (Job_ID, Job_Title, Min_Salary, Max_Salary) VALUES (3, 'IT_System_Administrator', 20000.00, 50000.00);
INSERT INTO Jobs (Job_ID, Job_Title, Min_Salary, Max_Salary) VALUES (4, 'RB_Branch_Manager', 15000.00, 45000.00);

-- Customers
INSERT INTO Customer (Customer_ID, First_name, Middle_Name, Last_name, DOB, Street, City, Governorate, National_ID, Email, Username, Password)
VALUES (1, 'Ahmed', 'Ali', 'Hassan', TO_DATE('1985-05-15', 'YYYY-MM-DD'), 'Tahrir St', 'Dokki', 'Giza', '28505152100123', 'ahmed@email.com', 'ahmed_hassan', '123');

INSERT INTO Customer (Customer_ID, First_name, Middle_Name, Last_name, DOB, Street, City, Governorate, National_ID, Email, Username, Password)
VALUES (2, 'Fatma', 'Mahmoud', 'Ibrahim', TO_DATE('1992-11-20', 'YYYY-MM-DD'), 'Nile Corniche', 'Maadi', 'Cairo', '29211200100456', 'fatma@email.com', 'fatma_ibrahim', '123');

INSERT INTO Customer (Customer_ID, First_name, Middle_Name, Last_name, DOB, Street, City, Governorate, National_ID, Email, Username, Password)
VALUES (3, 'Omar', 'Tarek', 'Sayed', TO_DATE('1978-02-10', 'YYYY-MM-DD'), 'Ramses St', 'Downtown', 'Cairo', '27802100100789', 'omar@email.com', 'omar_sayed', '123');

INSERT INTO Customer (Customer_ID, First_name, Middle_Name, Last_name, DOB, Street, City, Governorate, National_ID, Email, Username, Password)
VALUES (7, 'Amr', 'Customer', 'Edris', TO_DATE('2000-01-01', 'YYYY-MM-DD'), 'Academy St', 'New Cairo', 'Cairo', '30001010100777', 'amr@email.com', 'amr_customer', '123');

-- 2. EMPLOYEES (depends on Branch, Jobs, Department)

-- RB_Department_Manager (JOB_ID=1) - oversees tellers and reports to Branch Manager
INSERT INTO Employees (Employee_ID, First_Name, Middle_Name, Last_Name, Salary, Email, Hire_Date, Branch_ID, Job_ID, Dep_ID, Supervisor_ID, Username, Password)
VALUES (1001, 'Mohamed', 'Sayed', 'Kamal', 25000.00, 'm.kamal@bank.com', TO_DATE('2015-01-01', 'YYYY-MM-DD'), 101, 1, 10, NULL, 'mkamal', '123');

-- RB_Teller (JOB_ID=2) - reports to department manager
INSERT INTO Employees (Employee_ID, First_Name, Middle_Name, Last_Name, Salary, Email, Hire_Date, Branch_ID, Job_ID, Dep_ID, Supervisor_ID, Username, Password)
VALUES (1002, 'Noha', 'Adel', 'Samir', 7000.00, 'n.adel@bank.com', TO_DATE('2020-03-15', 'YYYY-MM-DD'), 101, 2, 10, 1001, 'nsamir', '123');

-- IT_System_Administrator (JOB_ID=3) - super admin / god view
INSERT INTO Employees (Employee_ID, First_Name, Middle_Name, Last_Name, Salary, Email, Hire_Date, Branch_ID, Job_ID, Dep_ID, Supervisor_ID, Username, Password)
VALUES (777, 'Amr', 'Admin', 'Edris', 45000.00, 'amr.admin@bank.com', TO_DATE('2026-01-01', 'YYYY-MM-DD'), 101, 3, 20, NULL, 'amr_admin', '123');

-- RB_Branch_Manager (JOB_ID=4) - branch-level scope manager
INSERT INTO Employees (Employee_ID, First_Name, Middle_Name, Last_Name, Salary, Email, Hire_Date, Branch_ID, Job_ID, Dep_ID, Supervisor_ID, Username, Password)
VALUES (1003, 'Heba', 'Tarek', 'Fouad', 35000.00, 'h.fouad@bank.com', TO_DATE('2018-06-01', 'YYYY-MM-DD'), 101, 4, 10, NULL, 'hfouad', '123');

INSERT INTO Employees (Employee_ID, First_Name, Middle_Name, Last_Name, Salary, Email, Hire_Date, Branch_ID, Job_ID, Dep_ID, Supervisor_ID, Username, Password)
VALUES (1004, 'joe', 'Tarek', 'Fouad', 35000.00, 'j.fouad@bank.com', TO_DATE('2018-06-01', 'YYYY-MM-DD'), 102, 4, 10, NULL, 'jfouad', '123');


-- 3. ACCOUNTS (depends on Branch)

INSERT INTO Account (Account_Number, Account_Type, Balance, Status, Branch_ID) 
VALUES (0, 'Corporate', 10000000.00, 'Active', 101);

INSERT INTO Account (Account_Number, Account_Type, Balance, Status, Branch_ID)
VALUES (10001, 'Savings', 50000.00, 'Active', 101);

INSERT INTO Account (Account_Number, Account_Type, Balance, Status, Branch_ID)
VALUES (10002, 'Retail', 12000.50, 'Active', 101);

INSERT INTO Account (Account_Number, Account_Type, Balance, Status, Branch_ID)
VALUES (10003, 'Savings', 250000.00, 'Active', 102);

INSERT INTO Account (Account_Number, Account_Type, Balance, Status, Branch_ID)
VALUES (70001, 'Savings', 50000.00, 'Active', 101);

-- 4. CUSTOMER_ACCOUNT (depends on Customer, Account)

INSERT INTO Customer_Account (Customer_ID, Account_Number) VALUES (1, 10001);
INSERT INTO Customer_Account (Customer_ID, Account_Number) VALUES (1, 10002);
INSERT INTO Customer_Account (Customer_ID, Account_Number) VALUES (2, 10003);
INSERT INTO Customer_Account (Customer_ID, Account_Number) VALUES (7, 70001);

-- 5. CARDS (depends on Account)

INSERT INTO Card (Card_ID, Account_Number, Card_Type, Expiry_Date, Issue_Date, Card_Status, Card_Limit, Card_Number, CVV)
VALUES (8001, 10002, 'Debit', TO_DATE('2028-12-31', 'YYYY-MM-DD'), TO_DATE('2024-01-01', 'YYYY-MM-DD'), 'Active', NULL, '4000123456789010', '123');

INSERT INTO Card (Card_ID, Account_Number, Card_Type, Expiry_Date, Issue_Date, Card_Status, Card_Limit, Card_Number, CVV)
VALUES (8002, 10003, 'Credit', TO_DATE('2027-10-31', 'YYYY-MM-DD'), TO_DATE('2023-11-01', 'YYYY-MM-DD'), 'Active', 50000.00, '5000987654321090', '456');

-- 6. BANK_TRANSACTION (depends on Account)

INSERT INTO Bank_Transaction (Transaction_ID, Sender_Account_Number, Receiver_Account_Number, Amount, Transaction_Type, Transaction_Time, Status)
VALUES (9001, 10002, NULL, 1500.00, 'Withdrawal', SYSDATE, 'Completed');

INSERT INTO Bank_Transaction (Transaction_ID, Sender_Account_Number, Receiver_Account_Number, Amount, Transaction_Type, Transaction_Time, Status)
VALUES (9002, NULL, 10001, 5000.00, 'Deposit', SYSDATE, 'Completed');

-- 7. LOANS (depends on Customer)

INSERT INTO Loan (Loan_ID, Customer_ID, Loan_Amount, Interest_Rate, Due_Date, Status, Loan_Term, Monthly_Payment, Total_Paid_Off, Loan_State, Start_Date)
VALUES (5001, 3, 100000.00, 12.50, TO_DATE('2029-05-09', 'YYYY-MM-DD'), 'Approved', 48, 2500.00, 0, 'ACTIVE', SYSDATE);

INSERT INTO Loan (Loan_ID, Customer_ID, Loan_Amount, Interest_Rate, Due_Date, Status, Loan_Term, Monthly_Payment, Total_Paid_Off, Loan_State, Start_Date)
VALUES (5002, 1, 50000.00, 10.00, TO_DATE('2027-05-09', 'YYYY-MM-DD'), 'Approved', 24, 2200.00, 0, 'ACTIVE', SYSDATE);

-- 8. DEPARTMENT_MANAGERS (depends on Employees, Department)

INSERT INTO Department_Managers (Employee_ID, Dep_ID) VALUES (1001, 10);
INSERT INTO Department_Managers (Employee_ID, Dep_Id) VALUES (777, 10);
