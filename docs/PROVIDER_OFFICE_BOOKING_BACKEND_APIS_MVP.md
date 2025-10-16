# Provider Office Booking Backend APIs (MVP - Simplified)

## Overview
This document outlines the **simplified MVP version** of the provider-side backend APIs for browsing and booking office spaces.

**MVP Features:**
- ✅ Browse available offices (basic list)
- ✅ Simple daily rate booking
- ✅ View my bookings
- ✅ Basic booking status tracking

**Features Commented Out (for future):**
- ❌ Advanced search and filtering
- ❌ Office favorites/wishlist
- ❌ Booking reviews and ratings
- ❌ Booking modifications/cancellations
- ❌ Payment integration
- ❌ Multiple pricing options


## Provider Endpoints

### 1. Browse Available Offices (Simplified)

**Endpoint:**
```http
GET /api/provider/offices
```

**Query Parameters:** (None for MVP)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "office_1",
      "name": "Downtown Office Suite",
      "description": "Modern office space in downtown Miami",
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
      "rating": 4.5,
      "totalBookings": 25
    }
  ],
  "count": 1
}
```

### 2. Get Single Office Details

**Endpoint:**
```http
GET /api/provider/offices/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "office_1",
    "name": "Downtown Office Suite",
    "description": "Modern office space with all amenities",
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
    "availability": {
      "monday": {"available": true, "start": "09:00", "end": "18:00"},
      "tuesday": {"available": true, "start": "09:00", "end": "18:00"},
      "wednesday": {"available": true, "start": "09:00", "end": "18:00"},
      "thursday": {"available": true, "start": "09:00", "end": "18:00"},
      "friday": {"available": true, "start": "09:00", "end": "18:00"},
      "saturday": {"available": false, "start": "10:00", "end": "16:00"},
      "sunday": {"available": false, "start": "00:00", "end": "00:00"}
    },
    "images": [],
    "rating": 4.5,
    "totalBookings": 25
  }
}
```

### 3. Create Booking (Simplified)

**Endpoint:**
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

**Validation Rules:**
- `officeId`: Required, must exist and be available
- `startDate`: Required, must be future date
- `endDate`: Required, must be after startDate
- `duration`: Calculated as ceil((endDate - startDate) / 24 hours)
- `durationType`: Always "daily" for MVP
- `totalAmount`: Calculated as duration × office.daily_price
- `specialRequests`: Optional, max 500 characters

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully. Waiting for admin confirmation.",
  "data": {
    "id": "booking_456",
    "officeId": "office_123",
    "officeName": "Downtown Office Suite",
    "startDate": "2025-02-01T09:00:00Z",
    "endDate": "2025-02-05T17:00:00Z",
    "durationDays": 4,
    "dailyRate": 150.00,
    "totalAmount": 600.00,
    "status": "pending",
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

**Error Responses:**
```json
// Office not available
{
  "success": false,
  "error": "Office space is not available for the selected dates"
}

// Invalid dates
{
  "success": false,
  "error": "End date must be after start date"
}

// Office not found
{
  "success": false,
  "error": "Office space not found"
}
```

### 4. Get My Bookings (Simplified)

**Endpoint:**
```http
GET /api/provider/bookings
```

**Query Parameters:** (None for MVP)

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
        "type": "private_office",
        "location": {
          "address": "123 Main St",
          "city": "Miami",
          "state": "FL"
        },
        "images": []
      },
      "startDate": "2025-02-01T09:00:00Z",
      "endDate": "2025-02-05T17:00:00Z",
      "durationDays": 4,
      "dailyRate": 150.00,
      "totalAmount": 600.00,
      "status": "pending",
      "specialRequests": "Need extra chairs",
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    },
    {
      "id": "booking_789",
      "office": {
        "id": "office_456",
        "name": "Beachside Office",
        "type": "private_office",
        "location": {
          "address": "456 Beach Blvd",
          "city": "Miami Beach",
          "state": "FL"
        },
        "images": []
      },
      "startDate": "2025-01-20T09:00:00Z",
      "endDate": "2025-01-22T17:00:00Z",
      "durationDays": 2,
      "dailyRate": 200.00,
      "totalAmount": 400.00,
      "status": "confirmed",
      "specialRequests": null,
      "createdAt": "2025-01-10T10:00:00Z",
      "updatedAt": "2025-01-11T09:00:00Z"
    }
  ],
  "count": 2
}
```

### 5. Get Single Booking Details

**Endpoint:**
```http
GET /api/provider/bookings/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "booking_456",
    "office": {
      "id": "office_123",
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
      "images": []
    },
    "startDate": "2025-02-01T09:00:00Z",
    "endDate": "2025-02-05T17:00:00Z",
    "durationDays": 4,
    "dailyRate": 150.00,
    "totalAmount": 600.00,
    "status": "pending",
    "specialRequests": "Need extra chairs",
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
}
```


## Booking Status Flow (Simplified)

```
1. PENDING (Initial state after provider creates booking)
   ↓
   Admin reviews and confirms booking
   ↓
2. CONFIRMED (Admin approves the booking)
   ↓
   Booking period ends
   ↓
3. COMPLETED (Booking finished successfully)
```

**Status Descriptions:**
- **pending**: Booking created by provider, awaiting admin confirmation
- **confirmed**: Admin has approved the booking
- **completed**: Booking period has ended, marked complete by admin


## Business Logic

### Booking Creation Process

1. **Validate Request Data**
   - Check all required fields
   - Validate date formats and values
   - Ensure end date > start date

2. **Check Office Availability**
   - Verify office exists
   - Check office status is "available"
   - Check no conflicting bookings for the dates

3. **Calculate Pricing**
   ```javascript
   const startDate = new Date(requestBody.startDate);
   const endDate = new Date(requestBody.endDate);
   const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
   const totalAmount = durationDays * office.daily_price;
   ```

4. **Create Booking Record**
   - Set status: "pending"
   - Store all booking details
   - Generate unique booking ID

5. **Send Notifications**
   - Email to provider: "Booking created, awaiting confirmation"
   - Email to admin: "New booking requires confirmation"

6. **Return Response**
   - Return booking details with ID
   - Include next steps information


## COMMENTED OUT ENDPOINTS (for future implementation)

```
# ADVANCED SEARCH & FILTERING (COMMENTED OUT FOR MVP)
# GET /api/provider/offices?city=Miami&minPrice=100&maxPrice=500
# GET /api/provider/offices?type=meeting_room&capacity=10
# GET /api/provider/offices?amenities=wifi,parking

# FAVORITES/WISHLIST (COMMENTED OUT FOR MVP)
# POST /api/provider/favorites
# GET /api/provider/favorites
# DELETE /api/provider/favorites/:id

# BOOKING MODIFICATIONS (COMMENTED OUT FOR MVP)
# PUT /api/provider/bookings/:id
# DELETE /api/provider/bookings/:id/cancel

# REVIEWS & RATINGS (COMMENTED OUT FOR MVP)
# POST /api/provider/offices/:id/reviews
# GET /api/provider/offices/:id/reviews
# PUT /api/provider/reviews/:id
# DELETE /api/provider/reviews/:id

# PAYMENT INTEGRATION (COMMENTED OUT FOR MVP)
# POST /api/provider/bookings/:id/payment
# GET /api/provider/bookings/:id/invoice

# BOOKING HISTORY & ANALYTICS (COMMENTED OUT FOR MVP)
# GET /api/provider/bookings/history
# GET /api/provider/bookings/analytics
```


## Integration with Frontend

### Frontend State Management

**Office Browsing:**
```typescript
// Simple list, no complex filtering
const [offices, setOffices] = useState<OfficeSpace[]>([]);

// Fetch offices
const fetchOffices = async () => {
  const response = await fetch('/api/provider/offices');
  const data = await response.json();
  setOffices(data.data);
};
```

**Booking Creation:**
```typescript
const createBooking = async (bookingData: CreateBookingDto) => {
  const response = await fetch('/api/provider/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      officeId: bookingData.officeId,
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      duration: calculateDays(bookingData.startDate, bookingData.endDate),
      durationType: 'daily',
      totalAmount: calculateTotal(office.pricing.daily, days),
      specialRequests: bookingData.specialRequests
    })
  });
  
  const result = await response.json();
  if (result.success) {
    showSuccessMessage('Booking created successfully!');
  }
};
```

**My Bookings:**
```typescript
const [bookings, setBookings] = useState<Booking[]>([]);

const fetchMyBookings = async () => {
  const response = await fetch('/api/provider/bookings');
  const data = await response.json();
  setBookings(data.data);
};
```


## Database Queries

### Get Available Offices
```sql
SELECT 
  id, name, description, type, status,
  address, city, state, zip_code,
  capacity, area_sqft,
  daily_price,
  rating, total_bookings,
  images
FROM office_spaces
WHERE status = 'available'
ORDER BY created_at DESC;
```

### Create Booking
```sql
INSERT INTO office_bookings (
  id, office_space_id, provider_id,
  start_date, end_date, duration_days,
  daily_rate, total_amount,
  status, special_requests
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?);
```

### Get Provider Bookings
```sql
SELECT 
  b.id, b.start_date, b.end_date, b.duration_days,
  b.daily_rate, b.total_amount, b.status,
  b.special_requests, b.created_at, b.updated_at,
  o.id as office_id, o.name as office_name,
  o.type as office_type, o.address, o.city, o.state,
  o.images
FROM office_bookings b
INNER JOIN office_spaces o ON b.office_space_id = o.id
WHERE b.provider_id = ?
ORDER BY b.created_at DESC;
```


## Testing

### Test Scenario 1: Browse Offices
```bash
curl -X GET http://localhost:3001/api/provider/offices \
  -H "Authorization: Bearer {provider_token}"
```

### Test Scenario 2: Create Booking
```bash
curl -X POST http://localhost:3001/api/provider/bookings \
  -H "Authorization: Bearer {provider_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "officeId": "office_123",
    "startDate": "2025-02-01T09:00:00Z",
    "endDate": "2025-02-05T17:00:00Z",
    "duration": 4,
    "durationType": "daily",
    "totalAmount": 600.00,
    "specialRequests": "Need extra chairs"
  }'
```

### Test Scenario 3: View My Bookings
```bash
curl -X GET http://localhost:3001/api/provider/bookings \
  -H "Authorization: Bearer {provider_token}"
```


## Error Handling

**Common Error Codes:**
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid auth token
- `404 Not Found`: Office or booking not found
- `409 Conflict`: Office not available for selected dates
- `500 Internal Server Error`: Server error

**Example Error Response:**
```json
{
  "success": false,
  "error": "Office space is not available for the selected dates",
  "code": "OFFICE_NOT_AVAILABLE"
}
```


## Migration Path

When ready to add advanced features:

1. **Phase 2: Advanced Search**
   - Add query parameters for filtering
   - Implement search by location, price range, capacity
   - Add sorting options

2. **Phase 3: Reviews & Ratings**
   - Uncomment review endpoints
   - Add review creation and display
   - Calculate average ratings

3. **Phase 4: Booking Modifications**
   - Allow booking updates
   - Implement cancellation with policies
   - Add rescheduling functionality

4. **Phase 5: Payment Integration**
   - Add payment processing
   - Implement invoicing
   - Track payment status

