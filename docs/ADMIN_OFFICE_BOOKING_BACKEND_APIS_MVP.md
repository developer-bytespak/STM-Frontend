# Admin Office Booking Backend APIs & Schema (MVP - Simplified)

## Overview
This document outlines the **simplified MVP version** of the backend database schema and API endpoints required to support the basic office booking management functionality.

**MVP Features:**
- ✅ Basic office CRUD (Create, Read, Update, Delete)
- ✅ Daily pricing only (no hourly/weekly/monthly)
- ✅ Simple office type (just "office")
- ✅ Basic booking status (pending → confirmed → completed)
- ✅ No amenities system
- ✅ No analytics or advanced filtering

**Features Commented Out (for future):**
- ❌ Multiple office types
- ❌ Amenities system
- ❌ Complex pricing (hourly, weekly, monthly)
- ❌ Advanced analytics
- ❌ Detailed availability tracking
- ❌ Payment integration
- ❌ Booking modifications


## Database Schema

### 1. Office Spaces Table (Simplified)
```sql
CREATE TABLE office_spaces (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'private_office', -- Simplified: just one type for now
    status ENUM('available', 'booked', 'maintenance') DEFAULT 'available',
    
    -- Location
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    
    -- Physical Details
    capacity INTEGER NOT NULL,
    area_sqft INTEGER NOT NULL,
    
    -- SIMPLIFIED PRICING - Daily rate only (in cents)
    daily_price INTEGER NOT NULL,
    
    -- COMMENTED OUT - Complex pricing
    -- hourly_price INTEGER,
    -- weekly_price INTEGER,
    -- monthly_price INTEGER,
    
    -- Basic Availability
    availability JSON NOT NULL DEFAULT '{"monday":{"available":true,"start":"09:00","end":"18:00"},"tuesday":{"available":true,"start":"09:00","end":"18:00"},"wednesday":{"available":true,"start":"09:00","end":"18:00"},"thursday":{"available":true,"start":"09:00","end":"18:00"},"friday":{"available":true,"start":"09:00","end":"18:00"},"saturday":{"available":false,"start":"10:00","end":"16:00"},"sunday":{"available":false,"start":"00:00","end":"00:00"}}',
    
    -- Basic Metadata
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_bookings INTEGER DEFAULT 0,
    images JSON DEFAULT '[]', -- Keep for placeholder images
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    
    -- Basic Indexes
    INDEX idx_status (status),
    INDEX idx_city (city),
    INDEX idx_created_at (created_at)
);
```

### 2. Office Bookings Table (Simplified)
```sql
CREATE TABLE office_bookings (
    id VARCHAR(36) PRIMARY KEY,
    office_space_id VARCHAR(36) NOT NULL,
    provider_id VARCHAR(36) NOT NULL,
    
    -- Booking Details
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    duration_days INTEGER NOT NULL, -- Calculated in days only
    
    -- SIMPLIFIED PRICING
    daily_rate INTEGER NOT NULL, -- Rate at time of booking (in cents)
    total_amount INTEGER NOT NULL, -- duration_days × daily_rate
    
    -- SIMPLIFIED STATUS - Only basic statuses
    status ENUM('pending', 'confirmed', 'completed') DEFAULT 'pending',
    
    -- COMMENTED OUT - Complex statuses
    -- status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'active') DEFAULT 'pending',
    -- payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    -- cancellation_reason TEXT,
    
    -- Optional
    special_requests TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (office_space_id) REFERENCES office_spaces(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_office_space (office_space_id),
    INDEX idx_provider (provider_id),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date)
);
```

### COMMENTED OUT TABLES (for future implementation)

```sql
-- AMENITIES SYSTEM (COMMENTED OUT FOR MVP)
-- CREATE TABLE office_amenities (
--     id VARCHAR(36) PRIMARY KEY,
--     name VARCHAR(100) NOT NULL UNIQUE,
--     icon VARCHAR(50) NOT NULL,
--     description TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE office_space_amenities (
--     id VARCHAR(36) PRIMARY KEY,
--     office_space_id VARCHAR(36) NOT NULL,
--     amenity_id VARCHAR(36) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (office_space_id) REFERENCES office_spaces(id) ON DELETE CASCADE,
--     FOREIGN KEY (amenity_id) REFERENCES office_amenities(id) ON DELETE CASCADE,
--     UNIQUE KEY unique_office_amenity (office_space_id, amenity_id)
-- );

-- ANALYTICS TABLE (COMMENTED OUT FOR MVP)
-- CREATE TABLE office_analytics (
--     id VARCHAR(36) PRIMARY KEY,
--     office_space_id VARCHAR(36) NOT NULL,
--     date DATE NOT NULL,
--     total_bookings INTEGER DEFAULT 0,
--     revenue INTEGER DEFAULT 0,
--     occupancy_rate DECIMAL(5,2) DEFAULT 0.00,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (office_space_id) REFERENCES office_spaces(id) ON DELETE CASCADE,
--     UNIQUE KEY unique_office_date (office_space_id, date)
-- );
```


## API Endpoints

### Admin Office Management

#### 1. Get All Offices (Simplified)
```http
GET /api/admin/offices
```

**Query Parameters:**
- None for MVP (no filtering)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "office_1",
      "name": "Downtown Office Suite",
      "description": "Modern office space in the heart of downtown",
      "type": "private_office",
      "status": "available",
      "location": {
        "address": "123 Main St",
        "city": "Miami",
        "state": "FL",
        "zipCode": "33101"
      },
      "capacity": 10,
      "area": 500,
      "pricing": {
        "daily": 150.00
      },
      "images": [],
      "availability": {
        "monday": {"available": true, "start": "09:00", "end": "18:00"},
        "tuesday": {"available": true, "start": "09:00", "end": "18:00"}
      },
      "rating": 4.5,
      "totalBookings": 25,
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ],
  "count": 1
}
```

#### 2. Create Office (Simplified)
```http
POST /api/admin/offices
```

**Request Body:**
```json
{
  "name": "Downtown Office Suite",
  "description": "Modern office space",
  "type": "private_office",
  "location": {
    "address": "123 Main St",
    "city": "Miami",
    "state": "FL",
    "zipCode": "33101"
  },
  "capacity": 10,
  "area": 500,
  "pricing": {
    "daily": 150.00
  },
  "availability": {
    "monday": {"available": true, "start": "09:00", "end": "18:00"},
    "tuesday": {"available": true, "start": "09:00", "end": "18:00"},
    "wednesday": {"available": true, "start": "09:00", "end": "18:00"},
    "thursday": {"available": true, "start": "09:00", "end": "18:00"},
    "friday": {"available": true, "start": "09:00", "end": "18:00"},
    "saturday": {"available": false, "start": "10:00", "end": "16:00"},
    "sunday": {"available": false, "start": "00:00", "end": "00:00"}
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Office space created successfully",
  "data": {
    "id": "office_123",
    "name": "Downtown Office Suite",
    "status": "available",
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

#### 3. Update Office
```http
PUT /api/admin/offices/:id
```

**Request Body:** (Same structure as Create, all fields optional)

**Response:**
```json
{
  "success": true,
  "message": "Office space updated successfully",
  "data": {
    "id": "office_123",
    "updatedAt": "2025-01-15T11:00:00Z"
  }
}
```

#### 4. Delete Office
```http
DELETE /api/admin/offices/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Office space deleted successfully"
}
```

#### 5. Get Single Office
```http
GET /api/admin/offices/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "office_123",
    "name": "Downtown Office Suite",
    "description": "Modern office space",
    "type": "private_office",
    "status": "available",
    "location": {
      "address": "123 Main St",
      "city": "Miami",
      "state": "FL",
      "zipCode": "33101"
    },
    "capacity": 10,
    "area": 500,
    "pricing": {
      "daily": 150.00
    },
    "images": [],
    "availability": {},
    "rating": 4.5,
    "totalBookings": 25
  }
}
```


### Provider Office Browsing & Booking

#### 1. Browse Available Offices (Simplified)
```http
GET /api/provider/offices
```

**Query Parameters:**
- None for MVP (no filtering or sorting)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "office_1",
      "name": "Downtown Office Suite",
      "description": "Modern office space",
      "type": "private_office",
      "status": "available",
      "location": {
        "city": "Miami",
        "state": "FL"
      },
      "capacity": 10,
      "area": 500,
      "pricing": {
        "daily": 150.00
      },
      "images": [],
      "rating": 4.5
    }
  ],
  "count": 1
}
```

#### 2. Create Booking (Simplified)
```http
POST /api/provider/bookings
```

**Request Body:**
```json
{
  "officeId": "office_123",
  "startDate": "2025-02-01T09:00:00Z",
  "endDate": "2025-02-05T17:00:00Z",
  "duration": 4,
  "durationType": "daily",
  "totalAmount": 600.00,
  "specialRequests": "Need extra chairs"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "booking_456",
    "officeId": "office_123",
    "status": "pending",
    "startDate": "2025-02-01T09:00:00Z",
    "endDate": "2025-02-05T17:00:00Z",
    "totalAmount": 600.00,
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

#### 3. Get Provider Bookings
```http
GET /api/provider/bookings
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "booking_456",
      "office": {
        "id": "office_123",
        "name": "Downtown Office Suite",
        "location": {
          "city": "Miami",
          "state": "FL"
        }
      },
      "startDate": "2025-02-01T09:00:00Z",
      "endDate": "2025-02-05T17:00:00Z",
      "durationDays": 4,
      "dailyRate": 150.00,
      "totalAmount": 600.00,
      "status": "pending",
      "specialRequests": "Need extra chairs",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ],
  "count": 1
}
```


### Admin Booking Management

#### 1. Get All Bookings (Admin View)
```http
GET /api/admin/bookings
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "booking_456",
      "office": {
        "id": "office_123",
        "name": "Downtown Office Suite"
      },
      "provider": {
        "id": "provider_789",
        "name": "John's Cleaning Service",
        "email": "john@example.com"
      },
      "startDate": "2025-02-01T09:00:00Z",
      "endDate": "2025-02-05T17:00:00Z",
      "durationDays": 4,
      "totalAmount": 600.00,
      "status": "pending",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ],
  "count": 1
}
```

#### 2. Confirm Booking
```http
PUT /api/admin/bookings/:id/confirm
```

**Response:**
```json
{
  "success": true,
  "message": "Booking confirmed successfully",
  "data": {
    "id": "booking_456",
    "status": "confirmed",
    "updatedAt": "2025-01-15T11:00:00Z"
  }
}
```

#### 3. Complete Booking
```http
PUT /api/admin/bookings/:id/complete
```

**Response:**
```json
{
  "success": true,
  "message": "Booking completed successfully",
  "data": {
    "id": "booking_456",
    "status": "completed",
    "updatedAt": "2025-01-15T18:00:00Z"
  }
}
```


## COMMENTED OUT ENDPOINTS (for future implementation)

```
# ANALYTICS (COMMENTED OUT FOR MVP)
# GET /api/admin/offices/analytics
# GET /api/admin/offices/:id/analytics

# AMENITIES MANAGEMENT (COMMENTED OUT FOR MVP)
# GET /api/admin/amenities
# POST /api/admin/amenities
# PUT /api/admin/amenities/:id
# DELETE /api/admin/amenities/:id

# ADVANCED FILTERING (COMMENTED OUT FOR MVP)
# GET /api/provider/offices?city=Miami&minPrice=100&maxPrice=500&amenities=wifi,parking

# BOOKING MODIFICATIONS (COMMENTED OUT FOR MVP)
# PUT /api/provider/bookings/:id
# DELETE /api/provider/bookings/:id/cancel

# PAYMENT INTEGRATION (COMMENTED OUT FOR MVP)
# POST /api/provider/bookings/:id/payment
# GET /api/provider/bookings/:id/invoice
```


## Implementation Notes

### Backend Validation

**Required Field Validation:**
```javascript
// Create Office
{
  name: required, min: 3, max: 255,
  description: required, min: 10,
  type: required, enum: ['private_office'], // Simplified
  location: {
    address: required,
    city: required,
    state: required,
    zipCode: required, numeric, min: 5, max: 10
  },
  capacity: required, integer, min: 1, max: 1000,
  area: required, integer, min: 10, max: 100000,
  pricing: {
    daily: required, numeric, min: 0.01 // Only daily rate
  }
}

// Create Booking
{
  officeId: required, exists in office_spaces,
  startDate: required, datetime, future,
  endDate: required, datetime, after: startDate,
  totalAmount: required, numeric, min: 0
}
```

### Business Logic

**Booking Creation:**
1. Check office availability for selected dates
2. Calculate: `duration_days = ceil((endDate - startDate) / 24 hours)`
3. Calculate: `total_amount = duration_days × office.daily_price`
4. Set initial status: `pending`
5. Create booking record
6. Send notification to admin

**Booking Confirmation (Admin):**
1. Validate booking exists and is `pending`
2. Update status to `confirmed`
3. Send confirmation email to provider

**Booking Completion (Admin):**
1. Validate booking exists and is `confirmed`
2. Check if end date has passed
3. Update status to `completed`
4. Update office `total_bookings` counter


## Migration from MVP to Full Version

When ready to implement advanced features, uncomment and add:

1. **Amenities System:**
   - Uncomment amenities tables
   - Add amenity endpoints
   - Update office create/update to include amenities

2. **Complex Pricing:**
   - Uncomment hourly/weekly/monthly pricing fields
   - Update pricing calculator logic
   - Add dynamic pricing recommendations

3. **Advanced Features:**
   - Analytics endpoints
   - Booking modifications
   - Payment integration
   - Advanced filtering and search
   - Multiple office types


## Testing Endpoints

Use these test data for initial testing:

**Create Test Office:**
```bash
POST /api/admin/offices
{
  "name": "Test Office Space",
  "description": "A test office for development",
  "type": "private_office",
  "location": {
    "address": "123 Test St",
    "city": "Miami",
    "state": "FL",
    "zipCode": "33101"
  },
  "capacity": 5,
  "area": 200,
  "pricing": {
    "daily": 100.00
  }
}
```

**Create Test Booking:**
```bash
POST /api/provider/bookings
{
  "officeId": "office_123",
  "startDate": "2025-02-01T09:00:00Z",
  "endDate": "2025-02-03T17:00:00Z",
  "duration": 2,
  "durationType": "daily",
  "totalAmount": 200.00
}
```

