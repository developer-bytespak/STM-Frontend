# Office Space & Real Estate Module Implementation

## Overview
This document outlines the implementation of the Shared Office & Real Estate Module for the STM admin frontend dashboard. The module allows admins to create, manage, and monitor office space listings that service providers can book.

## Features Implemented

### 1. Admin - Office Space Management
- **Create Office Listings**: Multi-step wizard to create new office space listings
- **Edit Office Details**: Modal to update existing office space information
- **Delete Office Spaces**: Ability to remove office listings
- **View/List Modes**: Toggle between grid and list views for office spaces
- **Analytics Dashboard**: Comprehensive metrics and insights

### 2. Provider - Browse & Book Offices
- **Browse Available Spaces**: View all available office spaces with rich details
- **Advanced Search & Filtering**: Search by name/city, filter by type, sort by price/rating/capacity
- **Date/Time Selection**: Pick specific start and end dates with time
- **Smart Pricing Display**: See all pricing options with automatic savings calculations
- **Booking Modal**: Complete booking flow with pricing comparison
- **Special Requests**: Add notes or special requirements to bookings

### 3. Provider - Manage Bookings
- **My Bookings Dashboard**: View all bookings with stats (total, upcoming, active, spent)
- **Filter Bookings**: Filter by All, Upcoming, Active Now, or Past
- **Booking Details**: See complete booking information including dates, pricing, status
- **Cancel Bookings**: Cancel upcoming bookings
- **Payment Tracking**: View payment status for each booking

### 2. Office Space Types
The system supports 5 different types of office spaces:
- **Private Office**: Dedicated private offices for individuals or small teams
- **Shared Desk**: Hotdesking in coworking environments
- **Meeting Room**: Small to medium meeting rooms
- **Conference Room**: Large conference rooms for presentations
- **Coworking Space**: Dedicated desks in shared workspaces

### 3. Comprehensive Filtering & Search
- Search by name, city, or description
- Filter by status (Available, Occupied, Maintenance, Booked)
- Filter by office type
- Real-time filtering with instant results

### 4. Booking System
- View all bookings across all office spaces
- View bookings per office space
- Detailed booking information including:
  - Provider details
  - Booking dates and duration
  - Payment status (Pending, Paid, Failed, Refunded)
  - Booking status (Pending, Confirmed, Cancelled, Completed)
  - Total amount

### 5. Analytics Dashboard
Comprehensive analytics showing:
- Total office spaces
- Available vs. Occupied spaces
- Total bookings (all-time and active)
- Revenue metrics (total and monthly)
- Occupancy rate percentage
- Average booking duration

### 6. Dynamic Pricing System with Savings Incentives
Each office space supports multiple pricing options with smart pricing that incentivizes longer bookings:
- **Hourly rates** (optional) - Most flexible, highest cost per day
- **Daily rates** (required) - Save up to 20% vs hourly
- **Weekly rates** (optional) - Save up to 35% vs daily
- **Monthly rates** (optional) - Save up to 50% vs daily (Best Value!)

The system automatically calculates all available pricing options based on selected dates and shows:
- Total price for each option
- Price per day comparison
- Savings amount and percentage
- Recommended option based on duration

## File Structure

```
STM-Frontend/
├── src/
│   ├── types/
│   │   └── office.ts                           # TypeScript types and interfaces
│   ├── data/
│   │   └── mockOfficeData.ts                   # Mock data for development
│   ├── lib/
│   │   └── pricingCalculator.ts                # Dynamic pricing calculator
│   ├── components/
│   │   ├── cards/
│   │   │   └── OfficeCard.tsx                  # Office space display card
│   │   ├── booking/
│   │   │   └── OfficeBookingModal.tsx          # Provider booking modal
│   │   └── admin/
│   │       ├── CreateOfficeModal.tsx           # Create office wizard
│   │       ├── EditOfficeModal.tsx             # Edit office modal
│   │       ├── OfficeAnalyticsCard.tsx         # Analytics dashboard
│   │       └── OfficeBookingsList.tsx          # Bookings table
│   └── app/
│       ├── admin/
│       │   └── offices/
│       │       └── page.tsx                    # Admin office management
│       └── provider/
│           ├── office-booking/
│           │   └── page.tsx                    # Browse & book offices
│           └── my-bookings/
│               └── page.tsx                    # Provider bookings management
└── docs/
    └── OFFICE_SPACE_MODULE_IMPLEMENTATION.md   # This file
```

## Components

### 1. Office Management Page (`/admin/offices`)
**Location**: `src/app/admin/offices/page.tsx`

**Features**:
- Tabbed interface (Office Spaces / All Bookings)
- Advanced search and filtering
- Grid/List view toggle
- Create, edit, delete operations
- Analytics overview

**State Management**:
```typescript
- offices: List of all office spaces
- filteredOffices: Filtered list based on search/filters
- searchQuery: Current search text
- statusFilter: Selected status filter
- typeFilter: Selected type filter
- viewMode: Grid or list view
- showBookings: Toggle between offices and bookings view
```

### 2. Create Office Modal
**Location**: `src/components/admin/CreateOfficeModal.tsx`

**Features**:
- 5-step wizard process:
  1. Basic Information (name, type, description)
  2. Location (address, city, state, ZIP)
  3. Details (capacity, area)
  4. Pricing (hourly, daily, weekly, monthly)
  5. Amenities (multi-select from 15 options)
- Form validation at each step
- Progress indicator
- Step navigation (Previous/Next)

### 3. Edit Office Modal
**Location**: `src/components/admin/EditOfficeModal.tsx`

**Features**:
- Single-page form with all editable fields
- Status update capability
- Amenity management
- Real-time updates

### 4. Office Card
**Location**: `src/components/cards/OfficeCard.tsx`

**Features**:
- Visual office space representation
- Status and type badges
- Key metrics (capacity, area, rating, bookings)
- Amenity preview (first 4 with "more" indicator)
- Pricing display
- Action buttons (View Bookings, Edit, Delete)

### 5. Analytics Card
**Location**: `src/components/admin/OfficeAnalyticsCard.tsx`

**Features**:
- 8 key metrics displayed in grid
- Color-coded stat cards
- Icons for visual representation
- Responsive layout (1-4 columns based on screen size)

### 6. Bookings List
**Location**: `src/components/admin/OfficeBookingsList.tsx`

**Features**:
- Comprehensive booking table
- Provider information
- Date ranges and duration
- Payment status badges
- Booking status badges
- Empty state handling

### 7. Provider Office Browse Page
**Location**: `src/app/provider/office-booking/page.tsx`

**Features**:
- Browse all available office spaces
- Search and filtering by type
- Sort by price, rating, or capacity
- Pricing info banner showing savings opportunities
- Beautiful card-based layout
- One-click "Book Now" button

### 8. Office Booking Modal
**Location**: `src/components/booking/OfficeBookingModal.tsx`

**Features**:
- Date/time range picker
- Automatic pricing calculation
- Multiple pricing options display
- Visual comparison of all rates
- Recommended option highlighting
- Savings badges showing % saved
- Special requests field
- Booking summary with total cost
- Real-time validation

### 9. Provider My Bookings Page
**Location**: `src/app/provider/my-bookings/page.tsx`

**Features**:
- Statistics dashboard (total, upcoming, active, total spent)
- Filter tabs (All, Upcoming, Active Now, Past)
- Detailed booking cards
- Active booking highlighting
- Cancel booking functionality
- Payment status tracking
- Booking ID for reference

### 10. Pricing Calculator Library
**Location**: `src/lib/pricingCalculator.ts`

**Core Functions**:
```typescript
calculateBookingPrice(office, startDate, endDate)
// Returns array of all pricing options with:
// - duration and durationType
// - basePrice and totalPrice
// - pricePerDay (for comparison)
// - savings amount and percentage
// - recommended flag

getBestPricingOption(office, startDate, endDate)
// Returns the best value option (lowest price per day)

isOfficeAvailable(office, startDate, endDate, existingBookings)
// Checks availability considering status, schedule, and conflicts

formatPrice(price)
// Formats number as currency ($X,XXX)
```

## Data Types

### OfficeSpace
```typescript
{
  id: string;
  name: string;
  type: OfficeSpaceType;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  capacity: number;
  area: number;
  pricing: {
    hourly?: number;
    daily: number;
    weekly?: number;
    monthly?: number;
  };
  amenities: Amenity[];
  images: string[];
  status: OfficeStatus;
  totalBookings: number;
  rating: number;
  reviews: number;
}
```

### OfficeBooking
```typescript
{
  id: string;
  officeId: string;
  officeName: string;
  providerId: string;
  providerName: string;
  providerEmail: string;
  startDate: string;
  endDate: string;
  duration: number;
  durationType: 'hourly' | 'daily' | 'weekly' | 'monthly';
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
}
```

### OfficeAnalytics
```typescript
{
  totalSpaces: number;
  availableSpaces: number;
  occupiedSpaces: number;
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  occupancyRate: number;
  // ... more analytics data
}
```

## Dynamic Pricing System Explained

### How It Works

The pricing calculator analyzes the selected booking duration and presents all applicable pricing options, automatically calculating savings:

**Example: 10-Day Booking**

For an office with:
- Hourly: $50/hour
- Daily: $350/day
- Weekly: $2,000/week
- Monthly: $7,500/month

When booking for 10 days (240 hours):

```
Option 1: Hourly Rate
- 240 hours × $50 = $12,000
- Price per day: $1,200
- ❌ Most expensive

Option 2: Daily Rate ⭐ RECOMMENDED
- 10 days × $350 = $3,500
- Price per day: $350
- ✅ Save $8,500 (71%) vs hourly

Option 3: Weekly Rate
- 2 weeks × $2,000 = $4,000
- Price per day: $285 (for 14 days)
- Covers 14 days but you only need 10
- Not shown (doesn't make sense for 10 days)
```

**Example: 30-Day Booking**

```
Option 1: Daily Rate
- 30 days × $350 = $10,500
- Price per day: $350

Option 2: Weekly Rate
- 5 weeks × $2,000 = $10,000
- Price per day: $285
- ✅ Save $500 (5%) vs daily

Option 3: Monthly Rate ⭐ RECOMMENDED
- 1 month × $7,500 = $7,500
- Price per day: $250
- ✅ Save $3,000 (29%) vs daily
- ✅ Save $2,500 (25%) vs weekly
```

### Intelligent Recommendations

The system automatically recommends the best option based on:
1. **Duration Match**: Options that best match the booking period
2. **Best Value**: Lowest price per day
3. **Practical Sense**: Doesn't recommend weekly for 3-day bookings

### Visual Indicators

- **⭐ Recommended Badge**: Best option for the selected duration
- **Save X% Badge**: Shows percentage saved vs. shorter durations
- **Price per Day**: Always shown for easy comparison
- **Green Highlights**: Savings messages in green
- **Border Highlight**: Selected option has navy border

## Mock Data

### Office Spaces (8 Sample Listings)
1. **Executive Private Office** - 4 people, $350/day
2. **Modern Conference Room** - 12 people, $500/day
3. **Coworking Hotdesk** - 1 person, $50/day
4. **Team Private Office** - 8 people, $600/day
5. **Small Meeting Room** - 6 people, $250/day
6. **Premium Coworking Space** - 2 people, $75/day
7. **Executive Meeting Suite** - 10 people, $700/day
8. **Tech Startup Office** - 15 people, $800/day

### Amenities (15 Options)
- High-Speed WiFi
- Air Conditioning
- Coffee Machine
- Printer/Scanner
- Whiteboard
- Projector
- Standing Desk
- Parking
- Reception Service
- Kitchen Access
- Meeting Rooms
- 24/7 Access
- Phone Booth
- Lounge Area
- Video Conference Setup

### Bookings (6 Sample Records)
Various bookings with different:
- Providers
- Booking durations
- Payment statuses
- Booking statuses

## UI/UX Features

### Visual Design
- Clean, modern card-based layout
- Color-coded status badges
- Icon-driven amenity display
- Responsive grid system
- Hover effects and transitions

### User Experience
- Intuitive search and filtering
- Quick-action buttons on cards
- Multi-step wizard with progress indicator
- Tabbed interface for organized views
- Empty states with helpful messages
- Loading states for async operations

### Accessibility
- Semantic HTML structure
- ARIA labels where appropriate
- Keyboard navigation support
- Focus states on interactive elements
- Color contrast compliance

## Integration Points

### Backend API (To Be Implemented)
```typescript
// Office Space APIs
POST   /api/admin/offices           - Create office space
GET    /api/admin/offices           - Get all office spaces
GET    /api/admin/offices/:id       - Get office space by ID
PUT    /api/admin/offices/:id       - Update office space
DELETE /api/admin/offices/:id       - Delete office space

// Booking APIs
GET    /api/admin/office-bookings                 - Get all bookings
GET    /api/admin/office-bookings/office/:id      - Get bookings by office
POST   /api/provider/office-bookings               - Create booking
PUT    /api/provider/office-bookings/:id/cancel   - Cancel booking

// Analytics APIs
GET    /api/admin/office-analytics   - Get office analytics
```

### Provider Integration
For service providers to book office spaces, implement:
- Office space browsing page
- Booking form/modal
- My bookings page
- Payment integration

## Future Enhancements

### Phase 2 Features
1. **Advanced Booking Management**
   - Calendar view for availability
   - Recurring bookings
   - Booking conflicts detection
   - Automated reminders

2. **Enhanced Analytics**
   - Revenue trends by time period
   - Popular amenities analysis
   - Peak booking times
   - Provider booking patterns

3. **Payment Processing**
   - Integrated payment gateway
   - Invoice generation
   - Refund management
   - Payment history

4. **Additional Features**
   - Image upload for office spaces
   - Virtual tours/360° photos
   - Reviews and ratings from providers
   - Availability calendar
   - Automated pricing (dynamic pricing)
   - Discount codes/promotions

5. **Provider Portal**
   - Browse available office spaces
   - Real-time availability checking
   - Booking history
   - Payment methods management
   - Favorite/saved spaces

## Testing Checklist

### Functionality Testing
- [ ] Create office space
- [ ] Edit office space details
- [ ] Delete office space
- [ ] Search offices by name/city
- [ ] Filter by status
- [ ] Filter by type
- [ ] Toggle grid/list view
- [ ] View bookings per office
- [ ] View all bookings
- [ ] Analytics data display

### UI/UX Testing
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Modal interactions
- [ ] Form validation
- [ ] Empty states
- [ ] Loading states
- [ ] Error handling

### Data Validation
- [ ] Required fields validation
- [ ] Number input validation
- [ ] Date validation
- [ ] Pricing validation
- [ ] Capacity limits

## Developer Notes

### Using Mock Data
The system currently uses mock data from `src/data/mockOfficeData.ts`. To integrate with real APIs:

1. Replace mock data imports with API calls
2. Use React Query or similar for data fetching
3. Implement error handling
4. Add loading states
5. Handle edge cases

### Customization
To customize the module:

1. **Add New Office Types**: Update `OfficeSpaceType` in `types/office.ts`
2. **Add Amenities**: Update `availableAmenities` in `mockOfficeData.ts`
3. **Modify Pricing Structure**: Update pricing interface in `types/office.ts`
4. **Add Analytics Metrics**: Extend `OfficeAnalytics` interface

## Conclusion

This implementation provides a comprehensive foundation for managing office spaces and real estate within the STM platform. The modular architecture, TypeScript type safety, and use of mock data make it easy to develop and test before backend integration.

The system is production-ready for the frontend and awaits backend API implementation for full functionality.

