/**
 * Curated Unsplash imagery (w=960&q=80) — replace with CDN / API later.
 */

export const IMG = {
  cancunHero:
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=960&q=80',
  poolResort:
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=960&q=80',
  hotelModern:
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=960&q=80',
  roomSuite:
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=960&q=80',
  vegas:
    'https://images.unsplash.com/photo-1581351721010-8cf859cb14a4?auto=format&fit=crop&w=960&q=80',
  miami:
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=960&q=80',
  palmSunset:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=960&q=80',
  yacht:
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=960&q=80',
  carMini:
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=960&q=80',
  carSuv:
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=960&q=80',
  carCompact:
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=960&q=80',
  activityBoat:
    'https://images.unsplash.com/photo-1567894340315-735d7c361db0?auto=format&fit=crop&w=960&q=80',
  activityRuins:
    'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=960&q=80',
  profile:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  cleanliness:
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=960&q=80',
  service:
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=960&q=80',
  location:
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=960&q=80',
  value:
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=960&q=80',
  comfort:
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=960&q=80',
  followupHero:
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=960&q=80',
  profileBanner:
    'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=960&q=80',
};

export type TripBooking = {
  id: string;
  stayId: string;
  name: string;
  image: string;
  checkIn: string;
  checkOut: string;
};

export type Trip = {
  id: string;
  destination: string;
  dateRange: string;
  coverImage: string;
  itineraryCount: number;
  bookingsCount: number;
  savesCount: number;
  bookings: TripBooking[];
  suggestedStays: { id: string; name: string; price: number; image: string }[];
  activities: { id: string; name: string; image: string }[];
  cars: { id: string; label: string; image: string }[];
};

export type Stay = {
  id: string;
  tripId: string;
  propertyName: string;
  locationLabel: string;
  dateRange: string;
  heroImage: string;
  nights: number;
  adults: number;
  kids: number;
  rooms: number;
  itineraryNumber: string;
  checkIn: { weekday: string; date: string; time: string };
  checkOut: { weekday: string; date: string; time: string };
  specialInstructions: string[];
  totalPrice: string;
  paidOn: string;
};

export const TRIPS: Trip[] = [
  {
    id: 'cancun-dec-2025',
    destination: 'Cancún',
    dateRange: 'Dec 18, 2025 – Dec 25, 2025',
    coverImage: IMG.cancunHero,
    itineraryCount: 1,
    bookingsCount: 2,
    savesCount: 3,
    bookings: [
      {
        id: 'b1',
        stayId: 'stay-city-express',
        name: 'City Express by Marriott Cancún',
        image: IMG.hotelModern,
        checkIn: 'Dec 18 @ 3:00 PM',
        checkOut: 'Dec 20 @ 11:00 AM',
      },
      {
        id: 'b2',
        stayId: 'stay-moon-palace',
        name: 'Moon Palace Cancún',
        image: IMG.poolResort,
        checkIn: 'Dec 20 @ 4:00 PM',
        checkOut: 'Dec 25 @ 11:00 AM',
      },
    ],
    suggestedStays: [
      { id: 's1', name: 'Hyatt Place Cancún', price: 241, image: IMG.roomSuite },
      { id: 's2', name: 'Grand Fiesta Americana', price: 312, image: IMG.poolResort },
      { id: 's3', name: 'Secrets The Vine', price: 389, image: IMG.cancunHero },
    ],
    activities: [
      { id: 'a1', name: 'Sunset party boat', image: IMG.activityBoat },
      { id: 'a2', name: 'Chichén Itzá day trip', image: IMG.activityRuins },
      { id: 'a3', name: 'Reef snorkel', image: IMG.palmSunset },
    ],
    cars: [
      { id: 'c1', label: 'Mini', image: IMG.carMini },
      { id: 'c2', label: 'Compact', image: IMG.carCompact },
      { id: 'c3', label: 'Economy', image: IMG.carSuv },
    ],
  },
  {
    id: 'vegas-oct-2025',
    destination: 'Las Vegas',
    dateRange: 'Oct 5, 2025 – Oct 8, 2025',
    coverImage: IMG.vegas,
    itineraryCount: 0,
    bookingsCount: 1,
    savesCount: 2,
    bookings: [
      {
        id: 'b3',
        stayId: 'stay-bellagio',
        name: 'Bellagio Hotel & Casino',
        image: IMG.vegas,
        checkIn: 'Oct 5 @ 3:00 PM',
        checkOut: 'Oct 8 @ 11:00 AM',
      },
    ],
    suggestedStays: [
      { id: 's4', name: 'ARIA Resort', price: 289, image: IMG.hotelModern },
      { id: 's5', name: 'Cosmopolitan', price: 334, image: IMG.roomSuite },
    ],
    activities: [
      { id: 'a4', name: 'Helicopter strip tour', image: IMG.vegas },
      { id: 'a5', name: 'Grand Canyon day trip', image: IMG.miami },
    ],
    cars: [
      { id: 'c4', label: 'Convertible', image: IMG.carCompact },
      { id: 'c5', label: 'SUV', image: IMG.carSuv },
    ],
  },
];

export const STAYS: Stay[] = [
  {
    id: 'stay-city-express',
    tripId: 'cancun-dec-2025',
    propertyName: 'City Express Plus by Marriott Cancún Aeropuerto',
    locationLabel: 'Cancún',
    dateRange: 'Dec 18, 2025 – Dec 20, 2025',
    heroImage: IMG.hotelModern,
    nights: 2,
    adults: 2,
    kids: 2,
    rooms: 1,
    itineraryNumber: '678910123456',
    checkIn: { weekday: 'Mon', date: 'Dec 18', time: '3:00 PM' },
    checkOut: { weekday: 'Wed', date: 'Dec 20', time: '1:00 PM' },
    specialInstructions: [
      'Check-in starts @ 3:00 PM',
      'Check-in ends @ 12:00 AM',
      'Minimum check-in age: 18',
    ],
    totalPrice: '$351.50',
    paidOn: 'Dec 18, 2025',
  },
  {
    id: 'stay-moon-palace',
    tripId: 'cancun-dec-2025',
    propertyName: 'Moon Palace Cancún',
    locationLabel: 'Cancún',
    dateRange: 'Dec 20, 2025 – Dec 25, 2025',
    heroImage: IMG.poolResort,
    nights: 5,
    adults: 2,
    kids: 2,
    rooms: 1,
    itineraryNumber: '678910123457',
    checkIn: { weekday: 'Fri', date: 'Dec 20', time: '4:00 PM' },
    checkOut: { weekday: 'Thu', date: 'Dec 25', time: '11:00 AM' },
    specialInstructions: ['All-inclusive wristbands at front desk', 'Airport shuttle every 30 min'],
    totalPrice: '$2,840.00',
    paidOn: 'Dec 18, 2025',
  },
  {
    id: 'stay-bellagio',
    tripId: 'vegas-oct-2025',
    propertyName: 'Bellagio Hotel & Casino',
    locationLabel: 'Las Vegas',
    dateRange: 'Oct 5, 2025 – Oct 8, 2025',
    heroImage: IMG.vegas,
    nights: 3,
    adults: 2,
    kids: 0,
    rooms: 1,
    itineraryNumber: '441122998877',
    checkIn: { weekday: 'Sun', date: 'Oct 5', time: '3:00 PM' },
    checkOut: { weekday: 'Wed', date: 'Oct 8', time: '11:00 AM' },
    specialInstructions: ['Resort fee settled at checkout', 'Fountains view on request'],
    totalPrice: '$1,124.00',
    paidOn: 'Sep 28, 2025',
  },
];

export const RECENT_SEARCHES = [
  {
    id: 'rs1',
    type: 'Stays' as const,
    destination: 'Las Vegas',
    dates: 'Oct 5 → Oct 8',
    guests: '2 guests · 1 room',
    image: IMG.vegas,
  },
  {
    id: 'rs2',
    type: 'Flights' as const,
    destination: 'Cancún',
    dates: 'Dec 18 → Dec 25',
    guests: '4 travelers',
    image: IMG.cancunHero,
  },
  {
    id: 'rs3',
    type: 'Stays' as const,
    destination: 'Miami',
    dates: 'Jan 3 → Jan 7',
    guests: '2 guests · 1 room',
    image: IMG.miami,
  },
];

export const VIEWED_PROPERTIES = [
  { id: 'vp1', name: 'Grand Fiesta Americana', rating: 9.2, reviews: 3420, price: 189, image: IMG.poolResort, fav: false },
  { id: 'vp2', name: 'Hyatt Ziva Cancún', rating: 9.0, reviews: 2100, price: 312, image: IMG.cancunHero, fav: true },
  { id: 'vp3', name: 'Moon Palace', rating: 8.8, reviews: 5600, price: 445, image: IMG.hotelModern, fav: false },
  { id: 'vp4', name: 'The Ritz-Carlton Cancún', rating: 9.4, reviews: 1890, price: 520, image: IMG.roomSuite, fav: false },
];

export const RECENT_STAYS_HOME = [
  { id: 'stay-city-express', name: 'City Express Cancún', dates: 'Dec 18–20, 2025', image: IMG.hotelModern, tripId: 'cancun-dec-2025' },
  { id: 'stay-moon-palace', name: 'Moon Palace Resort', dates: 'Dec 20–25, 2025', image: IMG.poolResort, tripId: 'cancun-dec-2025' },
  { id: 'stay-bellagio', name: 'Bellagio Las Vegas', dates: 'Oct 5–8, 2025', image: IMG.vegas, tripId: 'vegas-oct-2025' },
];

export const REVIEW_CATEGORIES: { key: string; label: string; image: string }[] = [
  { key: 'cleanliness', label: 'Cleanliness', image: IMG.cleanliness },
  { key: 'service', label: 'Service', image: IMG.service },
  { key: 'location', label: 'Location', image: IMG.location },
  { key: 'value', label: 'Value', image: IMG.value },
  { key: 'comfort', label: 'Room comfort', image: IMG.comfort },
];

export function getTrip(id: string): Trip | undefined {
  return TRIPS.find((t) => t.id === id);
}

export function getStay(id: string): Stay | undefined {
  return STAYS.find((s) => s.id === id);
}

export function getStayForReview(stayId: string): Stay | undefined {
  return getStay(stayId);
}

export const FOLLOWUP_OPTIONS: Record<string, readonly string[]> = {
  cleanliness: [
    'Room wasn\'t cleaned before arrival',
    'Bathroom had visible dirt or mold',
    'Linens felt used or stained',
    'Common areas were messy',
  ],
  service: [
    'Staff took too long to respond',
    'Felt unwelcoming or cold',
    'Great staff, just understaffed',
    'Hard to get anyone\'s attention',
  ],
  location: [
    'Too far from attractions',
    'Noisy area at night',
    'Hard to find parking',
    'Felt unsafe walking around',
  ],
  value: [
    'Hidden fees on checkout',
    'Quality didn\'t match the price',
    'Amenities were lacking for the cost',
    'Better options nearby for less',
  ],
  comfort: [
    'Bed was uncomfortable',
    'Room was too hot or cold',
    'Noisy neighbors / thin walls',
    'Pillows and bedding were low quality',
  ],
};
