'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { OfficeSpace } from '@/types/office';
// COMMENTED OUT - Complex pricing calculator
// import { calculateBookingPrice, formatPrice, PricingBreakdown } from '@/lib/pricingCalculator';
import Badge from '@/components/ui/Badge';

interface OfficeBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  office: OfficeSpace | null;
  onSuccess?: () => void;
}

export default function OfficeBookingModal({ isOpen, onClose, office, onSuccess }: OfficeBookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('17:00');
  // COMMENTED OUT - Complex pricing options
  // const [selectedPricing, setSelectedPricing] = useState<PricingBreakdown | null>(null);
  // const [pricingOptions, setPricingOptions] = useState<PricingBreakdown[]>([]);
  const [specialRequests, setSpecialRequests] = useState('');

  // COMMENTED OUT - Complex pricing calculation
  // useEffect(() => {
  //   if (office && startDate && endDate) {
  //     const start = new Date(`${startDate}T${startTime}`);
  //     const end = new Date(`${endDate}T${endTime}`);
      
  //     if (end > start) {
  //       const options = calculateBookingPrice(office, start, end);
  //       setPricingOptions(options);
        
  //       // Auto-select recommended option
  //       const recommended = options.find(o => o.recommended) || options[0];
  //       setSelectedPricing(recommended || null);
  //     } else {
  //       setPricingOptions([]);
  //       setSelectedPricing(null);
  //     }
  //   }
  // }, [office, startDate, startTime, endDate, endTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!office || !startDate || !endDate) return;

    setLoading(true);
    try {
      // SIMPLIFIED - Calculate daily rate booking
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${endDate}T${endTime}`);
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const totalAmount = daysDiff * office.pricing.daily;
      
      // TODO: Replace with actual API call
      const bookingData = {
        officeId: office.id,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        duration: daysDiff,
        durationType: 'daily',
        totalAmount,
        specialRequests,
      };
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Creating booking:', bookingData);
      
      // Show success message
      setShowSuccess(true);
      
      // Call onSuccess callback
      onSuccess?.();
      
      // Auto-close modal after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Error creating booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStartDate('');
    setStartTime('09:00');
    setEndDate('');
    setEndTime('17:00');
    // COMMENTED OUT - Complex pricing state
    // setSelectedPricing(null);
    // setPricingOptions([]);
    setSpecialRequests('');
    setShowSuccess(false);
    onClose();
  };

  if (!office) return null;

  // COMMENTED OUT - Complex pricing helper functions
  // const getPricingTypeLabel = (type: string) => {
  //   const labels: Record<string, string> = {
  //     hourly: 'Hourly',
  //     daily: 'Daily',
  //     weekly: 'Weekly',
  //     monthly: 'Monthly',
  //   };
  //   return labels[type] || type;
  // };

  // const getPricingDurationText = (pricing: PricingBreakdown) => {
  //   // Map duration types to proper singular/plural forms
  //   const durationMap = {
  //     hourly: pricing.duration > 1 ? 'hours' : 'hour',
  //     daily: pricing.duration > 1 ? 'days' : 'day',
  //     weekly: pricing.duration > 1 ? 'weeks' : 'week',
  //     monthly: pricing.duration > 1 ? 'months' : 'month'
  //   };
  //   return `${pricing.duration} ${durationMap[pricing.durationType]}`;
  // };

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="4xl">
      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Booking Successful!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Your office space has been booked successfully. You will receive a confirmation email shortly.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Book Office Space</h2>
          <p className="text-sm text-gray-600 mt-1">{office.name}</p>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span>{office.location.address}, {office.location.city}, {office.location.state}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date & Time Selection */}
          <div className="bg-blue-50 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Select Booking Period</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date & Time */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Start Date & Time</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={today}
                    required
                  />
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* End Date & Time */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">End Date & Time</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || today}
                    required
                  />
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {startDate && endDate && new Date(`${endDate}T${endTime}`) <= new Date(`${startDate}T${startTime}`) && (
              <p className="text-sm text-red-600">End date/time must be after start date/time</p>
            )}
          </div>

          {/* COMMENTED OUT - Complex Pricing Options */}
          {/* {pricingOptions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Choose Your Pricing Option</h3>
              <p className="text-sm text-gray-600">
                Longer bookings save you more! Select the option that works best for you.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pricingOptions.map((pricing, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedPricing(pricing)}
                    className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all ${
                      selectedPricing?.durationType === pricing.durationType
                        ? 'border-navy-600 bg-navy-50 shadow-md'
                        : 'border-gray-200 hover:border-navy-300 bg-white'
                    }`}
                  >
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-bold text-gray-900">
                          {getPricingTypeLabel(pricing.durationType)}
                        </h4>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-navy-600">
                          {formatPrice(pricing.totalPrice)}
                        </span>
                        <span className="text-sm text-gray-500">total</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )} */}

          {/* COMMENTED OUT - Special Requests */}
          {/* {selectedPricing && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Special Requests (Optional)
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Any special requirements or requests for your booking..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              />
            </div>
          )} */}

          {/* SIMPLIFIED - Show special requests always (not just when pricing selected) */}
          {startDate && endDate && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Special Requests (Optional)
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Any special requirements or requests..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              />
            </div>
          )}

          {/* SIMPLIFIED - Daily Rate Booking Summary */}
          {office && startDate && endDate && (
            <div className="bg-gradient-to-br from-navy-600 to-blue-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-100">Office:</span>
                  <span className="font-semibold">{office.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-100">From:</span>
                  <span className="font-semibold">{startDate} {startTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-100">To:</span>
                  <span className="font-semibold">{endDate} {endTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-100">Daily Rate:</span>
                  <span className="font-semibold">${office.pricing.daily}/day</span>
                </div>
                
                <div className="border-t border-blue-400 my-3 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <span className="text-2xl font-bold">${(() => {
                      const start = new Date(`${startDate}T${startTime}`);
                      const end = new Date(`${endDate}T${endTime}`);
                      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                      return (daysDiff * office.pricing.daily).toFixed(2);
                    })()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={!startDate || !endDate}
            >
              Confirm Booking
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

