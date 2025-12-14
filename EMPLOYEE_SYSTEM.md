# Employee Management & Gmail OAuth System

## Overview

This system provides a complete employee management workflow with Gmail OAuth integration. Only approved employees can access the system.

## Features

- ✅ Employee registration via Gmail OAuth
- ✅ Admin approval workflow (Pending → Approved/Rejected)
- ✅ Employee Type assignment
- ✅ JWT-based authentication for approved employees only
- ✅ No password setup required for employees
- ✅ Status tracking (PENDING, APPROVED, REJECTED)

## Database Models

### Employee

- `id`: Auto-incremented primary key
- `email`: Unique employee email
- `firstName`: Employee first name (optional)
- `lastName`: Employee last name (optional)
- `googleId`: Google OAuth ID (optional)
- `profilePicture`: Google profile picture URL (optional)
- `employeeTypeId`: Foreign key to EmployeeType
- `status`: PENDING | APPROVED | REJECTED
- `isActive`: Boolean flag for account activation
- `approvedBy`: Email of admin who approved
- `approvedAt`: Timestamp of approval
- `rejectionReason`: Reason for rejection (if rejected)
- `createdAt`, `updatedAt`: Timestamps

### EmployeeType

- `id`: Auto-incremented primary key
- `name`: Type name (e.g., "Designer", "Tailor", "Manager")

### EmployeeStatus Enum

- `PENDING`: Awaiting admin approval
- `APPROVED`: Account approved, can access system
- `REJECTED`: Account rejected by admin

## API Endpoints

### Public Endpoints (No Authentication Required)

#### 1. Google OAuth Login

```
GET /auth/google
```

Initiates Google OAuth flow. Browser will be redirected to Google login.

#### 2. Google OAuth Callback

```
GET /auth/google/callback
```

Google redirects here after authentication. Returns JWT token if approved.

Response format:

```json
{
  "status": "APPROVED" | "PENDING_REGISTRATION" | "NOT_FOUND" | "PENDING" | "REJECTED",
  "access_token": "JWT token (null if not approved)",
  "message": "Status message",
  "user": {
    "id": 1,
    "email": "employee@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "employeeType": "Designer"
  }
}
```

#### 3. Register Employee via Google

```
POST /auth/employee/register-google
```

Request body:

```json
{
  "email": "employee@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "employeeTypeId": 1,
  "profilePicture": "https://...",
  "googleId": "google_id"
}
```

### Protected Endpoints (Requires JWT Token from Approved Employee)

#### 1. Get All Employees

```
GET /employee
Query parameters:
  - status: PENDING | APPROVED | REJECTED
  - isActive: true | false
```

#### 2. Get Pending Employees

```
GET /employee/pending
```

#### 3. Get Employee by ID

```
GET /employee/:id
```

#### 4. Update Employee

```
PUT /employee/:id
```

Request body:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "status": "APPROVED",
  "isActive": true,
  "rejectionReason": "Reason if rejecting"
}
```

#### 5. Approve Employee

```
PUT /employee/:id/approve
```

#### 6. Reject Employee

```
PUT /employee/:id/reject
```

Request body:

```json
{
  "rejectionReason": "Does not meet requirements"
}
```

#### 7. Delete Employee

```
DELETE /employee/:id
```

## Setup Instructions

### 1. Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:

   - `http://localhost:5000/auth/google/callback` (development)
   - `https://yourdomain.com/auth/google/callback` (production)

6. Copy Client ID and Client Secret

### 2. Environment Variables

Create `.env` file with:

```env
DATABASE_URL="mysql://user:password@localhost:3306/alshakilee_erp"
PORT=5000
JWT_SECRET="your-very-secret-key-here"
JWT_EXPIRATION="24h"
NODE_ENV="development"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id-here"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
GOOGLE_CALLBACK_URL="http://localhost:5000/auth/google/callback"
FRONTEND_URL="http://localhost:3000"
```

### 3. Create Employee Types

```bash
# Create via database directly or through a seed script
INSERT INTO EmployeeType (name) VALUES
('Designer'),
('Tailor'),
('Manager'),
('Quality Checker');
```

## Authentication Flow

### Employee Registration & Login Flow

```
1. Employee clicks "Login with Google"
   ↓
2. Google OAuth callback
   ↓
3. System checks if employee exists
   ├─ New employee → Register as PENDING, return status message
   └─ Existing employee → Check approval status
       ├─ APPROVED → Return JWT token
       ├─ PENDING → Return waiting message
       └─ REJECTED → Return rejection message
   ↓
4. Only APPROVED employees receive JWT token
   ↓
5. JWT token used in Authorization header: "Bearer <token>"
```

### Admin Approval Workflow

```
1. Employee submits registration
   ↓
2. Admin views pending employees (GET /employee/pending)
   ↓
3. Admin assigns employee type and approves/rejects
   ├─ Approve: PUT /employee/:id/approve
   └─ Reject: PUT /employee/:id/reject
   ↓
4. Employee can now login if approved
```

## Security Features

- ✅ JWT tokens only issued to APPROVED employees
- ✅ Google OAuth prevents password exposure
- ✅ Employee status validation on every protected request
- ✅ Admin audit trail (approvedBy, approvedAt)
- ✅ Account activation/deactivation support
- ✅ Rejection reason tracking

## Using Employee-Only Routes

To protect routes for approved employees only, use the `EmployeeJwtAuthGuard`:

```typescript
import { EmployeeJwtAuthGuard } from '../auth/guards/employee-jwt-auth.guard';

@Controller('invoices')
@UseGuards(EmployeeJwtAuthGuard)
export class InvoicesController {
  @Get()
  findAll(@Request() req) {
    // req.employee contains approved employee data
    return this.invoicesService.findAll();
  }
}
```

## Frontend Integration Example

```javascript
// 1. Login with Google
window.location.href = 'http://localhost:5000/auth/google';

// 2. Handle callback (parse token from URL)
const params = new URLSearchParams(window.location.search);
const token = params.get('token');
const status = params.get('status');

if (status === 'APPROVED') {
  localStorage.setItem('token', token);
  // Redirect to dashboard
} else {
  // Show appropriate message based on status
  console.log('Status:', status);
}

// 3. Use token in API calls
const response = await fetch('http://localhost:5000/invoices', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

## Troubleshooting

### "Google Strategy not found"

- Ensure `GoogleStrategy` is added to `AuthModule` providers

### "Employee not found" error

- First register the employee via Google OAuth
- Then admin must assign employee type and approve

### "Only approved employees can access"

- Employee status must be APPROVED
- Check with admin to approve your account

### JWT validation fails

- Ensure JWT_SECRET is set in .env
- Token must be in Authorization header as Bearer token

## Next Steps

1. Create frontend login page that redirects to `/auth/google`
2. Handle callback URL with token extraction
3. Use token in API requests
4. Implement admin panel for employee approval
5. Add email notifications for approval/rejection
