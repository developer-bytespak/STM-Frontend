# Office Space Booking Flow - User Guide

## Overview
This guide explains how service providers can browse and book office spaces with our intelligent pricing system that rewards longer bookings.

## For Service Providers

### Step 1: Browse Available Office Spaces

**Navigate to:** `/provider/office-booking`

**Features:**
- View all available office spaces in a beautiful grid layout
- Search by name, city, or description
- Filter by office type (Private Office, Meeting Room, etc.)
- Sort by price, rating, or capacity

**What You'll See:**
- Office photos or placeholder icons
- Office name and location
- Star rating and number of reviews
- Capacity (number of people) and area (square feet)
- Key amenities (WiFi, AC, Coffee, etc.)
- Starting price per hour or day
- Monthly pricing (if available) showing "Best Value!"

### Step 2: Click "Book Now"

**What Opens:**
A comprehensive booking modal showing:
- Office name and full address
- Date and time pickers for your booking period

### Step 3: Select Your Dates & Times

**Important Details:**
- **Start Date/Time**: When you want to begin using the space
- **End Date/Time**: When you want to finish using the space
- The system automatically calculates the duration
- End date/time must be after start date/time

**Example:**
```
Start: Dec 15, 2024 at 9:00 AM
End: Dec 25, 2024 at 5:00 PM
Duration: 10 days
```

### Step 4: Choose Your Pricing Option

**The Magic Happens Here! 🎉**

Once you select dates, the system shows ALL available pricing options with automatic savings calculations.

#### Pricing Options Explained

**Hourly Rate** ⏰
- Best for: Short meetings or quick sessions (< 1 day)
- Most flexible but highest cost per day
- Example: $50/hour

**Daily Rate** 📅
- Best for: 1-6 day bookings
- Save up to 20% vs hourly
- Example: $350/day (saves you $850 vs 8-hour hourly booking)

**Weekly Rate** 📆
- Best for: 1-4 week projects
- Save up to 35% vs daily rate
- Example: $2,000/week (saves you $450 vs 7-day daily booking)
- Usually marked as "⭐ RECOMMENDED" for 7-28 day bookings

**Monthly Rate** 🗓️
- Best for: Long-term needs (30+ days)
- Save up to 50% vs daily rate
- Example: $7,500/month (saves you $3,000 vs 30-day daily booking)
- Usually marked as "⭐ RECOMMENDED" for 30+ day bookings
- Shows "Best Value!" tag

#### What Each Option Shows:

```
┌─────────────────────────────────────┐
│ Weekly                 ⭐ Recommended│
│                        Save 25%      │
├─────────────────────────────────────┤
│ Duration: 2 weeks                    │
│                                      │
│ $4,000  total                        │
│                                      │
│ $285 per day                         │
│                                      │
│ 💰 You save $1,000                  │
└─────────────────────────────────────┘
```

### Step 5: Add Special Requests (Optional)

Examples of special requests:
- "Need video conferencing tested before meeting"
- "Require additional chairs for team session"
- "Late check-in needed"
- "Need parking validation"

### Step 6: Review Booking Summary

The summary shows:
- Office name
- Start date/time
- End date/time
- Duration
- Selected rate type
- **Total amount in large, bold text**
- Savings message (if applicable)

**Example Summary:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Booking Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Office: Executive Private Office
From: Dec 15, 2024 09:00
To: Dec 25, 2024 17:00
Duration: 2 weeks
Rate: Weekly

Total Amount: $4,000
You're saving $1,000 with this option!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 7: Confirm Booking

Click "Confirm Booking" button and you're done!

## Managing Your Bookings

### View All Bookings

**Navigate to:** `/provider/my-bookings`

**Dashboard Shows:**
- **Total Bookings**: All-time count
- **Upcoming**: Confirmed bookings starting in the future
- **Active Now**: Bookings currently in progress (shown in green)
- **Total Spent**: Total amount spent on all paid bookings

### Filter Your Bookings

**Filter Tabs:**
1. **All Bookings**: Everything
2. **Upcoming**: Future bookings you've made
3. **Active Now**: Bookings happening right now
4. **Past**: Completed or expired bookings

### Booking Card Information

Each booking shows:
- Office name
- Check-in date/time
- Check-out date/time
- Duration
- Booking ID (for reference)
- Total amount paid/owed
- Booking status (Pending, Confirmed, Cancelled, Completed)
- Payment status (Pending, Paid, Failed, Refunded)
- Special requests (if any were added)

### Cancel a Booking

For upcoming bookings:
1. Find the booking in your list
2. Click "Cancel Booking" button (red text)
3. Confirm cancellation

**Note**: You can only cancel bookings that:
- Haven't started yet (upcoming)
- Have "Confirmed" status

## Smart Pricing Examples

### Example 1: Quick Meeting (3 hours)
```
Office: Small Meeting Room
Duration: 3 hours
Available Option: Hourly

Hourly Rate:
- $40/hour × 3 hours = $120
- Price per day: $960 (if you booked full day)

Result: Perfect for short meetings!
```

### Example 2: Week-Long Project (7 days)
```
Office: Team Private Office
Duration: 7 days
Available Options:

Daily Rate:
- $600/day × 7 days = $4,200
- Price per day: $600

Weekly Rate ⭐ RECOMMENDED:
- $3,500/week × 1 week = $3,500
- Price per day: $500
- 💰 Save $700 (17%)

Result: Weekly rate saves you $700!
```

### Example 3: Monthly Commitment (30 days)
```
Office: Private Office
Duration: 30 days
Available Options:

Daily Rate:
- $350/day × 30 days = $10,500
- Price per day: $350

Weekly Rate:
- $2,000/week × 5 weeks = $10,000
- Price per day: $285
- 💰 Save $500 (5%) vs daily

Monthly Rate ⭐ RECOMMENDED:
- $7,500/month × 1 month = $7,500
- Price per day: $250
- 💰 Save $3,000 (29%) vs daily
- 💰 Save $2,500 (25%) vs weekly

Result: Monthly rate is the best value, saving you $3,000!
```

## Tips for Maximum Savings

### 1. Book Longer When Possible
If you're unsure how long you'll need space, consider booking for a full month rather than multiple weekly bookings:
- 4 weeks daily = Often 30-40% more expensive than 1 month

### 2. Compare Options
Always review all pricing options shown - sometimes the recommended option isn't what you expected!

### 3. Plan Ahead
Booking in advance gives you:
- Better availability
- More time to compare options
- Ability to choose preferred dates/times

### 4. Consider Partial Months
For 15-20 day needs:
- Compare: 3 weeks weekly vs. 20 days daily
- The system shows you the best value automatically

### 5. Use Amenities Wisely
If you need specific amenities:
- Filter by office type
- Check amenity icons on cards
- Mention in special requests if critical

## Pricing Information Banner

On the browse page, you'll see a helpful banner:

```
┌────────────────────────────────────────────────────────┐
│ Smart Pricing - Save More with Longer Bookings!       │
├────────────────────────────────────────────────────────┤
│ ⏰ Hourly: Most flexible                               │
│ 📅 Daily: Save up to 20%                               │
│ 📆 Weekly: Save up to 35%                              │
│ 🗓️ Monthly: Save up to 50%                            │
└────────────────────────────────────────────────────────┘
```

This reminds you of potential savings before you even click "Book Now"!

## Frequently Asked Questions

**Q: Can I modify my booking dates after confirmation?**
A: Not directly - you'll need to cancel and rebook. Future updates may add modification feature.

**Q: What if I need to extend my booking?**
A: Create a new booking for the additional time, or cancel and rebook for the full duration.

**Q: Are the savings percentages accurate?**
A: Yes! The system calculates exact savings based on the office's pricing structure.

**Q: Why don't I see hourly pricing for my 10-day booking?**
A: The system only shows practical options. Hourly rates aren't shown for multi-day bookings.

**Q: Can I book the same office multiple times?**
A: Yes! As long as the dates don't overlap and the office is available.

**Q: How do I know if an office is available?**
A: The browse page only shows "Available" offices. The booking modal will prevent overlapping bookings.

**Q: What payment methods are accepted?**
A: This depends on your platform's payment integration (to be implemented).

**Q: Can I get a refund if I cancel?**
A: Refund policies should be checked before booking (to be implemented in future version).

## Visual Guide: Booking Flow

```
Browse Offices Page
        ↓
  Click "Book Now"
        ↓
Booking Modal Opens
        ↓
Select Start Date/Time
        ↓
Select End Date/Time
        ↓
System Calculates All Options
        ↓
Review Pricing Options
  (Hourly, Daily, Weekly, Monthly)
        ↓
Select Best Option for You
        ↓
Add Special Requests (Optional)
        ↓
Review Booking Summary
        ↓
Click "Confirm Booking"
        ↓
Success! ✅
        ↓
View in "My Bookings"
```

## Support

For issues or questions about office bookings, contact your platform administrator.

---

**Happy Booking! 🏢✨**

Remember: Longer bookings = bigger savings! The system makes it easy to see exactly how much you save with each option.

