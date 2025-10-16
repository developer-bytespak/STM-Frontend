import { OfficeSpace } from '@/types/office';

export interface PricingBreakdown {
  duration: number;
  durationType: 'hourly' | 'daily' | 'weekly' | 'monthly';
  basePrice: number;
  totalPrice: number;
  pricePerDay: number;
  savings?: number;
  savingsPercentage?: number;
  recommended?: boolean;
}

/**
 * Calculate the price for booking an office space for a given duration
 * Longer bookings get better rates per day
 */
export function calculateBookingPrice(
  office: OfficeSpace,
  startDate: Date,
  endDate: Date
): PricingBreakdown[] {
  const hoursDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
  const daysDiff = Math.ceil(hoursDiff / 24);

  const options: PricingBreakdown[] = [];

  // Hourly pricing (if less than 1 day and hourly rate available)
  if (office.pricing.hourly && hoursDiff < 24) {
    const totalPrice = office.pricing.hourly * hoursDiff;
    const pricePerDay = office.pricing.hourly * 24;
    
    options.push({
      duration: hoursDiff,
      durationType: 'hourly',
      basePrice: office.pricing.hourly,
      totalPrice,
      pricePerDay,
    });
  }

  // Daily pricing
  if (office.pricing.daily) {
    const totalPrice = office.pricing.daily * daysDiff;
    const pricePerDay = office.pricing.daily;
    
    // Only compare with hourly if no weekly/monthly options are available
    let savings = 0;
    let savingsPercentage = 0;
    if (office.pricing.hourly && daysDiff >= 1 && 
        (!office.pricing.weekly || daysDiff < 7) && 
        (!office.pricing.monthly || daysDiff < 30)) {
      const hourlyTotal = office.pricing.hourly * (daysDiff * 24);
      savings = hourlyTotal - totalPrice;
      savingsPercentage = (savings / hourlyTotal) * 100;
    }
    
    options.push({
      duration: daysDiff,
      durationType: 'daily',
      basePrice: office.pricing.daily,
      totalPrice,
      pricePerDay,
      savings: savings > 0 ? savings : undefined,
      savingsPercentage: savingsPercentage > 0 ? savingsPercentage : undefined,
    });
  }

  // Weekly pricing (if 7+ days and weekly rate available)
  if (office.pricing.weekly && daysDiff >= 7) {
    const weeks = Math.ceil(daysDiff / 7);
    const totalPrice = office.pricing.weekly * weeks;
    const pricePerDay = totalPrice / (weeks * 7);
    
    // Always compare with daily pricing for weekly options
    let savings = 0;
    let savingsPercentage = 0;
    if (office.pricing.daily) {
      const dailyTotal = office.pricing.daily * (weeks * 7);
      savings = dailyTotal - totalPrice;
      savingsPercentage = (savings / dailyTotal) * 100;
    }
    
    options.push({
      duration: weeks,
      durationType: 'weekly',
      basePrice: office.pricing.weekly,
      totalPrice,
      pricePerDay,
      savings: savings > 0 ? savings : undefined,
      savingsPercentage: savingsPercentage > 0 ? savingsPercentage : undefined,
    });
  }

  // Monthly pricing (if 30+ days and monthly rate available)
  if (office.pricing.monthly && daysDiff >= 30) {
    const months = Math.ceil(daysDiff / 30);
    const totalPrice = office.pricing.monthly * months;
    const pricePerDay = totalPrice / (months * 30);
    
    // Compare with weekly pricing first, then daily as fallback
    let savings = 0;
    let savingsPercentage = 0;
    if (office.pricing.weekly) {
      const weeklyTotal = office.pricing.weekly * Math.ceil((months * 30) / 7);
      savings = weeklyTotal - totalPrice;
      savingsPercentage = (savings / weeklyTotal) * 100;
    } else if (office.pricing.daily) {
      const dailyTotal = office.pricing.daily * (months * 30);
      savings = dailyTotal - totalPrice;
      savingsPercentage = (savings / dailyTotal) * 100;
    }
    
    options.push({
      duration: months,
      durationType: 'monthly',
      basePrice: office.pricing.monthly,
      totalPrice,
      pricePerDay,
      savings: savings > 0 ? savings : undefined,
      savingsPercentage: savingsPercentage > 0 ? savingsPercentage : undefined,
    });
  }

  // Sort by actual total cost for the customer's required duration (best value first)
  const sortedOptions = options.sort((a, b) => {
    // Primary sort: lowest total cost for the customer's actual needs
    if (a.totalPrice !== b.totalPrice) {
      return a.totalPrice - b.totalPrice;
    }
    // Secondary sort: if same cost, prefer shorter duration (more flexible)
    return a.duration - b.duration;
  });
  
  // Mark the best value option as recommended and calculate proper savings
  if (sortedOptions.length > 0) {
    const bestOption = sortedOptions[0];
    bestOption.recommended = true;
    
    // Calculate savings compared to the most expensive option
    const mostExpensiveOption = sortedOptions[sortedOptions.length - 1];
    const mostExpensiveTotal = mostExpensiveOption.totalPrice;
    
    for (let i = 0; i < sortedOptions.length; i++) {
      const option = sortedOptions[i];
      
      if (i === 0) {
        // Best option - no savings shown (it's the baseline)
        option.savings = undefined;
        option.savingsPercentage = undefined;
      } else {
        // Calculate savings compared to most expensive option
        const savings = mostExpensiveTotal - option.totalPrice;
        const savingsPercentage = (savings / mostExpensiveTotal) * 100;
        
        option.savings = savings > 0 ? savings : undefined;
        option.savingsPercentage = savingsPercentage > 0 ? savingsPercentage : undefined;
      }
      
      option.recommended = i === 0;
    }
  }
  
  return sortedOptions;
}

/**
 * Get the best pricing option for a given duration
 */
export function getBestPricingOption(
  office: OfficeSpace,
  startDate: Date,
  endDate: Date
): PricingBreakdown | null {
  const options = calculateBookingPrice(office, startDate, endDate);
  return options.length > 0 ? options[0] : null;
}

/**
 * Check if office is available for booking in the given time range
 * This is a simple check - in production, you'd check against actual bookings
 */
export function isOfficeAvailable(
  office: OfficeSpace,
  startDate: Date,
  endDate: Date,
  existingBookings: any[] = []
): boolean {
  // Check if office status allows booking
  if (office.status !== 'available') {
    return false;
  }

  // Check day of week availability
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof office.availability;
    
    if (!office.availability[dayName]?.available) {
      return false;
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Check for booking conflicts (simplified - in production, check time overlaps)
  const hasConflict = existingBookings.some(booking => {
    const bookingStart = new Date(booking.startDate);
    const bookingEnd = new Date(booking.endDate);
    
    return (
      (startDate >= bookingStart && startDate <= bookingEnd) ||
      (endDate >= bookingStart && endDate <= bookingEnd) ||
      (startDate <= bookingStart && endDate >= bookingEnd)
    );
  });

  return !hasConflict;
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Get pricing comparison message
 */
export function getPricingComparisonMessage(breakdown: PricingBreakdown): string {
  if (!breakdown.savings || !breakdown.savingsPercentage) {
    return '';
  }

  return `Save ${formatPrice(breakdown.savings)} (${breakdown.savingsPercentage.toFixed(0)}%) compared to shorter duration`;
}

