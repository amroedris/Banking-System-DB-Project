# MVC Architecture Implementation

## Overview

This document explains the refactoring of `index.js` by extracting backend logic into a proper **Model-View-Controller (MVC)** architecture. The original `index.js` contained all route definitions, business logic, and database queries inline — making it monolithic and hard to maintain.

## Changes Made

### 1. `index.js` — Minimized to Entry Point Only

**Before:** Contained all route definitions (24 routes), business logic, and database queries inline (~700+ lines).

**After:** Reduced to a clean entry point that:
- Sets up Express middleware (CORS, JSON parsing)
- Imports and mounts the centralized routes module
- Initializes the database and starts the server

### 2. New MVC Structure Created

```
server/
├── config/
│   └── db.js              # Database connection configuration
├── routes/
│   ├── index.js            # Central router — imports all route modules
│   ├── testRoutes.js       # /test
│   ├── authRoutes.js       # /login, /staff-login
│   ├── accountRoutes.js    # /accounts/:customerId, /account-details/:accountNumber
│   ├── transactionRoutes.js # /transfer, /recent-transactions/:customerId, /transactions/:accountNumber
│   ├── cardRoutes.js       # /cards/:customerId, /cards/status
│   ├── loanRoutes.js       # /loans/:customerId, /loans/apply, /loans/pay
│   ├── customerRoutes.js   # /customer/:customerId (GET/PUT), /customer-password/:customerId
│   ├── adminRoutes.js      # /admin/stats, /admin/activity, /approvals, /approvals/:loanId
│   └── staffRoutes.js      # /staff/customer/:id, /staff/customers, freeze endpoints
├── controllers/
│   ├── testController.js     # Database connection test
│   ├── authController.js     # Customer & staff login
│   ├── accountController.js  # Account queries
│   ├── transactionController.js # Transfers & transaction history
│   ├── cardController.js     # Card queries & status updates
│   ├── loanController.js     # Loan queries, applications & payments
│   ├── customerController.js # Customer info & password updates
│   ├── adminController.js    # Dashboard stats, activity, loan approvals
│   └── staffController.js    # Customer/account management for staff
└── models/
    ├── authModel.js         # Auth DB queries
    ├── accountModel.js      # Account DB queries
    ├── transactionModel.js  # Transfer & transaction DB queries
    ├── cardModel.js         # Card DB queries
    ├── loanModel.js         # Loan DB queries
    ├── customerModel.js     # Customer DB queries
    ├── adminModel.js        # Admin dashboard DB queries
    └── staffModel.js        # Staff management DB queries
```

## Route Mapping (Original → MVC)

| HTTP Method | Path | Controller | Model |
|---|---|---|---|
| GET | `/test` | `testController.testConnection` | Direct oracledb |
| POST | `/login` | `authController.customerLogin` | `authModel.authenticateCustomer` |
| POST | `/staff-login` | `authController.staffLogin` | `authModel.authenticateStaff` |
| GET | `/accounts/:customerId` | `accountController.getCustomerAccounts` | `accountModel.getAccountsByCustomerId` |
| GET | `/account-details/:accountNumber` | `accountController.getAccountDetails` | `accountModel.getAccountByNumber` |
| POST | `/transfer` | `transactionController.transfer` | `accountModel.getAccountByNumber` + `transactionModel.performTransfer` |
| GET | `/recent-transactions/:customerId` | `transactionController.getRecentTransactions` | `transactionModel.getRecentTransactionsByCustomerId` |
| GET | `/transactions/:accountNumber` | `transactionController.getTransactionHistory` | `transactionModel.getTransactionsByAccountNumber` |
| GET | `/cards/:customerId` | `cardController.getCustomerCards` | `cardModel.getCardsByCustomerId` |
| POST | `/cards/status` | `cardController.updateCardStatus` | `cardModel.getCardStatus` + `cardModel.updateCardStatus` |
| GET | `/loans/:customerId` | `loanController.getCustomerLoans` | `loanModel.getLoansByCustomerId` |
| POST | `/loans/apply` | `loanController.applyForLoan` | `loanModel.createLoan` |
| POST | `/loans/pay` | `loanController.makeLoanPayment` | `accountModel.getAccountByNumber` + `loanModel.getLoanById` + `loanModel.processLoanPayment` |
| GET | `/customer/:customerId` | `customerController.getCustomerInfo` | `customerModel.getCustomerById` |
| PUT | `/customer/:customerId` | `customerController.updateCustomerInfo` | `customerModel.isPhoneDuplicate` + `customerModel.updateCustomer` |
| PUT | `/customer-password/:customerId` | `customerController.updateCustomerPassword` | `customerModel.verifyPassword` + `customerModel.updatePassword` |
| GET | `/admin/stats` | `adminController.getStats` | `adminModel.getDashboardStats` |
| GET | `/admin/activity` | `adminController.getRecentActivity` | `adminModel.getRecentActivity` |
| GET | `/approvals` | `adminController.getPendingApprovals` | `adminModel.getPendingLoanApprovals` |
| PUT | `/approvals/:loanId` | `adminController.updateLoanApproval` | `adminModel.updateLoanStatus` |
| GET | `/staff/customer/:id` | `staffController.getCustomerDetails` | `staffModel.getCustomerFullDetails` |
| GET | `/staff/customers` | `staffController.getAllCustomers` | `staffModel.getAllCustomers` |
| PUT | `/staff/customer/:id/freeze` | `staffController.freezeCustomerAccounts` | `staffModel.updateCustomerAccountsStatus` |
| PUT | `/staff/account/:accountNumber/freeze` | `staffController.freezeAccount` | `staffModel.updateAccountStatus` |

## Architecture Benefits

- **Separation of Concerns:** Routes define endpoints, controllers handle business logic, models handle database operations
- **Maintainability:** Each component is isolated in its own file, making changes safer and easier
- **Reusability:** Models and controllers can be reused across multiple routes
- **Testability:** Each layer can be tested independently
- **Scalability:** New features can be added by creating new route/controller/model files without touching the entry point

## Request Flow

```
Client Request → index.js → routes/index.js → Route Module → Controller → Model → Database
                                                                                         ↓
Client Response ← index.js ← routes/index.js ← Route Module ← Controller ← Model ← Database
```
