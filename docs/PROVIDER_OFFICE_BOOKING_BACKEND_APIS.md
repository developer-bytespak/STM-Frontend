# Provider Office Booking Backend APIs & Schema

## Overview
This document outlines the backend database schema changes and API endpoints required to support the provider office booking functionality implemented in the frontend.

## Database Schema Changes

### Provider Table Updates
Add office booking related fields to the existing provider table:


```sql
-- Add office booking fields to providers table
ALTER TABLE providers ADD COLUMN office_booking_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE providers ADD COLUMN office_booking_preferences JSON DEFAULT '{}';
ALTER TABLE providers ADD COLUMN total_office_bookings INTEGER DEFAULT 0;
ALTER TABLE providers ADD COLUMN total_office_spent INTEGER DEFAULT 0; -- in cents
```

### Office Booking Preferences (New Table)
```sql
CREATE TABLE provider_office_preferences (
    id VARCHAR(36) PRIMARY KEY,
    provider_id VARCHAR(36) NOT NULL,
    
    -- Preferred booking settings
    preferred_booking_types JSON DEFAULT '["daily", "weekly"]',
    preferred_office_types JSON DEFAULT '["private_office", "meeting_room"]',
    max_daily_budget INTEGER, -- in cents
    preferred_cities JSON DEFAULT '[]',
    
    -- Notification preferences
    booking_reminders BOOLEAN DEFAULT TRUE,
    price_alerts BOOLEAN DEFAULT TRUE,
    availability_notifications BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_provider_preferences (provider_id)
);
```

### Provider Office Booking History (New Table)
```sql
CREATE TABLE provider_office_history (
    id VARCHAR(36) PRIMARY KEY,
    provider_id VARCHAR(36) NOT NULL,
    booking_id VARCHAR(36) NOT NULL,
    office_space_id VARCHAR(36) NOT NULL,
    
    -- Booking summary for quick access
    booking_date DATE NOT NULL,
    total_amount INTEGER NOT NULL, -- in cents
    duration_hours INTEGER NOT NULL,
    office_name VARCHAR(255) NOT NULL,
    office_type VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    
    -- Status tracking
    booking_status ENUM('pending', 'confirmed', 'paid', 'active', 'completed', 'cancelled') NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES office_bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (office_space_id) REFERENCES office_spaces(id) ON DELETE CASCADE,
    
    INDEX idx_provider_date (provider_id, booking_date),
    INDEX idx_booking_status (booking_status)
);
```

### Office Booking Reviews (New Table)
```sql
CREATE TABLE office_booking_reviews (
    id VARCHAR(36) PRIMARY KEY,
    booking_id VARCHAR(36) NOT NULL,
    provider_id VARCHAR(36) NOT NULL,
    office_space_id VARCHAR(36) NOT NULL,
    
    -- Review content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    
    -- Review metadata
    is_verified BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES office_bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    FOREIGN KEY (office_space_id) REFERENCES office_spaces(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_booking_review (booking_id),
    INDEX idx_office_rating (office_space_id, rating),
    INDEX idx_provider_reviews (provider_id)
);
```

## Provider API Endpoints

### Office Search & Discovery

#### 1. Search Available Office Spaces
```
GET /api/provider/offices/search?search=miami&type=meeting_room&sortBy=price&page=1&limit=12
```

**Query Parameters:**
- `search` (optional): Search by name, city, or description
- `type` (optional): Filter by office type
- `sortBy` (optional): price, rating, capacity
- `startDate` (optional): Filter by availability from date
- `endDate` (optional): Filter by availability to date
- `maxPrice` (optional): Maximum daily price in cents
- `city` (optional): Filter by specific city
- `page`, `limit` (optional): Pagination

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
        "isFavorite": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 45,
      "totalPages": 4
    },
    "filters": {
      "availableTypes": ["private_office", "meeting_room", "conference_room"],
      "availableCities": ["Miami", "Fort Lauderdale", "Boca Raton"],
      "priceRange": {
        "min": 50,
        "max": 1200
      }
    }
  }
}
```

#### 2. Get Office Details
```
GET /api/provider/offices/:id
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
    "recentReviews": [
      {
        "id": "review_123",
        "rating": 5,
        "title": "Excellent space!",
        "comment": "Great for team meetings",
        "providerName": "John S.",
        "createdAt": "2024-01-10T10:30:00Z"
      }
    ]
  }
}
```

#### 3. Calculate Booking Price
```
POST /api/provider/offices/:id/calculate-price
```

**Request Body:**
```json
{
  "startDate": "2024-01-20T09:00:00Z",
  "endDate": "2024-01-22T17:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "officeId": "office_123",
    "startDate": "2024-01-20T09:00:00Z",
    "endDate": "2024-01-22T17:00:00Z",
    "duration": {
      "hours": 56,
      "days": 2.33
    },
    "pricingOptions": [
      {
        "duration": 2,
        "durationType": "daily",
        "basePrice": 600,
        "totalPrice": 1200,
        "pricePerDay": 600,
        "savings": 400,
        "savingsPercentage": 25.0,
        "recommended": true
      },
      {
        "duration": 1,
        "durationType": "weekly",
        "basePrice": 3500,
        "totalPrice": 3500,
        "pricePerDay": 500,
        "savings": 500,
        "savingsPercentage": 12.5,
        "recommended": false
      }
    ]
  }
}
```

### Booking Management

#### 4. Create Booking
```
POST /api/provider/bookings
```

**Request Body:**
```json
{
  "officeSpaceId": "office_123",
  "startDate": "2024-01-20T09:00:00Z",
  "endDate": "2024-01-22T17:00:00Z",
  "durationType": "daily",
  "specialRequests": "Need projector setup for presentation",
  "paymentMethod": "card",
  "paymentToken": "tok_1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingId": "booking_123",
    "bookingReference": "OB-2024-001",
    "status": "pending",
    "paymentStatus": "pending",
    "totalAmount": 1200,
    "estimatedConfirmationTime": "2024-01-15T11:30:00Z",
    "office": {
      "id": "office_123",
      "name": "Premium Conference Room",
      "address": "123 Business Ave, Miami, FL"
    }
  },
  "message": "Booking request submitted successfully"
}
```

#### 5. Get Provider Bookings
```
GET /api/provider/bookings?status=confirmed&startDate=2024-01-01&endDate=2024-01-31&page=1&limit=10
```

**Query Parameters:**
- `status` (optional): Filter by booking status
- `startDate`, `endDate` (optional): Date range filter
- `officeType` (optional): Filter by office type
- `page`, `limit` (optional): Pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "booking_123",
        "bookingReference": "OB-2024-001",
        "office": {
          "id": "office_123",
          "name": "Premium Conference Room",
          "type": "conference_room",
          "address": "123 Business Ave, Miami, FL",
          "images": []
        },
        "bookingDates": {
          "startDate": "2024-01-20T09:00:00Z",
          "endDate": "2024-01-22T17:00:00Z",
          "duration": 2,
          "durationType": "daily"
        },
        "pricing": {
          "basePrice": 600,
          "totalAmount": 1200,
          "pricePerDay": 600
        },
        "status": {
          "booking": "confirmed",
          "payment": "paid"
        },
        "specialRequests": "Need projector setup",
        "createdAt": "2024-01-15T10:30:00Z",
        "canCancel": true,
        "canModify": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    },
    "summary": {
      "totalBookings": 25,
      "totalSpent": 45000,
      "upcomingBookings": 3,
      "activeBookings": 1
    }
  }
}
```

#### 6. Get Single Booking
```
GET /api/provider/bookings/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "booking_123",
    "bookingReference": "OB-2024-001",
    "office": {
      "id": "office_123",
      "name": "Premium Conference Room",
      "type": "conference_room",
      "address": "123 Business Ave, Miami, FL",
      "capacity": 12,
      "amenities": [...],
      "contactInfo": {
        "phone": "+1234567890",
        "email": "concierge@office.com"
      }
    },
    "bookingDetails": {
      "startDate": "2024-01-20T09:00:00Z",
      "endDate": "2024-01-22T17:00:00Z",
      "duration": 2,
      "durationType": "daily",
      "checkInInstructions": "Please check in at reception",
      "accessCode": "ABC123"
    },
    "pricing": {
      "basePrice": 600,
      "totalAmount": 1200,
      "pricePerDay": 600,
      "taxAmount": 96,
      "fees": 24
    },
    "status": {
      "booking": "confirmed",
      "payment": "paid"
    },
    "specialRequests": "Need projector setup",
    "createdAt": "2024-01-15T10:30:00Z",
    "canCancel": true,
    "canModify": false,
    "cancellationPolicy": {
      "canCancelUntil": "2024-01-19T09:00:00Z",
      "refundPercentage": 80
    }
  }
}
```

#### 7. Cancel Booking
```
POST /api/provider/bookings/:id/cancel
```

**Request Body:**
```json
{
  "reason": "Schedule conflict",
  "refundRequested": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingId": "booking_123",
    "status": "cancelled",
    "refundAmount": 960,
    "refundStatus": "pending",
    "estimatedRefundTime": "3-5 business days"
  },
  "message": "Booking cancelled successfully"
}
```

#### 8. Modify Booking
```
PATCH /api/provider/bookings/:id
```

**Request Body:**
```json
{
  "startDate": "2024-01-21T09:00:00Z",
  "endDate": "2024-01-23T17:00:00Z",
  "specialRequests": "Updated projector requirements"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingId": "booking_123",
    "updatedAt": "2024-01-15T11:30:00Z",
    "priceDifference": 0,
    "newTotalAmount": 1200
  },
  "message": "Booking updated successfully"
}
```

### Reviews & Ratings

#### 9. Submit Review
```
POST /api/provider/bookings/:id/review
```

**Request Body:**
```json
{
  "rating": 5,
  "title": "Excellent space!",
  "comment": "Great for team meetings, excellent facilities"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reviewId": "review_123",
    "rating": 5,
    "title": "Excellent space!",
    "comment": "Great for team meetings, excellent facilities"
  },
  "message": "Review submitted successfully"
}
```

#### 10. Get Provider Reviews
```
GET /api/provider/reviews?page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "review_123",
        "office": {
          "id": "office_123",
          "name": "Premium Conference Room"
        },
        "rating": 5,
        "title": "Excellent space!",
        "comment": "Great for team meetings",
        "createdAt": "2024-01-10T10:30:00Z",
        "helpfulCount": 3
      }
    ],
    "pagination": {...}
  }
}
```

### Favorites & Preferences

#### 11. Add/Remove Favorite Office
```
POST /api/provider/favorites
DELETE /api/provider/favorites/:officeId
```

**Request Body (POST):**
```json
{
  "officeId": "office_123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Office added to favorites"
}
```

#### 12. Get Favorite Offices
```
GET /api/provider/favorites
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "office_123",
      "name": "Premium Conference Room",
      "type": "conference_room",
      "city": "Miami",
      "pricing": {
        "daily": 600
      },
      "rating": 4.8,
      "isAvailable": true,
      "favoritedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### 13. Update Booking Preferences
```
PUT /api/provider/preferences/office-booking
```

**Request Body:**
```json
{
  "preferredBookingTypes": ["daily", "weekly"],
  "preferredOfficeTypes": ["private_office", "meeting_room"],
  "maxDailyBudget": 1000,
  "preferredCities": ["Miami", "Fort Lauderdale"],
  "bookingReminders": true,
  "priceAlerts": true,
  "availabilityNotifications": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "preferences": {...},
    "updatedAt": "2024-01-15T11:30:00Z"
  },
  "message": "Preferences updated successfully"
}
```

### Analytics & Reporting

#### 14. Get Provider Booking Analytics
```
GET /api/provider/analytics/bookings?period=30d
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "30d",
    "summary": {
      "totalBookings": 12,
      "totalSpent": 18000,
      "avgBookingValue": 1500,
      "favoriteOfficeType": "meeting_room",
      "mostBookedCity": "Miami"
    },
    "trends": {
      "bookingsGrowth": 25.0,
      "spendingGrowth": 15.5
    },
    "breakdown": {
      "byOfficeType": {
        "meeting_room": 6,
        "private_office": 4,
        "conference_room": 2
      },
      "byCity": {
        "Miami": 8,
        "Fort Lauderdale": 3,
        "Boca Raton": 1
      }
    },
    "recentActivity": [
      {
        "date": "2024-01-15",
        "type": "booking_created",
        "officeName": "Premium Conference Room",
        "amount": 1200
      }
    ]
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "BOOKING_CONFLICT",
    "message": "Office is not available for the selected dates",
    "details": {
      "conflictingBookings": [
        {
          "startDate": "2024-01-20T09:00:00Z",
          "endDate": "2024-01-20T17:00:00Z"
        }
      ]
    }
  }
}
```

## Authentication & Authorization

All provider endpoints require:
- Valid JWT token in Authorization header
- Provider role verification
- Rate limiting (200 requests per minute per provider)

## Webhook Events

For real-time updates, implement webhooks:

```json
{
  "event": "booking.status_changed",
  "data": {
    "bookingId": "booking_123",
    "providerId": "provider_456",
    "oldStatus": "pending",
    "newStatus": "confirmed",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Notes

1. All monetary values stored in cents for precision
2. Implement proper validation for booking conflicts
3. Add comprehensive logging for booking operations
4. Consider implementing booking confirmation workflows
5. Add support for recurring bookings
6. Implement proper payment processing integration
7. Add email/SMS notifications for booking status changes
8. Consider implementing waitlists for fully booked offices
