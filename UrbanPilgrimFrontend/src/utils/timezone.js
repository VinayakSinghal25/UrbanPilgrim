// Available timezones for selection
export const AVAILABLE_TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)', offset: '+05:30' },
  { value: 'America/New_York', label: 'America/New_York (EST)', offset: '-05:00' },
  { value: 'Europe/London', label: 'Europe/London (GMT)', offset: '+00:00' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)', offset: '+04:00' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)', offset: '+08:00' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEDT)', offset: '+11:00' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)', offset: '-08:00' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET)', offset: '+01:00' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)', offset: '+09:00' },
];

// Get timezone offset in hours
export const getTimezoneOffset = (timezone) => {
  const tz = AVAILABLE_TIMEZONES.find(t => t.value === timezone);
  return tz ? tz.offset : '+05:30'; // Default to IST
};

// Convert time from one timezone to another
export const convertTimeToTimezone = (timeString, date, fromTimezone, toTimezone) => {
  // If same timezone, return original time
  if (fromTimezone === toTimezone) {
    return timeString;
  }

  try {
    // Create a date object with the time in the source timezone
    const [hours, minutes] = timeString.split(':').map(Number);
    const dateTime = new Date(date);
    dateTime.setHours(hours, minutes, 0, 0);

    // Simple offset calculation (this is a basic implementation)
    // In production, use a proper timezone library like moment-timezone or date-fns-tz
    const fromOffset = getOffsetInMinutes(fromTimezone);
    const toOffset = getOffsetInMinutes(toTimezone);
    const diffMinutes = toOffset - fromOffset;
    
    dateTime.setMinutes(dateTime.getMinutes() + diffMinutes);
    
    // Format back to HH:MM
    return dateTime.toTimeString().slice(0, 5);
  } catch (error) {
    console.error('Error converting timezone:', error);
    return `${timeString} (${toTimezone})`;
  }
};

// Get offset in minutes from UTC
const getOffsetInMinutes = (timezone) => {
  const offsetMap = {
    'Asia/Kolkata': 330,        // +05:30
    'America/New_York': -300,   // -05:00
    'Europe/London': 0,         // +00:00
    'Asia/Dubai': 240,          // +04:00
    'Asia/Singapore': 480,      // +08:00
    'Australia/Sydney': 660,    // +11:00
    'America/Los_Angeles': -480, // -08:00
    'Europe/Paris': 60,         // +01:00
    'Asia/Tokyo': 540,          // +09:00
  };
  
  return offsetMap[timezone] || 330; // Default to IST
};

// Format date for display
export const formatDateDisplay = (date) => {
  const options = { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long',
    year: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
};

// Format date to "Monday, 25th July" format
export const formatDateShort = (date) => {
  const options = { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long'
  };
  const formatted = date.toLocaleDateString('en-US', options);
  
  // Add ordinal suffix to day
  const day = date.getDate();
  const suffix = getOrdinalSuffix(day);
  
  return formatted.replace(day.toString(), day + suffix);
};

// Get ordinal suffix for day (1st, 2nd, 3rd, etc.)
const getOrdinalSuffix = (day) => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

// Get day of week from date
export const getDayOfWeek = (date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

// Check if a time slot is in the past
export const isTimeSlotPast = (date, timeString, timezone = 'Asia/Kolkata') => {
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    const slotDateTime = new Date(date);
    slotDateTime.setHours(hours, minutes, 0, 0);
    
    return slotDateTime < new Date();
  } catch (error) {
    return false;
  }
};

// Group time slots by date
export const groupTimeSlotsByDate = (timeSlots) => {
  const groupedSlots = new Map();
  
  timeSlots.forEach(slot => {
    const date = new Date(slot.date);
    const dateKey = date.toDateString();
    
    if (!groupedSlots.has(dateKey)) {
      groupedSlots.set(dateKey, {
        date: date,
        slots: []
      });
    }
    
    groupedSlots.get(dateKey).slots.push(slot);
  });
  
  // Sort slots within each date
  groupedSlots.forEach(dateData => {
    dateData.slots.sort((a, b) => {
      const timeA = a.startTime.replace(':', '');
      const timeB = b.startTime.replace(':', '');
      return timeA.localeCompare(timeB);
    });
  });
  
  // Convert to array and sort by date
  return Array.from(groupedSlots.values()).sort((a, b) => a.date - b.date);
};

// Calculate availability status for a date
export const getAvailabilityStatus = (slots) => {
  const availableSlots = slots.filter(slot => slot.availableSlots > 0).length;
  const totalSlots = slots.length;
  
  if (availableSlots === 0) return 'sold-out';
  if (availableSlots <= totalSlots * 0.3) return 'fast-filling';
  return 'available';
};

// Get availability color class
export const getAvailabilityColor = (status) => {
  switch (status) {
    case 'available': return 'bg-green-500';
    case 'fast-filling': return 'bg-orange-500';
    case 'sold-out': return 'bg-gray-500';
    default: return 'bg-gray-500';
  }
};

// Get timezone abbreviation
export const getTimezoneAbbr = (timezone) => {
  const abbrMap = {
    'Asia/Kolkata': 'IST',
    'America/New_York': 'EST',
    'Europe/London': 'GMT',
    'Asia/Dubai': 'GST',
    'Asia/Singapore': 'SGT',
    'Australia/Sydney': 'AEDT',
    'America/Los_Angeles': 'PST',
    'Europe/Paris': 'CET',
    'Asia/Tokyo': 'JST',
  };
  
  return abbrMap[timezone] || 'UTC';
}; 