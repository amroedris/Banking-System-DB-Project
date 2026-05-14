# MVC Architecture Structure

This document explains the new MVC (Model-View-Controller) architecture applied to the banking system.

## 📁 Directory Structure

```
banking-gui/server/
├── routes/           # Route definitions (URL endpoints)
├── controllers/      # Business logic and request handling
├── models/          # Database operations and queries
├── config/          # Configuration files
└── index.js         # Main server file (to be updated)
```

## 🗂️ Files Created

### Routes (10 files)
Routes define the API endpoints and map them to controller functions.

1. **routes/index.js** - Main router that combines all route modules
2. **routes/authRoutes.js** - Authentication routes (login, staff-login)
3. **routes/accountRoutes.js** - Account management routes
4. **routes/transactionRoutes.js** - Transaction and transfer routes
5. **routes/cardRoutes.js** - Card management routes
6. **routes/loanRoutes.js** - Loan application and payment routes
7. **routes/customerRoutes.js** - Customer profile management routes
8. **routes/adminRoutes.js** - Admin dashboard and approval routes
9. **routes/staffRoutes.js** - Staff operations routes
10. **routes/testRoutes.js** - Database connection test route

### Controllers (9 files)
Controllers handle the business logic and coordinate between routes and models.

1. **controllers/authController.js** - Authentication logic
2. **controllers/accountController.js** - Account operations
3. **controllers/transactionController.js** - Transaction processing
4. **controllers/cardController.js** - Card management
5. **controllers/loanController.js** - Loan operations
6. **controllers/customerController.js** - Customer profile operations
7. **controllers/adminController.js** - Admin operations
8. **controllers/staffController.js** - Staff operations
9. **controllers/testController.js** - Database testing

### Models (8 files)
Models handle all database operations and queries.

1. **models/authModel.js** - Authentication queries
2. **models/accountModel.js** - Account database operations
3. **models/transactionModel.js** - Transaction database operations
4. **models/cardModel.js** - Card database operations
5. **models/loanModel.js** - Loan database operations
6. **models/customerModel.js** - Customer database operations
7. **models/adminModel.js** - Admin database operations
8. **models/staffModel.js** - Staff database operations

## 🔄 How It Works

### Request Flow:
```
Client Request → Route → Controller → Model → Database
                  ↓         ↓          ↓
Client Response ← Route ← Controller ← Model ← Database
```

### Example: Customer Login
1. **Route** (`authRoutes.js`): `POST /login` → calls `authController.customerLogin`
2. **Controller** (`authController.js`): Validates request, calls `authModel.authenticateCustomer`
3. **Model** (`authModel.js`): Executes database query, returns user data
4. **Controller**: Formats response and sends back to client

## 📋 API Endpoints Summary

### Authentication
- `POST /login` - Customer login
- `POST /staff-login` - Staff login

### Accounts
- `GET /accounts/:customerId` - Get customer accounts
- `GET /account-details/:accountNumber` - Get account details

### Transactions
- `POST /transfer` - Transfer money
- `GET /recent-transactions/:customerId` - Get recent transactions
- `GET /transactions/:accountNumber` - Get transaction history

### Cards
- `GET /cards/:customerId` - Get customer cards
- `POST /cards/status` - Update card status

### Loans
- `GET /loans/:customerId` - Get customer loans
- `POST /loans/apply` - Apply for loan
- `POST /loans/pay` - Make loan payment

### Customer Profile
- `GET /customer/:customerId` - Get customer info
- `PUT /customer/:customerId` - Update customer info
- `PUT /customer-password/:customerId` - Update password

### Admin
- `GET /admin/stats` - Get dashboard stats
- `GET /admin/activity` - Get recent activity
- `GET /approvals` - Get pending approvals
- `PUT /approvals/:loanId` - Approve/reject loan

### Staff
- `GET /staff/customers` - Get all customers
- `GET /staff/customer/:id` - Get customer details
- `PUT /staff/customer/:id/freeze` - Freeze customer accounts
- `PUT /staff/account/:accountNumber/freeze` - Freeze specific account

### Testing
- `GET /test` - Test database connection

## ✅ Benefits of MVC Architecture

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Maintainability**: Easier to find and fix bugs
3. **Scalability**: Easy to add new features
4. **Reusability**: Models can be reused across different controllers
5. **Testability**: Each component can be tested independently
6. **Readability**: Code is organized and easier to understand

## 🚀 Next Steps

To use this new structure, you need to update `index.js` to use the new routes:

```javascript
// Replace all the individual route handlers with:
const routes = require('./routes');
app.use('/', routes);
```

This will connect all the MVC components together!

## 📝 Notes

- The original `index.js` file has NOT been modified yet
- All business logic has been extracted from routes
- All database queries have been extracted into models
- Error handling is preserved in all layers
- Transaction management (commit/rollback) is handled in models
