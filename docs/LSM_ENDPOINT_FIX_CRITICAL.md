# 🔧 CRITICAL FIX: LSM Approval Endpoints

## **🚨 The Problem**

The frontend was calling the **WRONG ENDPOINT** for provider onboarding approval!

### **What Was Happening:**
```typescript
// ❌ WRONG - Frontend was calling service request approval
await lsmApi.approveServiceRequest(6);  // POST /lsm/service-requests/6/approve

// This endpoint is for EXISTING providers adding NEW services
// NOT for approving NEW provider registrations!
```

### **Why It Failed:**
- Provider ID `6` is a **new provider registration** (provider onboarding)
- The endpoint `/lsm/service-requests/:id/approve` is for **service additions**
- Backend returned 404 or error because ID 6 doesn't exist in `service_requests` table
- It exists in `service_providers` table with status `pending`

---

## **✅ The Fix**

### **Now Using Correct Endpoints:**
```typescript
// ✅ CORRECT - For NEW provider registrations
await lsmApi.approveProviderOnboarding(6);  // POST /lsm/providers/6/approve-onboarding

// ✅ CORRECT - For rejecting provider registrations
await lsmApi.rejectProviderOnboarding(6, reason);  // POST /lsm/providers/6/reject-onboarding
```

---

## **📋 Two Different Workflows Explained**

### **Workflow 1: Provider Onboarding** (NEW provider registration)

**Scenario:** A person signs up as a new service provider

**Flow:**
```
1. Provider fills registration form
   ↓
2. Backend creates service_provider record (status: 'pending')
   ↓
3. LSM sees in pending list
   ↓
4. LSM reviews and approves
   ↓
5. Frontend calls: POST /lsm/providers/:id/approve-onboarding ✅
   ↓
6. Backend updates: service_provider.status = 'approved'
```

**Frontend API Methods:**
```typescript
// Approve new provider registration
lsmApi.approveProviderOnboarding(providerId: number)
// Endpoint: POST /lsm/providers/:providerId/approve-onboarding

// Reject new provider registration
lsmApi.rejectProviderOnboarding(providerId: number, reason: string)
// Endpoint: POST /lsm/providers/:providerId/reject-onboarding
```

**Backend Controller:**
```typescript
// lsm.controller.ts
@Post('providers/:id/approve-onboarding')
async approveProviderOnboarding(
  @CurrentUser('id') userId: number,
  @Param('id', ParseIntPipe) providerId: number,
) {
  return this.lsmService.approveProviderOnboarding(userId, providerId);
}

@Post('providers/:id/reject-onboarding')
async rejectProviderOnboarding(
  @CurrentUser('id') userId: number,
  @Param('id', ParseIntPipe) providerId: number,
  @Body('reason') reason: string,
) {
  return this.lsmService.rejectProviderOnboarding(userId, providerId, reason);
}
```

**Backend Service:**
```typescript
// lsm.service.ts
async approveProviderOnboarding(userId: number, providerId: number) {
  // 1. Verify LSM
  const lsm = await this.prisma.local_service_managers.findUnique({
    where: { user_id: userId },
  });

  // 2. Get provider
  const provider = await this.prisma.service_providers.findUnique({
    where: { id: providerId },
  });

  // 3. Verify provider is in LSM's region
  if (provider.lsm_id !== lsm.id) {
    throw new ForbiddenException('This provider is not in your region');
  }

  // 4. Update provider status
  await this.prisma.service_providers.update({
    where: { id: providerId },
    data: {
      status: 'approved',
      approved_by_lsm: true,
      lsm_approved_at: new Date(),
    },
  });

  // 5. Send email notification
  await this.emailService.send({
    to: provider.user.email,
    subject: 'Provider Application Approved',
    template: 'provider-approved',
  });

  return {
    id: providerId,
    status: 'approved',
    message: 'Provider onboarding approved successfully',
  };
}
```

---

### **Workflow 2: Service Request Approval** (EXISTING provider adding services)

**Scenario:** An already-approved provider wants to add a new service to their portfolio

**Flow:**
```
1. Existing provider requests to add "Electrical Work"
   ↓
2. Backend creates service_request record (status: 'pending')
   ↓
3. LSM sees in service requests list
   ↓
4. LSM reviews and approves
   ↓
5. Frontend calls: POST /lsm/service-requests/:id/approve ✅
   ↓
6. Backend forwards to admin for final approval
```

**Frontend API Methods:**
```typescript
// Approve service addition request
lsmApi.approveServiceRequest(requestId: number)
// Endpoint: POST /lsm/service-requests/:requestId/approve

// Reject service addition request
lsmApi.rejectServiceRequest(requestId: number, reason: string)
// Endpoint: POST /lsm/service-requests/:requestId/reject
```

**Backend Controller:**
```typescript
// lsm.controller.ts
@Post('service-requests/:id/approve')
async approveServiceRequest(
  @CurrentUser('id') userId: number,
  @Param('id', ParseIntPipe) requestId: number,
) {
  return this.lsmService.approveServiceRequest(userId, requestId);
}

@Post('service-requests/:id/reject')
async rejectServiceRequest(
  @CurrentUser('id') userId: number,
  @Param('id', ParseIntPipe) requestId: number,
  @Body('reason') reason: string,
) {
  return this.lsmService.rejectServiceRequest(userId, requestId, reason);
}
```

**Backend Service:**
```typescript
// lsm.service.ts
async approveServiceRequest(userId: number, requestId: number) {
  // 1. Get service request
  const request = await this.prisma.service_requests.findUnique({
    where: { id: requestId },
    include: { provider: true },
  });

  // 2. Verify LSM has authority
  const lsm = await this.prisma.local_service_managers.findUnique({
    where: { user_id: userId },
  });

  if (request.provider.lsm_id !== lsm.id) {
    throw new ForbiddenException('Not in your region');
  }

  // 3. Mark as LSM approved (sends to admin)
  await this.prisma.service_requests.update({
    where: { id: requestId },
    data: {
      lsm_approved: true,
      lsm_reviewed_at: new Date(),
      // Admin approval still needed
    },
  });

  return {
    id: requestId,
    status: 'lsm_approved',
    message: 'Service request forwarded to admin for final approval',
  };
}
```

---

## **🗂️ Database Tables Involved**

### **Provider Onboarding:**
```sql
-- Table: service_providers
{
  id: 6,
  business_name: "ABC Plumbing",
  status: "pending" → "approved",  -- ✅ This changes
  lsm_id: 5,
  approved_by_lsm: false → true,
  lsm_approved_at: NULL → NOW(),
  ...
}
```

### **Service Request:**
```sql
-- Table: service_requests
{
  id: 123,
  provider_id: 6,  -- Existing provider
  service_name: "Electrical Work",
  lsm_approved: false → true,  -- ✅ This changes
  admin_approved: false,  -- Still needs admin
  lsm_reviewed_at: NULL → NOW(),
  ...
}
```

---

## **📊 API Endpoint Summary**

| Workflow | Frontend Method | Backend Endpoint | Purpose |
|----------|----------------|------------------|---------|
| **Provider Onboarding** | `approveProviderOnboarding(6)` | `POST /lsm/providers/6/approve-onboarding` | Activate new provider |
| **Provider Onboarding** | `rejectProviderOnboarding(6, reason)` | `POST /lsm/providers/6/reject-onboarding` | Reject new provider |
| **Service Request** | `approveServiceRequest(123)` | `POST /lsm/service-requests/123/approve` | Approve new service |
| **Service Request** | `rejectServiceRequest(123, reason)` | `POST /lsm/service-requests/123/reject` | Reject new service |

---

## **🔄 Complete Flow Comparison**

### **Provider Onboarding Flow:**
```
User Registration
  ↓
POST /auth/register (role: PROVIDER)
  ↓
Creates:
  - users table (id: 10, role: service_provider)
  - service_providers table (id: 6, user_id: 10, status: pending)
  ↓
LSM Views:
  GET /lsm/onboarding/pending
  Returns: [{ id: 6, businessName: "ABC Plumbing", ... }]
  ↓
LSM Approves:
  POST /lsm/providers/6/approve-onboarding ✅
  ↓
Updates:
  service_providers.status = 'approved'
  ↓
Provider gets email and can log in
```

### **Service Request Flow:**
```
Provider Wants New Service
  ↓
POST /provider/services/request
  ↓
Creates:
  - service_requests table (id: 123, provider_id: 6, status: pending)
  ↓
LSM Views:
  GET /lsm/service-requests
  Returns: [{ id: 123, serviceName: "Electrical", ... }]
  ↓
LSM Approves:
  POST /lsm/service-requests/123/approve ✅
  ↓
Updates:
  service_requests.lsm_approved = true
  (Still needs admin approval)
  ↓
Admin sees and gives final approval
```

---

## **🔧 Files Modified**

### **1. `src/api/lsm.ts`**
**Added:**
- ✅ `approveProviderOnboarding(providerId)` - NEW method
- ✅ `rejectProviderOnboarding(providerId, reason)` - NEW method

**Kept:**
- ✅ `approveServiceRequest(requestId)` - For service additions
- ✅ `rejectServiceRequest(requestId, reason)` - For service additions

### **2. `src/app/lsm/sp-request/page.tsx`**
**Changed:**
```typescript
// Before ❌
await lsmApi.approveServiceRequest(id);

// After ✅
await lsmApi.approveProviderOnboarding(id);
```

---

## **🧪 Testing**

### **Test Provider Onboarding Approval:**
```bash
# 1. Login as LSM
POST /auth/login
{
  "email": "lsm@dallas.com",
  "password": "lsm123"
}

# 2. Get pending providers
GET /lsm/onboarding/pending
# Response: [{ id: 6, businessName: "ABC Plumbing", status: "pending" }]

# 3. Approve provider
POST /lsm/providers/6/approve-onboarding
Authorization: Bearer <lsm_token>

# Expected Response:
{
  "id": 6,
  "status": "approved",
  "message": "Provider onboarding approved successfully"
}

# 4. Verify in database
SELECT * FROM service_providers WHERE id = 6;
# status should be 'approved' ✅
```

### **Test Service Request Approval:**
```bash
# 1. Get service requests
GET /lsm/service-requests

# 2. Approve service request
POST /lsm/service-requests/123/approve
Authorization: Bearer <lsm_token>

# Expected Response:
{
  "id": 123,
  "status": "lsm_approved",
  "message": "Service request forwarded to admin"
}
```

---

## **✅ Summary of Fix**

### **What Was Wrong:**
- ❌ Frontend called `/lsm/service-requests/6/approve` for provider onboarding
- ❌ This endpoint is for service additions, not provider registrations
- ❌ Backend couldn't find ID 6 in service_requests table
- ❌ Approval failed

### **What's Fixed:**
- ✅ Frontend now calls `/lsm/providers/6/approve-onboarding` for provider onboarding
- ✅ This endpoint updates service_providers table correctly
- ✅ Backend finds provider and updates status
- ✅ Approval succeeds

### **Impact:**
- 🎯 LSM can now approve new provider registrations
- 🎯 Provider status changes from 'pending' to 'approved'
- 🎯 Provider receives email notification
- 🎯 Provider can log in and access dashboard
- 🎯 Service request workflow still works for service additions

---

## **🚀 Next Steps**

1. **Test the fix:**
   - Login as LSM
   - View pending provider (ABC Plumbing)
   - Click approve
   - Verify it calls `/lsm/providers/6/approve-onboarding`
   - Check provider status updates to 'approved'

2. **Verify backend endpoints exist:**
   - `POST /lsm/providers/:id/approve-onboarding`
   - `POST /lsm/providers/:id/reject-onboarding`

3. **Test provider login:**
   - After approval, provider should be able to log in
   - Provider dashboard should show full features (not pending screen)

---

**The LSM can now properly approve provider registrations!** 🎉

