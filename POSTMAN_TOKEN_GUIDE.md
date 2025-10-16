# Postman Token Management Guide

## Auto-Save Token After Login

Add this script to your Login request's **Tests** tab in Postman:

```javascript
pm.test("Login successful and save token", function () {
    pm.response.to.have.status(200);
    
    const response = pm.response.json();
    
    if (response.token) {
        // Save token to environment variable
        pm.environment.set("authToken", response.token);
        pm.environment.set("userEmail", response.email);
        pm.environment.set("userId", response.userId);
        
        console.log("Token saved:", response.token.substring(0, 20) + "...");
    }
});
```

## Using Saved Token in Other Requests

For any authenticated endpoint (like `/api/auth/me`), add this header:
- **Key**: `Authorization`
- **Value**: `Bearer {{authToken}}`

## Complete Workflow

### 1. Login Request
- **Method**: `POST`
- **URL**: `{{baseURL}}/api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "email": "newuser@example.com",
  "password": "123456"
}
```
- **Tests Script**: (Add the script above)

### 2. Get Current User Request  
- **Method**: `GET`
- **URL**: `{{baseURL}}/api/auth/me`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Body**: None

## Environment Variables Setup

Create these environment variables in Postman:
- `baseURL`: `http://localhost:5000`
- `authToken`: (will be set automatically after login)
- `userEmail`: (will be set automatically after login)
- `userId`: (will be set automatically after login)

## Testing Sequence

1. **Health Check**: `GET {{baseURL}}/api/health`
2. **Register**: `POST {{baseURL}}/api/auth/register`
3. **Login**: `POST {{baseURL}}/api/auth/login` (saves token)
4. **Get User**: `GET {{baseURL}}/api/auth/me` (uses saved token)
5. **Update Profile**: `PUT {{baseURL}}/api/user/profile` (uses saved token)

This way you don't have to manually copy/paste tokens between requests!