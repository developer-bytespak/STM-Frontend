# 👤 Profile API Integration - LSM & Customer

## **Overview**
Updated LSM and Customer profile pages to use backend API endpoints instead of localStorage, matching the Provider profile implementation.

---

## **✅ What Changed**

### **Before (Using localStorage):**
```typescript
// ❌ OLD - Reading from localStorage
const storedCustomers = localStorage.getItem('customers');
const customerData = JSON.parse(storedCustomers).find(c => c.email === user.email);

// ❌ OLD - Saving to localStorage
localStorage.setItem('customers', JSON.stringify(updatedCustomers));
```

### **After (Using Backend API):**
```typescript
// ✅ NEW - Fetching from backend
const response = await apiClient.getProfile();

// ✅ NEW - Updating via backend
await apiClient.updateProfile({
  firstName: editData.firstName,
  lastName: editData.lastName,
  phoneNumber: editData.phone,
});
```

---

## **📊 API Endpoints Used**

### **1. Get Profile**
```
GET /auth/profile
Authorization: Bearer <access_token>

Response:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "phone_number": "+1234567890",  // Backend can return either format
  "address": "123 Main St",
  "region": "Dallas, TX",  // LSM specific
  "area": "North Dallas",   // LSM specific
  "department": "Operations",  // LSM specific
  "employeeId": "EMP001"  // LSM specific
}
```

### **2. Update Profile**
```
PATCH /auth/me
Authorization: Bearer <access_token>
Content-Type: application/json

Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890"
}

Response:
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

---

## **🔄 Complete Flow**

### **Load Profile (On Page Load):**
```
1. User navigates to profile page
   ↓
2. useEffect triggers fetchProfile()
   ↓
3. Frontend calls: GET /auth/profile
   ↓
4. Backend returns user profile data
   ↓
5. Frontend normalizes response (handles both camelCase and snake_case)
   ↓
6. Profile data displayed in form
```

### **Update Profile (On Save):**
```
1. LSM/Customer clicks "Edit Profile"
   ↓
2. Makes changes to fields
   ↓
3. Clicks "Save Changes"
   ↓
4. Frontend validates data locally
   ↓
5. Frontend calls: PATCH /auth/me
   ↓
6. Backend updates user profile
   ↓
7. Success message shown
   ↓
8. Edit mode closes
```

---

## **📁 Files Modified**

### **1. LSM Profile** (`src/app/lsm/profile/page.tsx`)

**Changes:**
- ✅ Removed `formatPhoneNumber` import (unused)
- ✅ Added `apiClient` import
- ✅ Changed data loading from localStorage to API
- ✅ Changed data saving from localStorage to API
- ✅ Added flexible field name handling (camelCase & snake_case)
- ✅ Added error fallback to auth user data

**API Calls:**
```typescript
// Load profile
const response = await apiClient.getProfile();

// Save profile
await apiClient.updateProfile({
  firstName: editData.firstName,
  lastName: editData.lastName,
  phoneNumber: editData.phone,
});
```

### **2. Customer Profile** (`src/app/customer/profile/page.tsx`)

**Changes:**
- ✅ Removed `formatPhoneNumber` import (unused)
- ✅ Added `apiClient` import
- ✅ Changed data loading from localStorage to API
- ✅ Changed data saving from localStorage to API
- ✅ Added flexible field name handling (camelCase & snake_case)
- ✅ Added error fallback to auth user data

**API Calls:**
```typescript
// Load profile
const response = await apiClient.getProfile();

// Save profile
await apiClient.updateProfile({
  firstName: editData.firstName,
  lastName: editData.lastName,
  phoneNumber: editData.phone,
});
```

---

## **🔒 Flexible Response Handling**

Both pages now handle **multiple backend response formats**:

```typescript
// Handles both camelCase and snake_case
const profile = {
  firstName: response.firstName || response.first_name || '',
  lastName: response.lastName || response.last_name || '',
  phone: response.phoneNumber || response.phone_number || response.phone || '',
  // ... etc
};
```

**Why?** Different backend frameworks might return different field name formats:
- NestJS/Express: `firstName`, `phoneNumber` (camelCase)
- Django/FastAPI: `first_name`, `phone_number` (snake_case)
- Either format will work! ✅

---

## **🛡️ Error Handling**

### **API Failure Fallback:**
```typescript
try {
  const response = await apiClient.getProfile();
  // Use API data
} catch (error) {
  console.error('Failed to load profile data:', error);
  // Fallback to auth user data
  if (user) {
    const profile = {
      firstName: user.name?.split(' ')[0] || '',
      lastName: user.name?.split(' ')[1] || '',
      email: user.email,
      // ...
    };
  }
}
```

**Benefits:**
- ✅ Graceful degradation if API fails
- ✅ User still sees their basic info
- ✅ Can still use the application
- ✅ Better UX

---

## **🧪 Testing**

### **LSM Profile Test:**
```bash
# 1. Login as LSM
POST /auth/login
{
  "email": "lsm@dallas.com",
  "password": "lsm123"
}

# 2. Navigate to /lsm/profile
# Frontend calls: GET /auth/profile

# 3. Backend returns:
{
  "firstName": "Lisa",
  "lastName": "Manager",
  "email": "lsm@dallas.com",
  "phoneNumber": "+1234567890",
  "region": "Dallas, TX",
  "area": "North Dallas",
  "department": "Operations",
  "employeeId": "EMP001"
}

# 4. LSM sees profile with all fields populated ✅

# 5. LSM edits name and clicks "Save"
# Frontend calls: PATCH /auth/me
{
  "firstName": "Lisa Marie",
  "lastName": "Manager",
  "phoneNumber": "+1234567890"
}

# 6. Profile updated successfully ✅
```

### **Customer Profile Test:**
```bash
# 1. Login as Customer
POST /auth/login
{
  "email": "customer@example.com",
  "password": "pass123"
}

# 2. Navigate to /customer/profile
# Frontend calls: GET /auth/profile

# 3. Backend returns:
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "customer@example.com",
  "phoneNumber": "+1987654321",
  "address": "456 Oak Ave, Dallas, TX 75001"
}

# 4. Customer sees profile populated ✅

# 5. Customer updates phone and clicks "Save"
# Frontend calls: PATCH /auth/me

# 6. Profile updated successfully ✅
```

---

## **🎯 Consistency Across Roles**

All three user roles now use the same API pattern:

| Role | Profile Page | Load Data | Save Data |
|------|--------------|-----------|-----------|
| **Customer** | `/customer/profile` | `GET /auth/profile` | `PATCH /auth/me` |
| **Provider** | `/provider/profile` | `GET /auth/profile` | `PATCH /auth/me` |
| **LSM** | `/lsm/profile` | `GET /auth/profile` | `PATCH /auth/me` |

**Benefits:**
- ✅ Consistent architecture across all user types
- ✅ Single source of truth (backend database)
- ✅ No localStorage conflicts
- ✅ Real-time data synchronization
- ✅ Proper data validation and security

---

## **🔌 Backend Requirements**

### **Endpoint: GET /auth/profile**

**Controller:**
```typescript
// auth.controller.ts
@Get('profile')
@UseGuards(JwtAuthGuard)
async getProfile(@CurrentUser() user: User) {
  return this.authService.getProfile(user.id);
}
```

**Service:**
```typescript
// auth.service.ts
async getProfile(userId: number) {
  const user = await this.prisma.users.findUnique({
    where: { id: userId },
    include: {
      customer: true,
      service_provider: true,
      local_service_manager: true,
    },
  });

  // Return role-specific data
  if (user.role === 'customer') {
    return {
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phoneNumber: user.phone_number,
      address: user.customer?.address,
    };
  } else if (user.role === 'service_provider') {
    return {
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phoneNumber: user.phone_number,
      businessName: user.service_provider?.business_name,
      description: user.service_provider?.description,
      // ... provider specific fields
    };
  } else if (user.role === 'local_service_manager') {
    return {
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phoneNumber: user.phone_number,
      region: user.local_service_manager?.region,
      area: user.local_service_manager?.area,
      department: user.local_service_manager?.department,
      employeeId: user.local_service_manager?.employee_id,
    };
  }
}
```

### **Endpoint: PATCH /auth/me**

**Controller:**
```typescript
// auth.controller.ts
@Patch('me')
@UseGuards(JwtAuthGuard)
async updateProfile(
  @CurrentUser() user: User,
  @Body() updateDto: UpdateProfileDto,
) {
  return this.authService.updateProfile(user.id, updateDto);
}
```

**DTO:**
```typescript
// dto/update-profile.dto.ts
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;
}
```

---

## **✅ Summary**

### **What Was Done:**
1. ✅ Updated LSM profile to use `GET /auth/profile`
2. ✅ Updated Customer profile to use `GET /auth/profile`
3. ✅ Both now save via `PATCH /auth/me`
4. ✅ Removed localStorage dependencies
5. ✅ Added flexible field name handling
6. ✅ Added error fallback mechanisms
7. ✅ Consistent with Provider profile implementation

### **Benefits:**
- 🎯 All profiles now use the same backend API
- 🎯 Data is stored centrally in database
- 🎯 Profile changes sync across sessions
- 🎯 Better security (no client-side data manipulation)
- 🎯 Easier to maintain and extend

### **Impact:**
- ✅ LSM profile loads from database
- ✅ Customer profile loads from database
- ✅ Profile updates persist to database
- ✅ Works across all devices/sessions
- ✅ No localStorage conflicts

**All profile pages now use the backend API!** 🎉

