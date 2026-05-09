
INSERT INTO Customer (Customer_ID, First_name, Middle_Name, Last_name, DOB, Street, City, Governorate, National_ID, Email) 
VALUES (1, 'Ahmed', 'Ali', 'Hassan', DATE '1985-05-15', 'Tahrir St', 'Dokki', 'Giza', '28505152100123', 'ahmed.ali@email.com');
INSERT INTO Customer (Customer_ID, First_name, Middle_Name, Last_name, DOB, Street, City, Governorate, National_ID, Email) 
VALUES (2, 'Fatma', 'Mahmoud', 'Ibrahim', DATE '1992-11-20', 'Nile Corniche', 'Maadi', 'Cairo', '29211200100456', 'fatma.m@email.com');
INSERT INTO Customer (Customer_ID, First_name, Middle_Name, Last_name, DOB, Street, City, Governorate, National_ID, Email) 
VALUES (3, 'Omar', 'Tarek', 'Sayed', DATE '1978-02-10', 'Ramses St', 'Downtown', 'Cairo', '27802100100789', 'omar.t@email.com');

INSERT INTO Branch (Branch_ID, Branch_Name, Street, City, Governorate) 
VALUES (101, 'Giza Main Branch', 'Pyramids Road', 'Giza', 'Giza');
INSERT INTO Branch (Branch_ID, Branch_Name, Street, City, Governorate) 
VALUES (102, 'Downtown Branch', 'Talaat Harb', 'Cairo', 'Cairo');

INSERT INTO Department (Dep_ID, Dep_Name) VALUES (10, 'Retail Banking');
INSERT INTO Department (Dep_ID, Dep_Name) VALUES (20, 'IT Support');
INSERT INTO Department (Dep_ID, Dep_Name) VALUES (30, 'Human Resources');

INSERT INTO Jobs (Job_ID, Job_Title, Min_Salary, Max_Salary) VALUES (1, 'Branch Manager', 15000.00, 40000.00);
INSERT INTO Jobs (Job_ID, Job_Title, Min_Salary, Max_Salary) VALUES (2, 'Teller', 5000.00, 12000.00);
INSERT INTO Jobs (Job_ID, Job_Title, Min_Salary, Max_Salary) VALUES (3, 'IT Specialist', 8000.00, 25000.00);


INSERT INTO Employees (Employee_ID, First_Name, Middle_Name, Last_Name, Salary, Email, Hire_Date, Branch_ID, Job_ID, Dep_ID, Supervisor_ID) 
VALUES (1001, 'Mohamed', 'Sayed', 'Kamal', 30000.00, 'm.kamal@bank.com', DATE '2015-01-01', 101, 1, 10, NULL);
INSERT INTO Employees (Employee_ID, First_Name, Middle_Name, Last_Name, Salary, Email, Hire_Date, Branch_ID, Job_ID, Dep_ID, Supervisor_ID) 
VALUES (1003, 'Kareem', 'Hassan', 'Fouad', 15000.00, 'k.fouad@bank.com', DATE '2018-06-01', 102, 3, 20, NULL);


INSERT INTO Employees (Employee_ID, First_Name, Middle_Name, Last_Name, Salary, Email, Hire_Date, Branch_ID, Job_ID, Dep_ID, Supervisor_ID) 
VALUES (1002, 'Noha', 'Adel', 'Samir', 7000.00, 'n.adel@bank.com', DATE '2020-03-15', 101, 2, 10, 1001);


INSERT INTO Account (Account_Number, Account_Type, Balance, Status, Branch_ID) 
VALUES (10001, 'Savings', 50000.00, 'Active', 101);
INSERT INTO Account (Account_Number, Account_Type, Balance, Status, Branch_ID) 
VALUES (10002, 'Retail', 12000.50, 'Active', 101);
INSERT INTO Account (Account_Number, Account_Type, Balance, Status, Branch_ID) 
VALUES (10003, 'Savings', 250000.00, 'Active', 102);

INSERT INTO Loan (Loan_ID, Customer_ID, Loan_Amount, Interest_Rate, Due_Date, Status) 
VALUES (5001, 3, 100000.00, 12.50, DATE '2029-05-09', 'Approved');
INSERT INTO Loan (Loan_ID, Customer_ID, Loan_Amount, Interest_Rate, Due_Date, Status) 
VALUES (5002, 1, 50000.00, 10.00, DATE '2027-05-09', 'Approved');


INSERT INTO Card (Card_ID, Account_Number, Card_Type, Expiry_Date, Issue_Date, Card_Status, Card_Limit, Card_Number, CVV) 
VALUES (8001, 10002, 'Debit', DATE '2028-12-31', DATE '2024-01-01', 'Active', NULL, '4000123456789010', '123');
INSERT INTO Card (Card_ID, Account_Number, Card_Type, Expiry_Date, Issue_Date, Card_Status, Card_Limit, Card_Number, CVV) 
VALUES (8002, 10003, 'Credit', DATE '2027-10-31', DATE '2023-11-01', 'Active', 50000.00, '5000987654321090', '456');

INSERT INTO Bank_Transaction (Transaction_ID, Sender_Account_Number, Receiver_Account_Number, Amount, Transaction_Type, Transaction_Time, Status) 
VALUES (9001, 10002, NULL, 1500.00, 'Withdrawal', TIMESTAMP '2026-05-09 10:30:00', 'Completed');
INSERT INTO Bank_Transaction (Transaction_ID, Sender_Account_Number, Receiver_Account_Number, Amount, Transaction_Type, Transaction_Time, Status) 
VALUES (9002, NULL, 10001, 5000.00, 'Deposit', TIMESTAMP '2026-05-08 14:15:00', 'Completed');



INSERT INTO Dependents (Employee_ID, National_ID, First_Name, Relationship, Middle_Name, Last_Name) 
VALUES (1001, '12345678901234', 'Ali', 'Son', 'Mohamed', 'Kamal');

INSERT INTO Customer_Phone (Customer_ID, Customer_Phone) VALUES (1, 01012345678);
INSERT INTO Customer_Phone (Customer_ID, Customer_Phone) VALUES (1, 0233334444);

INSERT INTO Employee_Phone (Employee_ID, Employee_Phone) VALUES (1001, 01211112222);

INSERT INTO Customer_Account (Customer_ID, Account_Number) VALUES (1, 10001);
INSERT INTO Customer_Account (Customer_ID, Account_Number) VALUES (1, 10002);
INSERT INTO Customer_Account (Customer_ID, Account_Number) VALUES (2, 10003);

INSERT INTO Department_Managers (Employee_ID, Dep_ID) VALUES (1001, 10);

COMMIT;
