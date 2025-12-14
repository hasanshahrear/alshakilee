# Employee Management System - Quick Setup Guide

## ⚡ 5-Minute Setup

### Step 1: Google OAuth Setup

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URI: `http://localhost:5000/auth/google/callback`
6. Copy `Client ID` and `Client Secret`

### Step 2: Update Environment Variables

Add to `.env`:

```env
GOOGLE_CLIENT_ID="paste-your-client-id"
GOOGLE_CLIENT_SECRET="paste-your-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:5000/auth/google/callback"
FRONTEND_URL="http://localhost:3000"
```

### Step 3: Database Setup

```bash
# Run migrations
npx prisma migrate dev

# Seed initial data (creates employee types)
npm run prisma:seed
```

### Step 4: Start Application

```bash
npm run start:dev
```

## 🧪 Testing the System

### Test 1: Create Employee Type

```bash
# POST /employee/register (or use database directly)
curl -X POST http://localhost:5000/employee/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "employeeTypeId": 1,
    "profilePicture": "https://..."
  }'
```

### Test 2: View Pending Employees

```bash
# GET /employee/pending (requires JWT token)
curl -X GET http://localhost:5000/employee/pending \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 3: Approve Employee

```bash
# PUT /employee/1/approve
curl -X PUT http://localhost:5000/employee/1/approve \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Test 4: Login via Google

```
Navigate to: http://localhost:5000/auth/google
```

## 📊 Employee Lifecycle

```
┌─────────────────┐
│  Employee       │
│  Registers      │
│  via Gmail      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Status:        │
│  PENDING        │◄─── Waiting for admin review
└────────┬────────┘
         │
         ├─────────────────────┬─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
    ┌─────────┐           ┌─────────┐         ┌─────────────┐
    │APPROVED │           │REJECTED │         │  Admin      │
    │         │           │         │         │  Rejects    │
    │Can Login│           │Cannot   │         │             │
    └──┬──────┘           │Access   │         └─────────────┘
       │                  └─────────┘
       ▼
┌─────────────────────┐
│ Access System       │
│ (with JWT Token)    │
└─────────────────────┘
```

## 🔑 Key API Responses

### Pending Registration

```json
{
  "status": "PENDING_REGISTRATION",
  "message": "Employee registration required. Admin approval pending.",
  "access_token": null
}
```

### Approved Employee

```json
{
  "status": "APPROVED",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "employee@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "employeeType": "Designer"
  }
}
```

### Rejected Employee

```json
{
  "status": "REJECTED",
  "message": "Your account is rejected. Only approved employees can access the system.",
  "access_token": null
}
```

## 🛡️ JWT Usage in Requests

All protected endpoints require JWT token in Authorization header:

```bash
curl -X GET http://localhost:5000/employee \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 📁 Project Structure

```
src/
├── employee/
│   ├── dto/
│   │   ├── create-employee.dto.ts
│   │   └── update-employee.dto.ts
│   ├── employee.controller.ts
│   ├── employee.module.ts
│   └── employee.service.ts
├── auth/
│   ├── guards/
│   │   ├── employee-jwt-auth.guard.ts
│   │   ├── google-auth.guard.ts
│   │   └── jwt-auth.guard.ts
│   ├── strategies/
│   │   ├── google.strategy.ts
│   │   └── jwt.strategy.ts
│   ├── dto/
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   └── auth.service.ts
└── ...
```

## 🐛 Common Issues & Solutions

| Issue                                | Solution                                                     |
| ------------------------------------ | ------------------------------------------------------------ |
| "Google Strategy not found"          | Ensure GoogleStrategy is in AuthModule providers             |
| "Cannot find module google.strategy" | Check file paths are correct                                 |
| Employee not found                   | Register employee first via `/auth/employee/register-google` |
| Cannot approve pending               | Ensure you're using admin JWT token                          |
| JWT token expired                    | Re-login via Google OAuth                                    |

## 📚 Full Documentation

See these files for detailed information:

- `EMPLOYEE_SYSTEM.md` - Complete API documentation
- `EMPLOYEE_IMPLEMENTATION_SUMMARY.md` - What was built
- `prisma/schema.prisma` - Database schema

## 🎓 Next: Frontend Integration

Create a login page that:

1. Has "Login with Gmail" button
2. Redirects to `http://localhost:5000/auth/google`
3. Extracts token from callback URL
4. Stores token in localStorage
5. Uses token in all API requests

Example button:

```html
<a href="http://localhost:5000/auth/google" class="btn"> Login with Google </a>
```

Handle callback:

```javascript
const params = new URLSearchParams(window.location.search);
const token = params.get('token');
const status = params.get('status');

if (status === 'APPROVED') {
  localStorage.setItem('token', token);
  window.location.href = '/dashboard';
} else {
  alert(`Your status is: ${status}`);
}
```

## ✅ Checklist

- [ ] Google OAuth credentials created
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Employee types seeded
- [ ] Application starts without errors
- [ ] `/auth/google` endpoint accessible
- [ ] Can view pending employees
- [ ] Can approve/reject employees
- [ ] Approved employees can login
- [ ] JWT tokens work in requests

## 🚀 Ready to Deploy?

For production setup, see deployment guide in documentation.

**Questions?** Check `EMPLOYEE_SYSTEM.md` for comprehensive documentation!
