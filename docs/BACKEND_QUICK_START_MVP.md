# Office Booking System - Backend Quick Start (MVP)

## 🚀 TL;DR - What You Need to Implement

**Database:** 2 tables only  
**API Endpoints:** 13 endpoints total  
**Office Type:** Private office only (single type)  
**Pricing:** Daily rate only (no hourly/weekly/monthly)  
**Status Flow:** pending → confirmed → completed  
**Features Removed:** Amenities, complex pricing, multiple office types, search/filters

---

## 📊 Database Schema (Prisma Schema)

### Schema: office_spaces
```prisma
model OfficeSpace {
  id          String   @id @default(uuid())
  name        String   @db.VarChar(255)
  description String   @db.Text
  type        String   @default("private_office") @db.VarChar(50) // Only 'private_office' for MVP
  status      String   @default("available") @db.VarChar(50) // available, occupied, booked, maintenance
  
  // Location
  address     String   @db.Text
  city        String   @db.VarChar(100)
  state       String   @db.VarChar(50)
  zipCode     String   @map("zip_code") @db.VarChar(10)
  
  // Specifications
  capacity    Int      // 1-1000 people
  area        Int      @map("area_sqft") // 10-100000 sq ft
  dailyPrice  Float    @map("daily_price") // Only daily pricing for MVP
  
  // Availability (JSON format for weekly schedule, can be simple)
  availability Json    @default("{}") // Store weekly schedule as JSON
  
  // Stats
  rating         Float @default(0.00) @db.Decimal(3, 2) // 0.00-5.00
  reviewsCount   Int   @default(0) @map("reviews_count")
  totalBookings  Int   @default(0) @map("total_bookings")
  
  // Images (stored as JSON array of URLs)
  images      Json     @default("[]")
  
  // Timestamps
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  createdBy   String?  @map("created_by") @db.VarChar(36)
  
  // Relations
  bookings    OfficeBooking[]
  creator     User?    @relation("OfficeSpacesCreated", fields: [createdBy], references: [id], onDelete: SetNull)
  
  @@index([status])
  @@index([city])
  @@map("office_spaces")
}
```

### Schema: office_bookings
```prisma
model OfficeBooking {
  id            String   @id @default(uuid())
  officeSpaceId String   @map("office_space_id")
  providerId    String   @map("provider_id")
  
  // Denormalized fields for easy display (avoid extra joins)
  officeName    String   @map("office_name") @db.VarChar(255)
  providerName  String   @map("provider_name") @db.VarChar(255)
  providerEmail String   @map("provider_email") @db.VarChar(255)
  
  // Booking dates
  startDate     DateTime @map("start_date")
  endDate       DateTime @map("end_date")
  
  // Duration & Pricing
  duration      Int      // Number of days
  durationType  String   @default("daily") @map("duration_type") @db.VarChar(50) // Only 'daily' for MVP
  dailyRate     Float    @map("daily_rate")
  totalAmount   Float    @map("total_amount")
  
  // Status
  status        String   @default("pending") @db.VarChar(50) // pending, confirmed, cancelled, completed
  paymentStatus String   @default("pending") @map("payment_status") @db.VarChar(50) // pending, paid, failed, refunded
  
  // Optional fields
  paymentMethod  String?  @map("payment_method") @db.VarChar(100)
  transactionId  String?  @map("transaction_id") @db.VarChar(255)
  specialRequests String? @map("special_requests") @db.Text
  
  // Timestamps
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  
  // Relations
  officeSpace   OfficeSpace @relation(fields: [officeSpaceId], references: [id], onDelete: Cascade)
  provider      User        @relation("ProviderBookings", fields: [providerId], references: [id], onDelete: Cascade)
  
  @@index([officeSpaceId])
  @@index([providerId])
  @@index([status])
  @@map("office_bookings")
}
```

### Add to User model
```prisma
// Add these relations to existing User model
model User {
  // ... existing fields ...
  
  // Office booking relations
  officeSpacesCreated OfficeSpace[]  @relation("OfficeSpacesCreated")
  officeBookings      OfficeBooking[] @relation("ProviderBookings")
}
```

---

## 🔌 API Endpoints (13 Total)

### Admin Endpoints (8)

```
1. GET    /api/admin/offices              → List all offices (basic list, no filters)
2. POST   /api/admin/offices              → Create office
3. GET    /api/admin/offices/:id          → Get single office
4. PUT    /api/admin/offices/:id          → Update office
5. DELETE /api/admin/offices/:id          → Delete office

6. GET    /api/admin/office-bookings      → List all bookings
7. PUT    /api/admin/office-bookings/:id/confirm → Confirm booking
8. PUT    /api/admin/office-bookings/:id/complete→ Complete booking
```

### Provider Endpoints (5)

```
9.  GET   /api/provider/offices           → Browse available offices
10. GET   /api/provider/offices/:id       → Get office details
11. POST  /api/provider/office-bookings   → Create booking
12. GET   /api/provider/office-bookings   → Get my bookings
13. GET   /api/provider/office-bookings/:id → Get booking details
```

---

## 💡 Key Business Logic

### Pricing Calculation (Ultra Simple!)
```typescript
// Calculate number of days
const start = new Date(startDate);
const end = new Date(endDate);
const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

// Calculate total
const dailyRate = office.dailyPrice;
const totalAmount = daysDiff * dailyRate;
```

### Booking Status Flow
```
1. Provider creates booking   → status: "pending", paymentStatus: "pending"
2. Admin confirms booking      → status: "confirmed", paymentStatus: "paid" (for MVP, auto-mark as paid)
3. Booking period ends         → status: "completed"
4. Optional: Cancel            → status: "cancelled"
```

### Validation Rules
```typescript
// Office Creation
{
  name: string, min 2 chars, max 255 chars
  type: "private_office" (hardcoded for MVP)
  description: string, min 10 chars
  address: string, min 5 chars
  city: string, min 2 chars
  state: string, 2 chars (e.g., "FL")
  zipCode: string, numeric, between 100 and 99999
  capacity: number, 1-1000
  area: number, 10-100000 sq ft
  dailyPrice: number, > 0, max 10000
  availability: JSON (weekly schedule, can default to Mon-Fri 9-6)
  images: string[] (array of URLs, can be empty for MVP)
}

// Booking Creation
{
  officeSpaceId: valid office ID
  startDate: DateTime, must be future date
  endDate: DateTime, must be > startDate
  specialRequests: string (optional)
  
  // Auto-calculated by backend:
  duration: calculated from dates
  durationType: "daily"
  dailyRate: from office.dailyPrice
  totalAmount: duration * dailyPrice
  officeName: from office.name
  providerName: from user.name
  providerEmail: from user.email
  status: "pending"
  paymentStatus: "pending"
}

// Office must be "available" status to be booked
```

---

## 📝 Sample API Requests & Responses

### 1. Create Office (Admin)
```typescript
POST /api/admin/offices
Headers: {
  Authorization: "Bearer <admin_token>"
}
Body: {
  "name": "Downtown Office",
  "description": "Modern workspace in the heart of Miami",
  "type": "private_office",  // Always 'private_office' for MVP
  "address": "123 Main St, Suite 500",
  "city": "Miami",
  "state": "FL",
  "zipCode": "33101",
  "capacity": 10,
  "area": 500,
  "dailyPrice": 350.00,
  "availability": {
    "monday": { "start": "09:00", "end": "18:00", "available": true },
    "tuesday": { "start": "09:00", "end": "18:00", "available": true },
    "wednesday": { "start": "09:00", "end": "18:00", "available": true },
    "thursday": { "start": "09:00", "end": "18:00", "available": true },
    "friday": { "start": "09:00", "end": "18:00", "available": true },
    "saturday": { "start": "00:00", "end": "00:00", "available": false },
    "sunday": { "start": "00:00", "end": "00:00", "available": false }
  },
  "images": []  // Empty for MVP, can add URLs later
}

Response: {
  "success": true,
  "office": {
    "id": "uuid-here",
    "name": "Downtown Office",
    "description": "Modern workspace in the heart of Miami",
    "type": "private_office",
    "status": "available",
    "address": "123 Main St, Suite 500",
    "city": "Miami",
    "state": "FL",
    "zipCode": "33101",
    "capacity": 10,
    "area": 500,
    "dailyPrice": 350.00,
    "availability": { ... },
    "rating": 0.00,
    "reviewsCount": 0,
    "totalBookings": 0,
    "images": [],
    "createdAt": "2025-10-17T10:00:00Z",
    "updatedAt": "2025-10-17T10:00:00Z",
    "createdBy": "admin-user-id"
  }
}
```

### 2. List Offices (Admin)
```typescript
GET /api/admin/offices
Headers: {
  Authorization: "Bearer <admin_token>"
}

Response: {
  "success": true,
  "offices": [
    {
      "id": "uuid-1",
      "name": "Downtown Office",
      "type": "private_office",
      "status": "available",
      "city": "Miami",
      "state": "FL",
      "capacity": 10,
      "area": 500,
      "dailyPrice": 350.00,
      "rating": 4.5,
      "totalBookings": 12,
      "createdAt": "2025-10-17T10:00:00Z"
    }
    // ... more offices
  ],
  "total": 5
}
```

### 3. Browse Available Offices (Provider)
```typescript
GET /api/provider/offices
Headers: {
  Authorization: "Bearer <provider_token>"
}

Response: {
  "success": true,
  "offices": [
    // Only offices with status = 'available'
    {
      "id": "uuid-1",
      "name": "Downtown Office",
      "description": "Modern workspace...",
      "type": "private_office",
      "status": "available",
      "address": "123 Main St, Suite 500",
      "city": "Miami",
      "state": "FL",
      "zipCode": "33101",
      "capacity": 10,
      "area": 500,
      "dailyPrice": 350.00,
      "availability": { ... },
      "rating": 4.5,
      "reviewsCount": 10,
      "totalBookings": 12,
      "images": []
    }
  ]
}
```

### 4. Create Booking (Provider)
```typescript
POST /api/provider/office-bookings
Headers: {
  Authorization: "Bearer <provider_token>"
}
Body: {
  "officeSpaceId": "uuid-office-id",
  "startDate": "2025-11-01T09:00:00Z",
  "endDate": "2025-11-05T17:00:00Z",
  "specialRequests": "Need parking space" // Optional
}

Response: {
  "success": true,
  "booking": {
    "id": "uuid-booking-id",
    "officeSpaceId": "uuid-office-id",
    "providerId": "uuid-provider-id",
    "officeName": "Downtown Office",
    "providerName": "ABC Plumbing Services",
    "providerEmail": "contact@abcplumbing.com",
    "startDate": "2025-11-01T09:00:00Z",
    "endDate": "2025-11-05T17:00:00Z",
    "duration": 4,  // Auto-calculated
    "durationType": "daily",
    "dailyRate": 350.00,  // From office
    "totalAmount": 1400.00,  // Auto-calculated: 4 days * $350
    "status": "pending",
    "paymentStatus": "pending",
    "specialRequests": "Need parking space",
    "createdAt": "2025-10-17T10:00:00Z",
    "updatedAt": "2025-10-17T10:00:00Z"
  }
}
```

### 5. Get My Bookings (Provider)
```typescript
GET /api/provider/office-bookings
Headers: {
  Authorization: "Bearer <provider_token>"
}

Response: {
  "success": true,
  "bookings": [
    {
      "id": "uuid-booking-1",
      "officeName": "Downtown Office",
      "startDate": "2025-11-01T09:00:00Z",
      "endDate": "2025-11-05T17:00:00Z",
      "duration": 4,
      "durationType": "daily",
      "totalAmount": 1400.00,
      "status": "confirmed",
      "paymentStatus": "paid",
      "specialRequests": "Need parking space",
      "createdAt": "2025-10-17T10:00:00Z"
    }
  ]
}
```

### 6. Confirm Booking (Admin)
```typescript
PUT /api/admin/office-bookings/:id/confirm
Headers: {
  Authorization: "Bearer <admin_token>"
}

Response: {
  "success": true,
  "booking": {
    "id": "uuid-booking-id",
    "status": "confirmed",
    "paymentStatus": "paid",  // Auto-mark as paid for MVP
    "updatedAt": "2025-10-17T11:00:00Z"
    // ... other booking fields
  }
}
```

### 7. Complete Booking (Admin)
```typescript
PUT /api/admin/office-bookings/:id/complete
Headers: {
  Authorization: "Bearer <admin_token>"
}

Response: {
  "success": true,
  "booking": {
    "id": "uuid-booking-id",
    "status": "completed",
    "updatedAt": "2025-10-17T12:00:00Z"
    // ... other booking fields
  }
}
```

---

## ⚡ Implementation Steps (Backend)

### Step 1: Add Prisma Schema
1. Copy the `OfficeSpace` and `OfficeBooking` models to your `schema.prisma`
2. Add the relations to your existing `User` model
3. Run `npx prisma format` to format the schema
4. Run `npx prisma generate` to generate Prisma client
5. Run `npx prisma migrate dev --name add_office_booking` to create migration

### Step 2: Create Module Structure
```
src/modules/
  office-space/
    office-space.module.ts
    office-space.controller.ts
    office-space.service.ts
    dto/
      create-office-space.dto.ts
      update-office-space.dto.ts
  office-booking/
    office-booking.module.ts
    office-booking.controller.ts
    office-booking.service.ts
    dto/
      create-booking.dto.ts
```

### Step 3: Implement Admin Office APIs (5 endpoints)
```typescript
// src/modules/office-space/office-space.controller.ts
@Controller('admin/offices')
@UseGuards(AuthGuard, RoleGuard)
@Roles('admin')
export class OfficeSpaceController {
  @Get()           // List all offices
  @Post()          // Create office
  @Get(':id')      // Get single office
  @Put(':id')      // Update office
  @Delete(':id')   // Delete office
}
```

### Step 4: Implement Provider Office APIs (2 endpoints)
```typescript
// src/modules/office-space/office-space.controller.ts
@Controller('provider/offices')
@UseGuards(AuthGuard, RoleGuard)
@Roles('provider')
export class ProviderOfficeController {
  @Get()           // Browse available offices (status = 'available')
  @Get(':id')      // Get office details
}
```

### Step 5: Implement Provider Booking APIs (3 endpoints)
```typescript
// src/modules/office-booking/office-booking.controller.ts
@Controller('provider/office-bookings')
@UseGuards(AuthGuard, RoleGuard)
@Roles('provider')
export class ProviderBookingController {
  @Post()          // Create booking
  @Get()           // Get my bookings
  @Get(':id')      // Get booking details
}
```

### Step 6: Implement Admin Booking APIs (3 endpoints)
```typescript
// src/modules/office-booking/office-booking.controller.ts
@Controller('admin/office-bookings')
@UseGuards(AuthGuard, RoleGuard)
@Roles('admin')
export class AdminBookingController {
  @Get()                  // List all bookings
  @Put(':id/confirm')     // Confirm booking
  @Put(':id/complete')    // Complete booking
}
```

### Step 7: Add Validation
```typescript
// create-office-space.dto.ts
export class CreateOfficeSpaceDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsInt()
  @Min(1)
  @Max(1000)
  capacity: number;

  @IsNumber()
  @Min(0.01)
  @Max(10000)
  dailyPrice: number;

  // ... other fields with validation
}
```

### Step 8: Test APIs
1. Test admin office CRUD
2. Test provider browse offices
3. Test provider create booking
4. Test admin confirm/complete booking
5. Test end-to-end flow

---

## 🎯 What's NOT Included (Simplified Out)

These features are **commented out in frontend** and can be added later:

❌ **Not in MVP:**
- Amenities system (completely removed)
- Multiple office types (only 'private_office')
- Multiple pricing options (only daily rate)
- Search & filtering
- Analytics dashboard
- Reviews & ratings system
- Payment gateway integration
- Booking modifications/cancellations
- Complex availability checking
- Image upload (images array is empty/placeholder)

✅ **All these features are preserved in frontend code comments!**  
You can implement them later by uncommenting the frontend code and adding backend support.

---

## 📊 Database Migration Command

After adding the Prisma schema, run:

```bash
cd STM-Backend
npx prisma format
npx prisma generate
npx prisma migrate dev --name add_office_booking_system
```

This will:
1. Format your schema
2. Generate Prisma client with new types
3. Create and apply the migration

---

## 🎉 Summary

**What You're Building:**
- **2 new database tables** (office_spaces, office_bookings)
- **13 API endpoints** (8 admin + 5 provider)
- **Simple daily pricing** (no complex calculations)
- **Basic CRUD operations** (create, read, update, delete)
- **Simple status flow** (pending → confirmed → completed)

**What You're NOT Building (Yet):**
- Amenities, search, filters, analytics, reviews, complex pricing, payment integration

**Timeline:** 
- 2-3 days for experienced backend developer
- 1 week for intermediate developer

**Result:** 
A fully functional, minimal office booking system that matches your simplified frontend!

