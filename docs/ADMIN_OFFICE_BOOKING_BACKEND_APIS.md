# Admin Office Booking Backend APIs & Schema

## Overview
This document outlines the backend database schema and API endpoints required to support the admin office booking management functionality implemented in the frontend.


## Database Schema

### Office Spaces Table
```sql
CREATE TABLE office_spaces (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('private_office', 'shared_desk', 'meeting_room', 'conference_room', 'coworking_space') NOT NULL,
    status ENUM('available', 'occupied', 'booked', 'maintenance') DEFAULT 'available',
    
    -- Location
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    
    -- Physical Details
    capacity INTEGER NOT NULL,
    area_sqft INTEGER NOT NULL,
    
    -- Pricing (in cents to avoid floating point issues)
    hourly_price INTEGER,
    daily_price INTEGER NOT NULL,
    weekly_price INTEGER,
    monthly_price INTEGER,
    
    -- Availability (JSON object for each day of week)
    availability JSON NOT NULL DEFAULT '{"monday":{"available":true,"startTime":"09:00","endTime":"17:00"},"tuesday":{"available":true,"startTime":"09:00","endTime":"17:00"},"wednesday":{"available":true,"startTime":"09:00","endTime":"17:00"},"thursday":{"available":true,"startTime":"09:00","endTime":"17:00"},"friday":{"available":true,"startTime":"09:00","endTime":"17:00"},"saturday":{"available":false,"startTime":"09:00","endTime":"17:00"},"sunday":{"available":false,"startTime":"09:00","endTime":"17:00"}}',
    
    -- Metadata
    rating DECIMAL(3,2) DEFAULT 0.00,
    reviews_count INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    images JSON DEFAULT '[]',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    
    -- Indexes
    INDEX idx_status (status),
    INDEX idx_type (type),
    INDEX idx_city (city),
    INDEX idx_created_at (created_at)
);
```

### Office Amenities Table
```sql
CREATE TABLE office_amenities (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default amenities
INSERT INTO office_amenities (id, name, icon, description) VALUES
('amenity_1', 'High-Speed WiFi', 'wifi', 'Fast internet connection'),
('amenity_2', 'Air Conditioning', 'ac', 'Climate control'),
('amenity_3', 'Parking', 'parking', 'Free parking available'),
('amenity_4', 'Coffee Machine', 'coffee', 'Coffee and tea service'),
('amenity_5', 'Printer', 'printer', 'Printing and scanning facilities'),
('amenity_6', 'Projector', 'projector', 'Presentation equipment'),
('amenity_7', 'Whiteboard', 'whiteboard', 'Writing and presentation boards'),
('amenity_8', 'Phone Booth', 'phone', 'Private phone booths'),
('amenity_9', 'Kitchen', 'kitchen', 'Shared kitchen facilities'),
('amenity_10', 'Security', 'security', '24/7 security');
```

### Office Space Amenities Junction Table
```sql
CREATE TABLE office_space_amenities (
    id VARCHAR(36) PRIMARY KEY,
    office_space_id VARCHAR(36) NOT NULL,
    amenity_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (office_space_id) REFERENCES office_spaces(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES office_amenities(id) ON DELETE CASCADE,
    UNIQUE KEY unique_office_amenity (office_space_id, amenity_id),
    INDEX idx_office_space (office_space_id)
);
```

### Office Bookings Table
```sql
CREATE TABLE office_bookings (
    id VARCHAR(36) PRIMARY KEY,
    office_space_id VARCHAR(36) NOT NULL,
    provider_id VARCHAR(36) NOT NULL,
    
    -- Booking Details
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    duration INTEGER NOT NULL, -- in hours
    duration_type ENUM('hourly', 'daily', 'weekly', 'monthly') NOT NULL,
    
    -- Pricing
    base_price INTEGER NOT NULL, -- in cents
    total_amount INTEGER NOT NULL, -- in cents
    price_per_day INTEGER, -- in cents
    
    -- Status
    status ENUM('pending', 'confirmed', 'paid', 'active', 'completed', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    
    -- Special Requests
    special_requests TEXT,
    
    -- Metadata
    booking_reference VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (office_space_id) REFERENCES office_spaces(id) ON DELETE CASCADE,
    INDEX idx_office_space (office_space_id),
    INDEX idx_provider (provider_id),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date),
    INDEX idx_booking_reference (booking_reference)
);
```

### Office Analytics Table (Optional - for caching analytics)
```sql
CREATE TABLE office_analytics (
    id VARCHAR(36) PRIMARY KEY,
    office_space_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    
    -- Metrics
    total_bookings INTEGER DEFAULT 0,
    total_revenue INTEGER DEFAULT 0, -- in cents
    occupancy_rate DECIMAL(5,2) DEFAULT 0.00,
    avg_booking_duration DECIMAL(5,2) DEFAULT 0.00,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (office_space_id) REFERENCES office_spaces(id) ON DELETE CASCADE,
    UNIQUE KEY unique_office_date (office_space_id, date),
    INDEX idx_date (date)
);
```

## Admin API Endpoints

### Office Spaces Management

#### 1. Create Office Space
```
POST /api/admin/offices
```

**Request Body:**
```json
{
  "name": "Premium Conference Room",
  "description": "Modern conference room with advanced AV equipment",
  "type": "conference_room",
  "address": "123 Business Ave",
  "city": "Miami",
  "state": "FL",
  "zipCode": "33101",
  "capacity": 12,
  "area": 400,
  "pricing": {
    "hourly": 100,
    "daily": 600,
    "weekly": 3500,
    "monthly": 12000
  },
  "amenities": ["amenity_1", "amenity_2", "amenity_6", "amenity_7"],
  "availability": {
    "monday": {"available": true, "startTime": "08:00", "endTime": "18:00"},
    "tuesday": {"available": true, "startTime": "08:00", "endTime": "18:00"},
    "wednesday": {"available": true, "startTime": "08:00", "endTime": "18:00"},
    "thursday": {"available": true, "startTime": "08:00", "endTime": "18:00"},
    "friday": {"available": true, "startTime": "08:00", "endTime": "18:00"},
    "saturday": {"available": false, "startTime": "09:00", "endTime": "17:00"},
    "sunday": {"available": false, "startTime": "09:00", "endTime": "17:00"}
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "office_123",
    "name": "Premium Conference Room",
    "status": "available",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Office space created successfully"
}
```

#### 2. Get All Office Spaces (with filtering)
```
GET /api/admin/offices?search=conference&status=available&type=meeting_room&page=1&limit=10
```

**Query Parameters:**
- `search` (optional): Search by name, city, or description
- `status` (optional): Filter by status
- `type` (optional): Filter by type
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "offices": [
      {
        "id": "office_123",
        "name": "Premium Conference Room",
        "description": "Modern conference room...",
        "type": "conference_room",
        "status": "available",
        "location": {
          "address": "123 Business Ave",
          "city": "Miami",
          "state": "FL",
          "zipCode": "33101"
        },
        "capacity": 12,
        "area": 400,
        "pricing": {
          "hourly": 100,
          "daily": 600,
          "weekly": 3500,
          "monthly": 12000
        },
        "amenities": [
          {
            "id": "amenity_1",
            "name": "High-Speed WiFi",
            "icon": "wifi"
          }
        ],
        "rating": 4.8,
        "reviews": 24,
        "totalBookings": 156,
        "images": [],
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

#### 3. Get Single Office Space
```
GET /api/admin/offices/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "office_123",
    "name": "Premium Conference Room",
    "description": "Modern conference room...",
    "type": "conference_room",
    "status": "available",
    "location": {
      "address": "123 Business Ave",
      "city": "Miami",
      "state": "FL",
      "zipCode": "33101"
    },
    "capacity": 12,
    "area": 400,
    "pricing": {
      "hourly": 100,
      "daily": 600,
      "weekly": 3500,
      "monthly": 12000
    },
    "amenities": [...],
    "availability": {...},
    "rating": 4.8,
    "reviews": 24,
    "totalBookings": 156,
    "images": [],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### 4. Update Office Space
```
PUT /api/admin/offices/:id
```

**Request Body:** (Same as create, all fields optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "office_123",
    "updatedAt": "2024-01-15T11:30:00Z"
  },
  "message": "Office space updated successfully"
}
```

#### 5. Delete Office Space
```
DELETE /api/admin/offices/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Office space deleted successfully"
}
```

### Office Bookings Management

#### 6. Get Office Bookings
```
GET /api/admin/offices/:id/bookings?status=confirmed&startDate=2024-01-01&endDate=2024-01-31&page=1&limit=10
```

**Query Parameters:**
- `status` (optional): Filter by booking status
- `startDate` (optional): Filter bookings from this date
- `endDate` (optional): Filter bookings to this date
- `page`, `limit` (optional): Pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "booking_123",
        "provider": {
          "id": "provider_456",
          "name": "John Smith",
          "email": "john@example.com",
          "phone": "+1234567890"
        },
        "startDate": "2024-01-20T09:00:00Z",
        "endDate": "2024-01-22T17:00:00Z",
        "duration": 48,
        "durationType": "daily",
        "totalAmount": 1200,
        "status": "confirmed",
        "paymentStatus": "paid",
        "specialRequests": "Need projector setup",
        "bookingReference": "OB-2024-001",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

#### 7. Update Booking Status
```
PATCH /api/admin/bookings/:id/status
```

**Request Body:**
```json
{
  "status": "confirmed",
  "paymentStatus": "paid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "booking_123",
    "status": "confirmed",
    "paymentStatus": "paid",
    "updatedAt": "2024-01-15T11:30:00Z"
  },
  "message": "Booking status updated successfully"
}
```

### Analytics & Reporting

#### 8. Get Office Analytics
```
GET /api/admin/offices/:id/analytics?period=30d&startDate=2024-01-01&endDate=2024-01-31
```

**Query Parameters:**
- `period` (optional): 7d, 30d, 90d, 1y
- `startDate`, `endDate` (optional): Custom date range

**Response:**
```json
{
  "success": true,
  "data": {
    "officeId": "office_123",
    "period": "30d",
    "metrics": {
      "totalBookings": 45,
      "totalRevenue": 125000,
      "occupancyRate": 78.5,
      "avgBookingDuration": 2.5,
      "revenueByType": {
        "hourly": 15000,
        "daily": 75000,
        "weekly": 25000,
        "monthly": 10000
      }
    },
    "trends": {
      "bookingsGrowth": 12.5,
      "revenueGrowth": 8.3
    },
    "topProviders": [
      {
        "providerId": "provider_456",
        "providerName": "John Smith",
        "bookingsCount": 8,
        "totalSpent": 24000
      }
    ]
  }
}
```

#### 9. Get Dashboard Analytics
```
GET /api/admin/analytics/offices?period=30d
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalOffices": 25,
      "availableOffices": 18,
      "totalBookings": 156,
      "totalRevenue": 450000,
      "avgOccupancy": 65.2
    },
    "recentActivity": [
      {
        "type": "booking_created",
        "officeName": "Premium Conference Room",
        "providerName": "John Smith",
        "amount": 1200,
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ],
    "topPerformingOffices": [
      {
        "officeId": "office_123",
        "officeName": "Premium Conference Room",
        "bookings": 45,
        "revenue": 125000,
        "occupancyRate": 78.5
      }
    ]
  }
}
```

### Amenities Management

#### 10. Get All Amenities
```
GET /api/admin/amenities
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "amenity_1",
      "name": "High-Speed WiFi",
      "icon": "wifi",
      "description": "Fast internet connection"
    }
  ]
}
```

## Error Responses

All endpoints should return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "name": ["Name is required"],
      "capacity": ["Capacity must be a positive number"]
    }
  }
}
```

## Authentication & Authorization

All admin endpoints require:
- Valid JWT token in Authorization header
- Admin role verification
- Rate limiting (100 requests per minute per admin)

## Database Indexes

Additional recommended indexes for performance:

```sql
-- Office spaces
CREATE INDEX idx_offices_status_type ON office_spaces(status, type);
CREATE INDEX idx_offices_city_state ON office_spaces(city, state);
CREATE INDEX idx_offices_created_by ON office_spaces(created_by);

-- Bookings
CREATE INDEX idx_bookings_dates ON office_bookings(start_date, end_date);
CREATE INDEX idx_bookings_provider_status ON office_bookings(provider_id, status);
CREATE INDEX idx_bookings_office_status ON office_bookings(office_space_id, status);

-- Analytics
CREATE INDEX idx_analytics_office_date ON office_analytics(office_space_id, date);
```

## Notes

1. All monetary values are stored in cents to avoid floating-point precision issues
2. JSON fields use proper indexing where possible
3. Soft deletes can be implemented by adding a `deleted_at` timestamp
4. Audit trail can be added with separate audit tables
5. Consider implementing caching for frequently accessed data
6. Add proper validation for all input data
7. Implement proper error logging and monitoring
