# Savatsya Gau Samvardhan - API Testing Guide for Postman

## Overview
This guide provides step-by-step instructions for testing all API endpoints using Postman. The backend server runs on `http://localhost:5000` by default.

## Prerequisites
1. Start the backend server: `cd backend && npm run dev`
2. Ensure MongoDB is connected
3. Have Postman installed
4. Set base URL as environment variable in Postman

## Postman Environment Setup

Create a new environment in Postman with these variables:
- `baseURL`: `http://localhost:5000`
- `token`: `{{token}}` (will be set after login)

---

## 🔐 Authentication Endpoints

### 1. Health Check
**Purpose**: Verify server is running
- **Method**: `GET`
- **URL**: `{{baseURL}}/api/health`
- **Headers**: None required
- **Expected Response**: 
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 2. User Registration
**Purpose**: Create a new user account
- **Method**: `POST`
- **URL**: `{{baseURL}}/api/auth/register`
- **Headers**: 
  - `Content-Type: application/json`
- **Body (raw JSON)**:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
- **Expected Response (201)**:
```json
{
  "message": "Registered successfully"
}
```
- **Error Cases**:
  - 400: Missing email/password
  - 409: Email already exists

### 3. User Login
**Purpose**: Authenticate user and get JWT token
- **Method**: `POST`
- **URL**: `{{baseURL}}/api/auth/login`
- **Headers**: 
  - `Content-Type: application/json`
- **Body (raw JSON)**:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
- **Expected Response (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "test@example.com",
  "userId": "507f1f77bcf86cd799439011",
  "isAdmin": false
}
```
- **Post-Response Script** (save token):
```javascript
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
    const response = pm.response.json();
    pm.environment.set("token", response.token);
    pm.environment.set("userId", response.userId);
});
```

### 4. Get Current User (Auth Route)
**Purpose**: Get user info using token
- **Method**: `GET`
- **URL**: `{{baseURL}}/api/auth/me`
- **Headers**: 
  - `Authorization: Bearer {{token}}`
- **Expected Response (200)**:
```json
{
  "email": "test@example.com",
  "userId": "507f1f77bcf86cd799439011",
  "address": [],
  "preferences": {}
}
```

---

## 👤 User Profile Endpoints

### 5. Get User Profile (Detailed)
**Purpose**: Get complete user profile with all fields
- **Method**: `GET`
- **URL**: `{{baseURL}}/api/user/me`
- **Headers**: 
  - `Authorization: Bearer {{token}}`
- **Expected Response (200)**:
```json
{
  "email": "test@example.com",
  "userId": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "phone": "+1234567890",
  "profilePicture": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
  "address": [],
  "preferences": {},
  "uiConfig": {}
}
```

### 6. Update User Profile
**Purpose**: Update basic profile information
- **Method**: `PUT`
- **URL**: `{{baseURL}}/api/user/profile`
- **Headers**: 
  - `Authorization: Bearer {{token}`
  - `Content-Type: application/json`
- **Body (raw JSON)**:
```json
{
  "name": "John Doe Updated",
  "phone": "+1234567890",
  "email": "newemail@example.com",
  "profilePicture": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
}
```
- **Expected Response (200)**:
```json
{
  "ok": true,
  "user": {
    "name": "John Doe Updated",
    "email": "newemail@example.com",
    "phone": "+1234567890",
    "profilePicture": "data:image/jpeg;base64,..."
  }
}
```

### 7. Update User Preferences
**Purpose**: Update theme, language, and UI preferences
- **Method**: `PUT`
- **URL**: `{{baseURL}}/api/user/preferences`
- **Headers**: 
  - `Authorization: Bearer {{token}}`
  - `Content-Type: application/json`
- **Body (raw JSON)**:
```json
{
  "preferences": {
    "language": "hi",
    "currency": "INR",
    "region": "IN"
  },
  "uiConfig": {
    "theme": "dark",
    "colorScheme": "blue",
    "fontSize": "medium",
    "animations": true,
    "highContrast": false
  }
}
```
- **Expected Response (200)**:
```json
{
  "ok": true
}
```

---

## 🏠 Address Management Endpoints

### 8. Add New Address
**Purpose**: Add a new address to user profile
- **Method**: `POST`
- **URL**: `{{baseURL}}/api/user/addresses`
- **Headers**: 
  - `Authorization: Bearer {{token}}`
  - `Content-Type: application/json`
- **Body (raw JSON)**:
```json
{
  "type": "home",
  "name": "John Doe",
  "street": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "country": "India",
  "phone": "+1234567890",
  "isDefault": true
}
```
- **Expected Response (201)**:
```json
{
  "ok": true
}
```

### 9. Update Address
**Purpose**: Update existing address
- **Method**: `PUT`
- **URL**: `{{baseURL}}/api/user/addresses/{{addressId}}`
- **Headers**: 
  - `Authorization: Bearer {{token}}`
  - `Content-Type: application/json`
- **Body (raw JSON)**:
```json
{
  "street": "456 Updated St",
  "city": "Delhi",
  "isDefault": false
}
```
- **Expected Response (200)**:
```json
{
  "ok": true
}
```

### 10. Delete Address
**Purpose**: Remove an address
- **Method**: `DELETE`
- **URL**: `{{baseURL}}/api/user/addresses/{{addressId}}`
- **Headers**: 
  - `Authorization: Bearer {{token}}`
- **Expected Response (200)**:
```json
{
  "ok": true
}
```

---

## 🔒 Security Endpoints

### 11. Change Password
**Purpose**: Update user password
- **Method**: `PUT`
- **URL**: `{{baseURL}}/api/user/change-password`
- **Headers**: 
  - `Authorization: Bearer {{token}}`
  - `Content-Type: application/json`
- **Body (raw JSON)**:
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```
- **Expected Response (200)**:
```json
{
  "ok": true,
  "message": "Password changed successfully",
  "passwordChangedAt": "2025-01-15T10:30:00.000Z"
}
```
- **Error Cases**:
  - 400: Current password incorrect
  - 400: New password too short

### 12. Enable Two-Factor Authentication
**Purpose**: Enable 2FA for user account
- **Method**: `PUT`
- **URL**: `{{baseURL}}/api/user/two-factor`
- **Headers**: 
  - `Authorization: Bearer {{token}}`
  - `Content-Type: application/json`
- **Body (raw JSON)**:
```json
{
  "enable": true,
  "method": "email"
}
```
- **Expected Response (200)**:
```json
{
  "ok": true,
  "message": "Two-factor authentication enabled",
  "backupCodes": ["ABC123", "DEF456", "GHI789"],
  "method": "email"
}
```

### 13. Disable Two-Factor Authentication
**Purpose**: Disable 2FA for user account
- **Method**: `PUT`
- **URL**: `{{baseURL}}/api/user/two-factor`
- **Headers**: 
  - `Authorization: Bearer {{token}}`
  - `Content-Type: application/json`
- **Body (raw JSON)**:
```json
{
  "enable": false
}
```
- **Expected Response (200)**:
```json
{
  "ok": true,
  "message": "Two-factor authentication disabled"
}
```

### 14. Download User Data (GDPR)
**Purpose**: Export all user data
- **Method**: `GET`
- **URL**: `{{baseURL}}/api/user/download-data`
- **Headers**: 
  - `Authorization: Bearer {{token}}`
- **Expected Response (200)**: 
  - File download with user's complete data in JSON format
  - Filename: `my-data-{email}-{date}.json`

### 15. Schedule Account Deletion
**Purpose**: Schedule account for deletion (soft delete)
- **Method**: `DELETE`
- **URL**: `{{baseURL}}/api/user/account`
- **Headers**: 
  - `Authorization: Bearer {{token}}`
  - `Content-Type: application/json`
- **Body (raw JSON)**:
```json
{
  "password": "userpassword123",
  "confirmation": "DELETE"
}
```
- **Expected Response (200)**:
```json
{
  "ok": true,
  "message": "Account deletion scheduled",
  "deletionDate": "2025-02-15T10:30:00.000Z",
  "gracePeriodDays": 30
}
```

### 16. Cancel Account Deletion
**Purpose**: Cancel scheduled account deletion
- **Method**: `POST`
- **URL**: `{{baseURL}}/api/user/cancel-deletion`
- **Headers**: 
  - `Authorization: Bearer {{token}}`
- **Expected Response (200)**:
```json
{
  "ok": true,
  "message": "Account deletion cancelled successfully"
}
```

---

## 🛍️ Order Management Endpoints

### 17. Get User Orders
**Purpose**: Fetch all orders for current user
- **Method**: `GET`
- **URL**: `{{baseURL}}/api/orders`
- **Headers**: 
  - `Authorization: Bearer {{token}}`
- **Expected Response (200)**:
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439010",
    "items": [
      {
        "productId": "prod1",
        "name": "Organic Ghee",
        "quantity": 2,
        "price": 500
      }
    ],
    "total": 1000,
    "status": "pending",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
]
```

### 18. Create New Order
**Purpose**: Place a new order
- **Method**: `POST`
- **URL**: `{{baseURL}}/api/orders`
- **Headers**: 
  - `Authorization: Bearer {{token}}`
  - `Content-Type: application/json`
- **Body (raw JSON)**:
```json
{
  "items": [
    {
      "productId": "prod1",
      "name": "Organic Ghee",
      "quantity": 1,
      "price": 500
    },
    {
      "productId": "prod2", 
      "name": "Incense Sticks",
      "quantity": 3,
      "price": 100
    }
  ],
  "total": 800
}
```
- **Expected Response (201)**:
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439010",
  "items": [...],
  "total": 800,
  "status": "pending",
  "createdAt": "2025-01-15T10:30:00.000Z"
}
```

### 19. Get All Orders (Admin Only)
**Purpose**: Fetch all orders (admin endpoint)
- **Method**: `GET`
- **URL**: `{{baseURL}}/api/orders/all`
- **Headers**: 
  - `Authorization: Bearer {{token}}`
- **Note**: Requires admin privileges
- **Expected Response (200)**: Array of all orders
- **Error Response (403)**: 
```json
{
  "error": "Admin access required"
}
```

---

## 📧 Newsletter Endpoints

### 20. Subscribe to Newsletter
**Purpose**: Subscribe email to newsletter
- **Method**: `POST`
- **URL**: `{{baseURL}}/api/newsletter/subscribe`
- **Headers**: 
  - `Content-Type: application/json`
- **Body (raw JSON)**:
```json
{
  "email": "subscriber@example.com"
}
```
- **Expected Response (201)**:
```json
{
  "ok": true,
  "emailEnabled": true,
  "email": {
    "sent": true,
    "details": {
      "ok": true,
      "messageId": "msg123"
    }
  }
}
```
- **If already subscribed (200)**:
```json
{
  "ok": true,
  "message": "Already subscribed"
}
```

---

## 🧪 Testing Workflows

### Workflow 1: Complete User Registration & Profile Setup
1. Health Check → Register → Login → Get Profile → Update Profile
2. Add Address → Update Preferences → Enable 2FA

### Workflow 2: Security Testing
1. Login → Change Password → Enable 2FA → Download Data → Schedule Deletion → Cancel Deletion

### Workflow 3: E-commerce Flow  
1. Login → Get Profile → Create Order → Get Orders → Subscribe Newsletter

### Workflow 4: Error Testing
1. Test with invalid tokens
2. Test with missing required fields
3. Test duplicate registrations
4. Test invalid passwords

---

## 🔧 Common Issues & Troubleshooting

### Authentication Issues
- **401 Unauthorized**: Check if token is correctly set in headers
- **Token expired**: Login again to get new token

### Server Issues
- **500 Internal Server Error**: Check backend logs and MongoDB connection
- **404 Not Found**: Verify endpoint URLs and HTTP methods

### Data Issues
- **400 Bad Request**: Check request body format and required fields
- **409 Conflict**: Resource already exists (e.g., duplicate email)

---

## 📋 Postman Collection Import

You can create a Postman collection with all these endpoints. Here's a sample collection structure:

```json
{
  "info": {
    "name": "Savatsya Gau Samvardhan API",
    "description": "Complete API testing collection"
  },
  "variable": [
    {
      "key": "baseURL",
      "value": "http://localhost:5000"
    }
  ]
}
```

**Pro Tips**:
1. Use environment variables for base URL and tokens
2. Set up test scripts to automatically save tokens and IDs
3. Create test suites for different scenarios
4. Use pre-request scripts for data setup
5. Monitor response times and status codes

This guide covers all available endpoints in your Savatsya Gau Samvardhan project. Make sure the backend server is running before testing any endpoints!