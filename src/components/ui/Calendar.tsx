'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  unavailableDates: Array<{
    start: string;
    end: string;
    status: string;
  }>;
  minDate?: string;
  className?: string;
}

export default function Calendar({
  selectedDate,
  onDateSelect,
  unavailableDates,
  minDate,
  className = ''
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const minSelectableDate = minDate || today;

  // Calculate calendar position when it opens
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const calendarWidth = 300; // Approximate calendar width
      const calendarHeight = 350; // Approximate calendar height
      
      // Calculate available space below the button
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      let top = rect.bottom + 8; // Default: below the button
      let left = rect.left;
      
      // If not enough space below, try to center it vertically
      if (spaceBelow < calendarHeight) {
        // Position it in the middle of available space
        const availableHeight = viewportHeight - 16; // 8px margin on each side
        const centerY = viewportHeight / 2;
        top = Math.max(8, centerY - calendarHeight / 2);
        
        // If still doesn't fit, position it above the button
        if (top + calendarHeight > viewportHeight - 8) {
          top = Math.max(8, rect.top - calendarHeight - 8);
        }
      }
      
      // Ensure calendar stays within viewport horizontally
      if (left + calendarWidth > viewportWidth) {
        left = viewportWidth - calendarWidth - 8;
      }
      if (left < 8) {
        left = 8;
      }
      
      setCalendarPosition({ top, left });
    }
  }, [isOpen]);

  // Check if a date is unavailable
  const isDateUnavailable = (date: string) => {
    if (!date || unavailableDates.length === 0) return false;
    
    const checkDate = new Date(date);
    return unavailableDates.some(period => {
      const startDate = new Date(period.start);
      const endDate = new Date(period.end);
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  // Check if a date is in the past
  const isDateInPast = (date: string) => {
    return new Date(date) < new Date(minSelectableDate);
  };

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push(dateString);
    }
    
    return days;
  };

  const days = getCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const handleDateClick = (date: string) => {
    if (isDateUnavailable(date) || isDateInPast(date)) {
      return;
    }
    onDateSelect(date);
    setIsOpen(false);
  };

  const formatDisplayDate = (date: string | null) => {
    if (!date) return 'Select date';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`relative ${className}`}>
      {/* Date Input Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 text-left border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          selectedDate && isDateUnavailable(selectedDate)
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 bg-white'
        }`}
      >
        <span className={selectedDate && isDateUnavailable(selectedDate) ? 'text-red-600' : 'text-gray-900'}>
          {formatDisplayDate(selectedDate)}
        </span>
        {selectedDate && isDateUnavailable(selectedDate) && (
          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Booked
          </span>
        )}
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          {/* Calendar */}
          <div 
            className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-[60] w-[300px] max-h-[350px] overflow-y-auto"
            style={{
              top: `${calendarPosition.top}px`,
              left: `${calendarPosition.left}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <h3 className="text-lg font-semibold">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            
            <button
              type="button"
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) {
                return <div key={index} className="h-7" />;
              }

              const isUnavailable = isDateUnavailable(day);
              const isPast = isDateInPast(day);
              const isSelected = selectedDate === day;
              const isToday = day === today;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  disabled={isUnavailable || isPast}
                  className={`
                    h-7 w-7 text-xs rounded-md transition-colors
                    ${isSelected 
                      ? 'bg-blue-600 text-white font-semibold' 
                      : isUnavailable
                        ? 'bg-red-100 text-red-600 cursor-not-allowed'
                        : isPast
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'hover:bg-gray-100 text-gray-900'
                    }
                    ${isToday && !isSelected ? 'ring-2 ring-blue-300' : ''}
                  `}
                  title={
                    isUnavailable 
                      ? 'This date is already booked' 
                      : isPast 
                        ? 'This date is in the past'
                        : `Select ${day}`
                  }
                >
                  {day.split('-')[2]}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-100 rounded mr-2"></div>
                <span>Booked</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 ring-2 ring-blue-300 rounded mr-2"></div>
                <span>Today</span>
              </div>
            </div>
          </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
