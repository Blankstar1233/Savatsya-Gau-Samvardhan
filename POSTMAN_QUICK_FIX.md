# Quick Fix for Postman 400 Bad Request Error

## The Problem
You're getting "400 Bad Request" with "Email and password are required" because the request body is not properly configured.

## Step-by-Step Solution

### 1. Set Request Method and URL
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/register`

### 2. Configure Headers
Click on the **Headers** tab and add:
- **Key**: `Content-Type`
- **Value**: `application/json`

### 3. Configure Request Body
1. Click on the **Body** tab
2. Select the **raw** radio button
3. From the dropdown (usually shows "Text"), select **JSON**
4. In the text area, paste this exact JSON:

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### 4. Send the Request
Click the **Send** button. You should now get a successful response:

```json
{
  "message": "Registered successfully"
}
```

## Common Mistakes to Avoid

❌ **Wrong**: Having empty body or using form-data
❌ **Wrong**: Missing Content-Type header
❌ **Wrong**: Selecting "Text" instead of "JSON" in body dropdown
❌ **Wrong**: Invalid JSON format (missing quotes, commas, etc.)

✅ **Correct**: Raw JSON body with proper Content-Type header

## Complete Working Example

Here's what your Postman request should look like:

**Headers:**
```
Content-Type: application/json
```

**Body (raw, JSON):**
```json
{
  "email": "user@example.com",
  "password": "mypassword123"
}
```

## Test Different Scenarios

### Valid Registration
```json
{
  "email": "newuser@test.com",
  "password": "securepass123"
}
```
**Expected**: 201 Created

### Missing Email (Test Error Handling)
```json
{
  "password": "securepass123"
}
```
**Expected**: 400 Bad Request - "Email and password are required"

### Missing Password (Test Error Handling)
```json
{
  "email": "test@example.com"
}
```
**Expected**: 400 Bad Request - "Email and password are required"

### Duplicate Email (Test Conflict)
Try registering with the same email twice.
**Expected**: 409 Conflict - "Email already in use"

## Next Steps After Registration

1. **Login** to get a JWT token:
   - URL: `POST http://localhost:5000/api/auth/login`
   - Same body format as registration
   - Save the token from response

2. **Test Protected Routes**:
   - Add `Authorization: Bearer YOUR_TOKEN` header
   - Test profile endpoints

## Troubleshooting

### Server Not Running
If you get connection errors:
1. Make sure backend server is running on port 5000
2. In terminal: `cd backend` then `npm run dev`
3. Look for "Server running on port 5000" message

### MongoDB Issues
If you get 500 Internal Server Error:
1. Check MongoDB connection in backend logs
2. Ensure MONGO_URI is set in backend/.env file

### Still Getting 400 Error
Double-check:
1. JSON format is valid (use JSON validator)
2. Content-Type header is set correctly
3. Request method is POST
4. URL is exactly: `http://localhost:5000/api/auth/register`

## Environment Setup (Optional)

Create a Postman Environment:
- **Variable**: `baseURL`
- **Value**: `http://localhost:5000`
- **Usage**: `{{baseURL}}/api/auth/register`

This makes it easier to switch between development and production URLs.