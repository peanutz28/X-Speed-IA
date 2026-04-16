import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

/** URL for the traveler mobile app. Points to Expo dev server locally; update to /mobile/ for production. */
const MOBILE_APP_URL = '/mobile/'


const EXPEDIA_LOGO_SRC = '/expedia%20logo.png'
const MAIN_HERO_IMAGE_SRC = '/main%20screen%20image.jpg'
const USER_INITIALS = 'JS'
const USER_NAME = 'John'

/** Placeholder portrait when a review quote has no `avatar` URL. */
const REVIEW_AVATAR_FALLBACK =
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=128&h=128&q=80'

/** Target scroll (px) for Manage-properties nav + when the orb switches to the home icon (clamped to max scroll). */
const HOME_CORE_SCROLL_SWITCH_PX = 400

function getScrollRoot() {
  return document.scrollingElement ?? document.documentElement
}

function getScrollY() {
  const root = getScrollRoot()
  return window.scrollY ?? window.pageYOffset ?? root.scrollTop ?? 0
}

/** Maximum vertical scroll for the document (0 if the page does not scroll). */
function getMaxScrollY() {
  const root = getScrollRoot()
  return Math.max(0, root.scrollHeight - window.innerHeight)
}

/** Shared threshold used by both slot switching and Home-button scroll target. */
function getHomeCoreSwitchScrollY() {
  const maxY = getMaxScrollY()
  if (maxY <= 0) return 0
  return Math.min(HOME_CORE_SCROLL_SWITCH_PX, maxY)
}

function IconNavGrid() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  )
}

function IconNavHome() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function IconNavDashboard() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  )
}

function IconNavActions() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
}

function IconNavCalendar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function IconNavReviews() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function IconQuickContactProperty() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function IconQuickCleaners() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  )
}

function IconQuickMechanics() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  )
}

function IconQuickPlumbers() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
    </svg>
  )
}

/** Property detail: glass panel items (order matches workspace) */
const navItemsDerived = [
  { key: 'overview', label: 'Property dashboard', icon: IconNavDashboard },
  { key: 'to-fix', label: 'Actions needed', icon: IconNavActions },
  { key: 'reservations', label: 'Reservations & prices', icon: IconNavCalendar },
  { key: 'reviews', label: 'All reviews', icon: IconNavReviews },
]

const toFixQuickContactActions = [
  { id: 'contact', label: 'Contact property', Icon: IconQuickContactProperty },
  { id: 'cleaners', label: 'Cleaners', Icon: IconQuickCleaners },
  { id: 'mechanics', label: 'Mechanics', Icon: IconQuickMechanics },
  { id: 'plumbers', label: 'Plumbers', Icon: IconQuickPlumbers },
]

function IconWifi() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
    </svg>
  )
}

function IconWater() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  )
}

function IconPool() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20c2-1 4-1 6 0s4 1 6 0 4-1 6 0M2 16c2-1 4-1 6 0s4 1 6 0 4-1 6 0M8 4v8M16 4v8" />
    </svg>
  )
}

const iconMap = { wifi: IconWifi, water: IconWater, pool: IconPool }

const properties = [
  {
    id: 'aurora',
    name: 'Aurora Coast Resort',
    location: 'Amalfi Coast, Italy',
    rating: 4.8,
    reviews: 1094,
    status: 'Looking great',
    attention: 1,
    updates: 2,
    coverage: 82,
    resolved: 9,
    totalIssues: 13,
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80',
    reviewTrend: {
      direction: 'up',
      deltaLabel: '+0.2',
      periodLabel: 'Last 90 days',
      caption: 'Guest scores trending up',
    },
    upcomingGuest: {
      guestName: 'Elena Marchetti',
      partyLabel: '2 guests · Ocean suite',
      dateLabel: 'Fri, Apr 18',
      checkInTime: '3:00 PM',
    },
    revenueThisMonth: {
      amountUsd: 184200,
      compareLabel: '+12% vs last month',
    },
    listing: {
      headline: 'Mediterranean clifftop resort & private beach club',
      lede: 'Sea-view suites, a dedicated guest team, and direct access to a quiet cove below the property.',
      description:
        'Aurora Coast pairs dramatic Amalfi sunsets with calm, tailored service. Mornings start on the infinity pool deck; afternoons drift toward the private beach club. Evenings bring optional chef-led tastings and low-key acoustic sets on the terrace.',
      highlights: [
        'Private beach club with cabanas & towel service',
        '2024 suite refresh across ocean-facing rooms',
        'Weekly sommelier dinners & cooking demos',
      ],
      amenities: ['Infinity pool', 'Full-service spa', 'Fitness studio', 'EV charging', 'Airport transfers', '24h concierge'],
    },
  },
  {
    id: 'harbor',
    name: 'Harbor House Edition',
    location: 'Lisbon, Portugal',
    rating: 4.5,
    reviews: 847,
    status: '3 things to review',
    attention: 3,
    updates: 1,
    coverage: 66,
    resolved: 6,
    totalIssues: 14,
    image:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=80',
    reviewTrend: {
      direction: 'down',
      deltaLabel: '−0.1',
      periodLabel: 'Last 90 days',
      caption: 'Slight dip vs last quarter',
    },
    upcomingGuest: {
      guestName: 'James & Priya K.',
      partyLabel: '2 guests · River view',
      dateLabel: 'Sat, Apr 19',
      checkInTime: '4:30 PM',
    },
    revenueThisMonth: {
      amountUsd: 96200,
      compareLabel: '−3% vs last month',
    },
    listing: {
      headline: 'Design-led stay on the Tagus, minutes from Alfama',
      lede: 'River-light rooms, a quiet courtyard, and a team that knows every tram line and tasca worth your evening.',
      description:
        'Harbor House Edition sits where Lisbon’s waterfront meets the old city. Rooms are tuned for slow mornings—great coffee, blackout shades, and views of sails on the river. The front desk can wire up Fado tickets, day trips to Sintra, or a simple pasteis run before the lines form.',
      highlights: [
        'Rooftop lounge facing the Tagus',
        'Courtyard breakfast with local pastries',
        'Bikes & portable WiFi hotspots on request',
      ],
      amenities: ['Rooftop bar', 'Courtyard', 'Room service', 'Laundry', 'Business corner', 'Pet-friendly rooms'],
    },
  },
  {
    id: 'sage',
    name: 'Sage Garden Suites',
    location: 'Kyoto, Japan',
    rating: 4.7,
    reviews: 612,
    status: 'Guests are loving it',
    attention: 0,
    updates: 1,
    coverage: 91,
    resolved: 11,
    totalIssues: 12,
    image:
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1400&q=80',
    reviewTrend: {
      direction: 'up',
      deltaLabel: '+0.3',
      periodLabel: 'Last 90 days',
      caption: 'Strong positive momentum',
    },
    upcomingGuest: {
      guestName: 'Yuki Tanaka',
      partyLabel: '1 guest · Garden room',
      dateLabel: 'Thu, Apr 17',
      checkInTime: '2:00 PM',
    },
    revenueThisMonth: {
      amountUsd: 142800,
      compareLabel: '+15% vs last month',
    },
    listing: {
      headline: 'Zen garden suites near bamboo groves & tea houses',
      lede: 'Low-rise buildings around stone paths, koi ponds, and the soft sound of water at every turn.',
      description:
        'Sage Garden Suites was laid out like a walk through a Kyoto machiya neighborhood—rooms open toward private pocket gardens. Staff can arrange early temple visits, tea ceremonies, or a quiet kaiseki nearby. The pace here is intentional; the WiFi is fast when you need it.',
      highlights: [
        'Traditional garden paths between buildings',
        'In-room soaking tubs in select suites',
        'Partnerships with local tea houses & artisans',
      ],
      amenities: ['Onsen-style baths', 'Garden lounge', 'Tea service', 'Bicycle hire', 'Multi-lingual hosts', 'Luggage forwarding'],
    },
  },
  {
    id: 'seabreeze',
    name: 'Seabreeze Point Hotel',
    location: 'Nice, France',
    rating: 4.4,
    reviews: 438,
    status: '2 items need attention',
    attention: 2,
    updates: 1,
    coverage: 71,
    resolved: 7,
    totalIssues: 11,
    image:
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80',
    reviewTrend: {
      direction: 'steady',
      deltaLabel: '0.0',
      periodLabel: 'Last 90 days',
      caption: 'Holding steady with peers',
    },
    upcomingGuest: {
      guestName: 'The Durand family',
      partyLabel: '4 guests · Connecting rooms',
      dateLabel: 'Sun, Apr 20',
      checkInTime: '5:00 PM',
    },
    revenueThisMonth: {
      amountUsd: 77400,
      compareLabel: 'Flat vs last month',
    },
    listing: {
      headline: 'Boutique hotel steps from the Promenade des Anglais',
      lede: 'Light-filled rooms, sea breezes on the balcony, and a team that lives for long summer evenings in Nice.',
      description:
        'Seabreeze Point is built for guests who want the Mediterranean without the noise. Many rooms catch a slice of blue horizon; ground-floor suites open toward a palm-lined patio. The concierge keeps beach club reservations, market mornings, and day trips to Eze on a simple text thread.',
      highlights: [
        'Short walk to beaches & the old town',
        'Sunset aperitivo service on the patio',
        'Family connecting rooms available',
      ],
      amenities: ['Beach towels & chairs', 'Patio dining', 'Parking (limited)', 'Air conditioning', 'Family kits', 'Airport shuttle'],
    },
  },
  {
    id: 'cedar',
    name: 'Cedar Peak Retreat',
    location: 'Banff, Canada',
    rating: 4.6,
    reviews: 529,
    status: 'Steady performance',
    attention: 1,
    updates: 2,
    coverage: 79,
    resolved: 8,
    totalIssues: 12,
    image:
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1400&q=80',
    reviewTrend: {
      direction: 'up',
      deltaLabel: '+0.1',
      periodLabel: 'Last 90 days',
      caption: 'Slow but steady climb',
    },
    upcomingGuest: {
      guestName: "Marcus O'Neil",
      partyLabel: '2 guests · Mountain lodge',
      dateLabel: 'Wed, Apr 16',
      checkInTime: '1:00 PM',
    },
    revenueThisMonth: {
      amountUsd: 118900,
      compareLabel: '+5% vs last month',
    },
    listing: {
      headline: 'Timber lodges with Rockies views & fireside lounges',
      lede: 'Warm interiors, big windows, and a quiet that only mountain air delivers.',
      description:
        'Cedar Peak Retreat is for guests who chase powder, trails, or stillness. Lodges combine stone hearths with modern kitchens; staff stock firewood, trail maps, and honest weather reads. Evenings lean into local wine, shared stories, and zero light pollution.',
      highlights: [
        'Direct access to hiking & ski shuttle partners',
        'Wood-burning fireplaces in every lodge',
        'Stargazing deck with heated benches',
      ],
      amenities: ['Ski storage', 'Hot tub', 'Firewood service', 'Grocery pre-stock', 'Equipment rental desk', 'Guest laundry'],
    },
  },
  {
    id: 'palm',
    name: 'Palm Harbor Residences',
    location: 'San Diego, USA',
    rating: 4.3,
    reviews: 362,
    status: '3 things to review',
    attention: 3,
    updates: 1,
    coverage: 64,
    resolved: 5,
    totalIssues: 10,
    image:
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1400&q=80',
    reviewTrend: {
      direction: 'down',
      deltaLabel: '−0.2',
      periodLabel: 'Last 90 days',
      caption: 'Room for improvement',
    },
    upcomingGuest: {
      guestName: 'Sofia Reyes',
      partyLabel: '3 guests · Pool villa',
      dateLabel: 'Mon, Apr 21',
      checkInTime: '4:00 PM',
    },
    revenueThisMonth: {
      amountUsd: 68900,
      compareLabel: '−2% vs last month',
    },
    listing: {
      headline: 'Coastal residences with pool villas & Pacific sunsets',
      lede: 'Space for families and remote-work weeks—patios, grills, and a calm residential pace.',
      description:
        'Palm Harbor Residences spreads low-rise villas around a heated pool and palm courtyard. Units include full kitchens and washer-dryers; the front office handles grocery delivery, surf lessons, and babysitter referrals. It feels like a neighborhood with hotel-grade linens.',
      highlights: [
        'Private patios & outdoor dining on most units',
        'Heated pool & hot tub open year-round',
        'Short drive to La Jolla & downtown SD',
      ],
      amenities: ['Full kitchens', 'Pool & spa', 'BBQ stations', 'Parking included', 'Package hold', 'Housekeeping on request'],
    },
  },
]

const issueSeed = [
  {
    id: 'wifi',
    icon: 'wifi',
    title: 'WiFi is unstable in corner suites',
    severity: 'major',
    confidence: 'Reported often',
    impact: 'Mentioned by 23% of guests this quarter',
    quotes: [
      {
        initials: 'AL',
        text: 'Great room, but video calls dropped at night.',
        month: 'Mar',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&h=128&q=80',
      },
      {
        initials: 'TK',
        text: 'Signal fades near the balcony desk.',
        month: 'Apr',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&h=128&q=80',
      },
      {
        initials: 'EM',
        text: 'Lobby WiFi is fast, room WiFi was patchy.',
        month: 'Apr',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&h=128&q=80',
      },
    ],
  },
  {
    id: 'hot-water',
    icon: 'water',
    title: 'Hot water delay in early mornings',
    severity: 'minor',
    confidence: 'A few guests',
    impact: 'Mentioned by 12% of guests this quarter',
    quotes: [
      {
        initials: 'RP',
        text: 'Water needed 4-5 minutes to heat up.',
        month: 'Feb',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&h=128&q=80',
      },
      {
        initials: 'SN',
        text: 'Everything else felt luxurious and calm.',
        month: 'Mar',
        avatar:
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=128&h=128&q=80',
      },
    ],
  },
  {
    id: 'pool-hours',
    icon: 'pool',
    title: 'Pool hours are easy to miss',
    severity: 'minor',
    confidence: 'A few guests',
    impact: 'Mentioned by 9% of guests this quarter',
    quotes: [
      {
        initials: 'DV',
        text: 'We found the pool but not the opening times.',
        month: 'Mar',
        avatar:
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=128&h=128&q=80',
      },
      {
        initials: 'HG',
        text: 'Families asked staff for hours twice.',
        month: 'Apr',
        avatar:
          'https://images.unsplash.com/photo-1539578705137-ba27a6f6d9f9?auto=format&fit=crop&w=128&h=128&q=80',
      },
    ],
  },
]

const segmentScores = [
  { id: 'business', label: 'Business travelers', score: 4.2, color: '#5b8def' },
  { id: 'families', label: 'Families', score: 4.7, color: '#febf4f' },
  { id: 'couples', label: 'Couples', score: 4.8, color: '#f472b6' },
  { id: 'solo', label: 'Solo travelers', score: 4.5, color: '#00c896' },
]

/** Guest-review dimensions shown in the All reviews → category trends card. */
const REVIEW_CATEGORY_TREND_LABELS = [
  { id: 'wifi', label: 'WiFi' },
  { id: 'cleanliness', label: 'Cleanliness' },
  { id: 'service', label: 'Service' },
  { id: 'noise', label: 'Noise' },
  { id: 'parking', label: 'Parking' },
  { id: 'location', label: 'Location' },
  { id: 'price', label: 'Price' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'safety', label: 'Safety' },
]

function categoryTrendSeed(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** Normalized heights 0–1 for a small multi-month series (demo data per property + category). */
function categorySparklineNormalized(propertyId, categoryId) {
  const h = categoryTrendSeed(`${propertyId}:${categoryId}`)
  const n = 8
  const base = 0.5 + (h % 40) / 100
  return Array.from({ length: n }, (_, i) => {
    const t = i / Math.max(1, n - 1)
    const wave = Math.sin((h + i * 3) * 0.11) * 0.14
    const drift = (t - 0.45) * 0.1
    return Math.min(0.98, Math.max(0.22, base + wave + drift))
  })
}

const TRAVELER_REVIEW_PILL_LABEL = {
  business: 'Business',
  families: 'Families',
  couples: 'Couples',
  solo: 'Solo',
}

/** Short labels for traveler filter chips in the narrow “View all reviews” column. */
const TRAVELER_REVIEW_FILTER_COMPACT = {
  business: 'Bus.',
  families: 'Fam.',
  couples: 'Cpl.',
  solo: 'Solo',
}

/** Sample guest reviews for the All reviews feed (segmentId matches segmentScores). */
const guestReviewFeed = [
  {
    id: 'rv-1',
    segmentId: 'business',
    author: 'Robert K.',
    rating: 5,
    stayed: 'Apr 2026',
    text: 'Loved the calm workspace and fast check-in. Reliable Wi‑Fi and a real desk—rare for resorts.',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=128&h=128&q=80',
  },
  {
    id: 'rv-2',
    segmentId: 'business',
    author: 'Maria L.',
    rating: 4,
    stayed: 'Mar 2026',
    text: 'Quiet floor for calls. Would like faster housekeeping on tight turnarounds.',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=128&h=128&q=80',
  },
  {
    id: 'rv-3',
    segmentId: 'business',
    author: 'Devon P.',
    rating: 5,
    stayed: 'Feb 2026',
    text: 'Front desk had my key ready before I finished the sentence. Impressive.',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&h=128&q=80',
  },
  {
    id: 'rv-4',
    segmentId: 'families',
    author: 'Jennifer T.',
    rating: 5,
    stayed: 'Apr 2026',
    text: "The kids lived in the pool—we'll be back next spring.",
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=128&h=128&q=80',
  },
  {
    id: 'rv-5',
    segmentId: 'families',
    author: 'Leah W.',
    rating: 5,
    stayed: 'Mar 2026',
    text: 'Connecting rooms made bedtime routines so much easier.',
    avatar:
      'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=128&h=128&q=80',
  },
  {
    id: 'rv-6',
    segmentId: 'families',
    author: 'Omar H.',
    rating: 4,
    stayed: 'Jan 2026',
    text: 'Great breakfast buffet; high chairs were available when we asked.',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&h=128&q=80',
  },
  {
    id: 'rv-7',
    segmentId: 'couples',
    author: 'Nina S.',
    rating: 5,
    stayed: 'Apr 2026',
    text: 'Sunset from the balcony felt private and special.',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=128&h=128&q=80',
  },
  {
    id: 'rv-8',
    segmentId: 'couples',
    author: 'Grace P.',
    rating: 5,
    stayed: 'Mar 2026',
    text: 'Breakfast felt curated, not generic. Staff remembered we were celebrating.',
    avatar:
      'https://images.unsplash.com/photo-1580489944761-15fc19eb2aeb?auto=format&fit=crop&w=128&h=128&q=80',
  },
  {
    id: 'rv-9',
    segmentId: 'couples',
    author: 'Chris Y.',
    rating: 4,
    stayed: 'Feb 2026',
    text: 'Spa wait time was long but the room and turndown were flawless.',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=128&h=128&q=80',
  },
  {
    id: 'rv-10',
    segmentId: 'solo',
    author: 'Aisha H.',
    rating: 5,
    stayed: 'Mar 2026',
    text: 'Felt safe walking back alone after dinner.',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=128&h=128&q=80',
  },
  {
    id: 'rv-11',
    segmentId: 'solo',
    author: 'Claire F.',
    rating: 5,
    stayed: 'Feb 2026',
    text: 'Staff remembered my name by day two. Small touches matter.',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=128&h=128&q=80',
  },
  {
    id: 'rv-12',
    segmentId: 'solo',
    author: 'Jordan M.',
    rating: 4,
    stayed: 'Jan 2026',
    text: 'Solo diner at the bar was welcoming, not awkward.',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&h=128&q=80',
  },
]

function travelerSegmentPillSelectedStyle(segmentColor) {
  const hex = String(segmentColor).toLowerCase()
  if (hex === '#febf4f') {
    return {
      background: segmentColor,
      borderColor: '#ca8a04',
      color: '#422006',
    }
  }
  return {
    background: segmentColor,
    borderColor: segmentColor,
    color: '#ffffff',
  }
}

const reservationRows = [
  {
    id: 'r1',
    range: 'Apr 22–25, 2026',
    guest: 'M. Chen',
    guestDisplay: 'Melissa Chen',
    nights: 3,
    rate: 289,
    status: 'Confirmed',
    startDate: '2026-04-22',
    endDate: '2026-04-25',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80',
  },
  {
    id: 'r2',
    range: 'May 2–6, 2026',
    guest: 'A. & J. Ruiz',
    guestDisplay: 'Ana & Javier Ruiz',
    nights: 4,
    rate: 312,
    status: 'Confirmed',
    startDate: '2026-05-02',
    endDate: '2026-05-06',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
  },
  {
    id: 'r3',
    range: 'May 18–19, 2026',
    guest: 'S. Okonkwo',
    guestDisplay: 'Samira Okonkwo',
    nights: 1,
    rate: 265,
    status: 'Pending',
    startDate: '2026-05-18',
    endDate: '2026-05-19',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
  },
]

function bookingCardStatusClass(status) {
  const key = String(status).toLowerCase()
  if (key === 'confirmed') return 'booking-card--confirmed'
  if (key === 'pending') return 'booking-card--pending'
  return 'booking-card--other'
}

const CALENDAR_WEEKDAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const CALENDAR_MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function parseIsoDateAtNoon(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day, 12, 0, 0, 0)
}

function toIsoDateKey(year, monthIndex, day) {
  const month = String(monthIndex + 1).padStart(2, '0')
  const date = String(day).padStart(2, '0')
  return `${year}-${month}-${date}`
}

function parseIsoDateKey(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return { year: y, monthIndex: m - 1, day: d }
}

function reservationIncludesDate(row, isoKey) {
  const t = parseIsoDateAtNoon(isoKey).getTime()
  const start = parseIsoDateAtNoon(row.startDate).getTime()
  const end = parseIsoDateAtNoon(row.endDate).getTime()
  return t >= start && t <= end
}

/** Every night booked across all reservation rows (inclusive start/end dates). */
function getAllReservationDateKeys(rows) {
  const keys = new Set()
  rows.forEach((row) => {
    let cursor = parseIsoDateAtNoon(row.startDate)
    const end = parseIsoDateAtNoon(row.endDate)
    while (cursor <= end) {
      keys.add(toIsoDateKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()))
      cursor.setDate(cursor.getDate() + 1)
    }
  })
  return keys
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate()
}

function addCalendarMonths(year, monthIndex, delta) {
  const d = new Date(year, monthIndex + delta, 1, 12, 0, 0, 0)
  return { year: d.getFullYear(), monthIndex: d.getMonth() }
}

function buildReservationsCalendarCells(viewYear, viewMonthIndex) {
  const firstOfMonth = new Date(viewYear, viewMonthIndex, 1, 12, 0, 0, 0)
  const startPad = firstOfMonth.getDay()
  const dim = daysInMonth(viewYear, viewMonthIndex)
  const cells = []

  const prevMonthLast = new Date(viewYear, viewMonthIndex, 0, 12, 0, 0, 0)
  const prevMonthDays = prevMonthLast.getDate()
  const prevYear = viewMonthIndex === 0 ? viewYear - 1 : viewYear
  const prevMonthIndex = viewMonthIndex === 0 ? 11 : viewMonthIndex - 1

  for (let i = 0; i < startPad; i += 1) {
    const day = prevMonthDays - startPad + i + 1
    cells.push({
      kind: 'outside',
      day,
      year: prevYear,
      monthIndex: prevMonthIndex,
      key: `prev-${prevYear}-${prevMonthIndex}-${day}`,
    })
  }

  for (let d = 1; d <= dim; d += 1) {
    cells.push({
      kind: 'current',
      day: d,
      year: viewYear,
      monthIndex: viewMonthIndex,
      key: toIsoDateKey(viewYear, viewMonthIndex, d),
    })
  }

  const remainder = cells.length % 7
  const nextCount = remainder === 0 ? 0 : 7 - remainder
  const nextYear = viewMonthIndex === 11 ? viewYear + 1 : viewYear
  const nextMonthIndex = viewMonthIndex === 11 ? 0 : viewMonthIndex + 1

  for (let i = 1; i <= nextCount; i += 1) {
    cells.push({
      kind: 'outside',
      day: i,
      year: nextYear,
      monthIndex: nextMonthIndex,
      key: `next-${nextYear}-${nextMonthIndex}-${i}`,
    })
  }

  return cells
}

function IconChevronCalendar({ dir }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={dir === 'right' ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function ReservationsCalendarWidget({ reservationRows: rows, selectedDateKey, onSelectedDateKeyChange }) {
  const reservationKeys = useMemo(() => getAllReservationDateKeys(rows), [rows])

  const { year: viewYear, monthIndex: viewMonthIndex, day: rawDay } = parseIsoDateKey(
    selectedDateKey || rows[0]?.startDate || '2026-04-22',
  )
  const dim = daysInMonth(viewYear, viewMonthIndex)
  const safeSelectedDay = Math.min(rawDay, dim)

  useEffect(() => {
    if (safeSelectedDay !== rawDay) {
      onSelectedDateKeyChange(toIsoDateKey(viewYear, viewMonthIndex, safeSelectedDay))
    }
  }, [viewYear, viewMonthIndex, rawDay, safeSelectedDay, onSelectedDateKeyChange])

  const cells = useMemo(
    () => buildReservationsCalendarCells(viewYear, viewMonthIndex),
    [viewYear, viewMonthIndex],
  )

  const monthYearLabel = `${CALENDAR_MONTH_NAMES[viewMonthIndex]} ${viewYear}`

  const goPrevMonth = () => {
    const { year: y, monthIndex: m } = addCalendarMonths(viewYear, viewMonthIndex, -1)
    const d = Math.min(safeSelectedDay, daysInMonth(y, m))
    onSelectedDateKeyChange(toIsoDateKey(y, m, d))
  }

  const goNextMonth = () => {
    const { year: y, monthIndex: m } = addCalendarMonths(viewYear, viewMonthIndex, 1)
    const d = Math.min(safeSelectedDay, daysInMonth(y, m))
    onSelectedDateKeyChange(toIsoDateKey(y, m, d))
  }

  const onDayClick = (cell) => {
    onSelectedDateKeyChange(toIsoDateKey(cell.year, cell.monthIndex, cell.day))
  }

  const selectedKey = toIsoDateKey(viewYear, viewMonthIndex, safeSelectedDay)

  return (
    <article
      className="card reservations-calendar-card"
      aria-label={`Reservation calendar, ${CALENDAR_MONTH_NAMES[viewMonthIndex]} ${viewYear}`}
    >
      <div className="reservations-calendar-month-nav">
        <button
          type="button"
          className="reservations-calendar-month-nav-btn"
          onClick={goPrevMonth}
          aria-label="Previous month"
        >
          <IconChevronCalendar dir="left" />
        </button>
        <h2 className="reservations-calendar-month-heading">{monthYearLabel}</h2>
        <button
          type="button"
          className="reservations-calendar-month-nav-btn"
          onClick={goNextMonth}
          aria-label="Next month"
        >
          <IconChevronCalendar dir="right" />
        </button>
      </div>

      <div className="reservations-calendar-weekdays" aria-hidden>
        {CALENDAR_WEEKDAY_LABELS.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <div className="reservations-calendar-grid">
        {cells.map((cell) => {
          const dateKey = toIsoDateKey(cell.year, cell.monthIndex, cell.day)
          const hasReservation = reservationKeys.has(dateKey)
          const isCurrent = cell.kind === 'current'
          const isSelected = dateKey === selectedKey
          return (
            <button
              key={cell.key}
              type="button"
              className={`reservations-calendar-day${cell.kind === 'outside' ? ' reservations-calendar-day--outside' : ''}${hasReservation ? ' reservations-calendar-day--booked' : ''}${isSelected ? ' reservations-calendar-day--selected' : ''}`}
              onClick={() => onDayClick(cell)}
              aria-label={
                isCurrent
                  ? `${cell.day} ${CALENDAR_MONTH_NAMES[cell.monthIndex]} ${cell.year}${hasReservation ? ', has reservation' : ''}${isSelected ? ', selected' : ''}`
                  : `${cell.day} ${CALENDAR_MONTH_NAMES[cell.monthIndex]} ${cell.year}, other month`
              }
              aria-pressed={isSelected}
            >
              <span className="reservations-calendar-date-num">{cell.day}</span>
            </button>
          )
        })}
      </div>
    </article>
  )
}

function IconTrendUp() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M23 6l-9.5 9.5-5-5L1 18" />
      <path d="M17 6h6v6" />
    </svg>
  )
}

function IconTrendDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M23 18l-9.5-9.5-5 5L1 6" />
      <path d="M17 18h6v-6" />
    </svg>
  )
}

function IconTrendFlat() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14" />
    </svg>
  )
}

function IconUpcomingGuest() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconUpcomingCalendar() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function DashboardUpcomingGuestsWidget({ guest }) {
  const { guestName, partyLabel, dateLabel, checkInTime } = guest
  const a11y = [
    `Next arrival, ${guestName}`,
    partyLabel,
    `${dateLabel} at ${checkInTime}`,
  ]
    .filter(Boolean)
    .join('. ')
  return (
    <div
      className="dashboard-widget-upcoming-guests dashboard-widget-minimal"
      aria-label={a11y}
    >
      <div className="dashboard-widget-cluster">
        <div className="dashboard-widget-head-minimal">
          <span className="dashboard-widget-icon" aria-hidden>
            <IconUpcomingGuest />
          </span>
          <div>
            <span className="dashboard-widget-kicker">Next arrival</span>
            <p className="dashboard-minimal-hero dashboard-minimal-hero--tight">{guestName}</p>
          </div>
        </div>
      </div>
      <ul className="dashboard-minimal-rows dashboard-minimal-rows--fill">
        <li>
          <IconUpcomingCalendar aria-hidden />
          <span className="dashboard-upcoming-when">
            {dateLabel}
            <span aria-hidden> · </span>
            <strong className="dashboard-minimal-strong">{checkInTime}</strong>
          </span>
        </li>
      </ul>
    </div>
  )
}

function IconRevenueMonth() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function DashboardRevenueMonthWidget({ revenue }) {
  const { amountUsd, compareLabel } = revenue
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amountUsd)

  return (
    <div
      className="dashboard-widget-revenue-month dashboard-widget-minimal"
      aria-label={`Revenue this month ${formatted}. ${compareLabel}`}
    >
      <div className="dashboard-widget-cluster">
        <div className="dashboard-widget-head-minimal">
          <span className="dashboard-widget-icon" aria-hidden>
            <IconRevenueMonth />
          </span>
          <div>
            <span className="dashboard-widget-kicker">Revenue</span>
          </div>
        </div>
      </div>
      <div className="dashboard-revenue-body-minimal">
        <p className="dashboard-revenue-amount">{formatted}</p>
        {compareLabel ? <p className="dashboard-revenue-compare">{compareLabel}</p> : null}
      </div>
    </div>
  )
}

function IconReviewStarOutline() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

/** Semicircle arc gauge: fill shows value/max (e.g. rating out of 5). */
function RatingSemicircleGauge({ value, max = 5, fillColor, compact = false }) {
  const pct = Math.min(1, Math.max(0, value / max))
  const vbW = compact ? 88 : 120
  const vbH = compact ? 46 : 68
  const cx = compact ? 44 : 60
  const cy = compact ? 38 : 58
  const r = compact ? 28 : 44
  const strokeW = compact ? 6 : 8
  const startX = cx - r
  const startY = cy
  const endFullX = cx + r
  const endFullY = cy
  const endAngle = Math.PI + Math.PI * pct
  const endX = cx + r * Math.cos(endAngle)
  const endY = cy + r * Math.sin(endAngle)

  return (
    <svg
      className={`reviews-semicircle-gauge${compact ? ' reviews-semicircle-gauge--compact' : ''}`}
      viewBox={`0 0 ${vbW} ${vbH}`}
      width={vbW}
      height={vbH}
      aria-hidden
    >
      <path
        className="reviews-semicircle-gauge__track"
        d={`M ${startX} ${startY} A ${r} ${r} 0 0 1 ${endFullX} ${endFullY}`}
        fill="none"
        strokeWidth={strokeW}
        strokeLinecap="round"
      />
      {pct > 0 ? (
        <path
          className={fillColor ? undefined : 'reviews-semicircle-gauge__fill'}
          d={`M ${startX} ${startY} A ${r} ${r} 0 0 1 ${endX} ${endY}`}
          fill="none"
          strokeWidth={strokeW}
          strokeLinecap="round"
          stroke={fillColor ?? undefined}
        />
      ) : null}
    </svg>
  )
}

function ReviewsCategoryWidgets({ propertyId }) {
  return (
    <div className="reviews-category-widgets-grid" role="region" aria-label="Guest scores by category">
      {REVIEW_CATEGORY_TREND_LABELS.map((cat) => {
        const series = categorySparklineNormalized(propertyId, cat.id)
        const avg =
          series.length > 0 ? series.reduce((acc, v) => acc + v, 0) / series.length : 0
        const scoreOutOf5 = avg * 5
        const scoreLabel = scoreOutOf5.toFixed(1)
        const pct = Math.min(100, Math.max(0, avg * 100))
        return (
          <article
            key={cat.id}
            className="card reviews-category-pill-widget"
            aria-label={`${cat.label}, ${scoreLabel} out of 5`}
          >
            <div className="reviews-category-pill-widget__head">
              <h3 className="reviews-category-pill-widget__title">{cat.label}</h3>
              <span className="reviews-category-pill-widget__score" title={`${scoreLabel} out of 5`}>
                {scoreLabel}
              </span>
            </div>
            <div
              className="reviews-category-progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={5}
              aria-valuenow={Number(scoreLabel)}
              aria-valuetext={`${scoreLabel} out of 5`}
            >
              <div className="reviews-category-progress__fill" style={{ width: `${pct}%` }} />
            </div>
          </article>
        )
      })}
    </div>
  )
}

function ReviewsPageSummaryWidgets({ rating, reviewCount, segments }) {
  const travelersTitleId = 'reviews-traveler-breakdown-title'

  return (
    <div className="reviews-top-widgets" role="region" aria-label="Review overview">
      <article className="reviews-summary-widget reviews-summary-widget--rating">
        <p className="reviews-summary-widget__kicker">Property rating</p>
        <p className="reviews-summary-widget__rating">{rating.toFixed(1)}</p>
        <p className="reviews-summary-widget__sub">out of 5 · from {reviewCount.toLocaleString()} reviews</p>
      </article>

      <article className="reviews-summary-widget reviews-summary-widget--travelers" aria-labelledby={travelersTitleId}>
        <div className="reviews-summary-widget__travelers-chart">
          <p id={travelersTitleId} className="reviews-summary-widget__kicker">
            By traveler type
          </p>
          <div className="reviews-traveler-arcs" role="list">
            {segments.map((seg) => (
              <div
                className="reviews-traveler-arc"
                role="listitem"
                key={seg.id}
                aria-label={`${seg.label}, ${seg.score.toFixed(1)} out of 5`}
              >
                <div className="reviews-traveler-arc__gauge">
                  <RatingSemicircleGauge value={seg.score} max={5} fillColor={seg.color} compact />
                  <div className="reviews-traveler-arc__gauge-inset" aria-hidden>
                    <span className="reviews-traveler-arc__score-inset">{seg.score.toFixed(1)}</span>
                  </div>
                  <p className="reviews-traveler-arc__scale" aria-hidden>
                    out of 5
                  </p>
                </div>
                <span className="reviews-traveler-arc__label">{seg.label}</span>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  )
}

function DashboardReviewTrendWidget({ trend, rating }) {
  const { direction, deltaLabel, periodLabel, caption } = trend
  const TrendIcon = direction === 'up' ? IconTrendUp : direction === 'down' ? IconTrendDown : IconTrendFlat

  return (
    <div
      className="dashboard-widget-review-trend dashboard-widget-minimal"
      aria-label={`Average guest rating ${rating.toFixed(1)}. ${caption} ${deltaLabel} over ${periodLabel}.`}
    >
      <div className="dashboard-widget-cluster">
        <div className="dashboard-widget-head-minimal">
          <span className="dashboard-widget-icon" aria-hidden>
            <IconReviewStarOutline />
          </span>
          <div>
            <span className="dashboard-widget-kicker">Reviews</span>
            <div className="dashboard-review-hero">
              <span className="dashboard-review-hero-rating">{rating.toFixed(1)}</span>
              <span className="dashboard-review-hero-label">average</span>
            </div>
          </div>
        </div>
      </div>
      <div className="dashboard-widget-cluster dashboard-widget-cluster--tail">
        <p className="dashboard-review-meta">
          <TrendIcon aria-hidden />
          <span>
            {deltaLabel}
            <span aria-hidden> · </span>
            {periodLabel}
          </span>
        </p>
        <p className="dashboard-review-caption">{caption}</p>
      </div>
    </div>
  )
}

function IconPlusFab() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

/** Listing content in the right column only; left photo rail stays mounted unchanged. */
function PropertyListingPanel({ property, onClose }) {
  const closeRef = useRef(null)
  const { listing } = property

  useEffect(() => {
    const id = window.setTimeout(() => closeRef.current?.focus(), 16)
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(id)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <section
      className="detail-listing-panel-host"
      role="region"
      aria-labelledby="listing-overlay-title"
    >
      <div className="listing-overlay-panel listing-overlay-panel--inline">
        <div className="listing-overlay-panel-header">
          <button
            ref={closeRef}
            type="button"
            className="listing-overlay-close"
            onClick={onClose}
            aria-label="Close listing preview"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <p className="listing-overlay-kicker">Property listing</p>
          <h2 id="listing-overlay-title" className="listing-overlay-panel-heading">
            Details for guests
          </h2>
        </div>
        <div className="listing-overlay-panel-body">
          <h3 className="listing-overlay-headline">{listing.headline}</h3>
          <p className="listing-overlay-lede">{listing.lede}</p>
          <p className="listing-overlay-description">{listing.description}</p>
          <h4 className="listing-overlay-subhead">Highlights</h4>
          <ul className="listing-overlay-highlights">
            {listing.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h4 className="listing-overlay-subhead">Amenities</h4>
          <ul className="listing-overlay-amenities">
            {listing.amenities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/** Dashboard status pill: `good` | `watch` | `needs` — drives background color */
function getDashboardStatusPillVariant(status, attention) {
  const lower = status.toLowerCase()
  if (
    lower.includes('things to review') ||
    lower.includes('need attention') ||
    attention >= 2
  ) {
    return 'needs'
  }
  if (lower.includes('great') || lower.includes('loving') || lower.includes('steady')) {
    return 'good'
  }
  if (attention === 1) return 'watch'
  return 'good'
}

function App() {
  const managePropertiesRef = useRef(null)
  const detailTabScrollRef = useRef(null)
  const dismissTimersRef = useRef(new Map())
  /**0 = grid (hero / top), 1 = home — toggled by fixed scroll distance on landing */
  const [homeCoreSlot, setHomeCoreSlot] = useState(0)
  const [screen, setScreen] = useState('home')
  const [activeTab, setActiveTab] = useState('overview')
  /** Nav-only page change: subtle slide mimics scroll direction without allowing cross-page scroll. */
  const [tabEnterDirection, setTabEnterDirection] = useState('none')
  const [activeProperty, setActiveProperty] = useState(properties[1])
  const [resolvedIssueIds, setResolvedIssueIds] = useState([])
  const [dismissedIssueIds, setDismissedIssueIds] = useState([])
  const [dismissingIssueIds, setDismissingIssueIds] = useState([])
  const [listingOverlayOpen, setListingOverlayOpen] = useState(false)
  const [reviewsTravelerFilter, setReviewsTravelerFilter] = useState(null)
  const [selectedReservationDateKey, setSelectedReservationDateKey] = useState(
    () => reservationRows[0]?.startDate ?? '2026-04-22',
  )
  /** To-fix tab: filter list by category (null = all). */
  const [toFixCategoryFilter, setToFixCategoryFilter] = useState(null)
  /** To-fix tab: which task is expanded on the right. */
  const [selectedToFixId, setSelectedToFixId] = useState(null)
  const [showMobile, setShowMobile] = useState(false)

  const visibleIssues = useMemo(
    () => issueSeed.filter((i) => !dismissedIssueIds.includes(i.id)),
    [dismissedIssueIds],
  )
  /** Issues on the dashboard checklist still needing a fix (not marked done). */
  const openActionsCount = useMemo(
    () => visibleIssues.filter((i) => !resolvedIssueIds.includes(i.id)).length,
    [visibleIssues, resolvedIssueIds],
  )
  const toFixMajorOpenCount = useMemo(
    () =>
      visibleIssues.filter(
        (i) => !resolvedIssueIds.includes(i.id) && i.severity === 'major',
      ).length,
    [visibleIssues, resolvedIssueIds],
  )
  const toFixMinorOpenCount = useMemo(
    () =>
      visibleIssues.filter(
        (i) => !resolvedIssueIds.includes(i.id) && i.severity === 'minor',
      ).length,
    [visibleIssues, resolvedIssueIds],
  )
  const toFixResolvedCount = useMemo(
    () => visibleIssues.filter((i) => resolvedIssueIds.includes(i.id)).length,
    [visibleIssues, resolvedIssueIds],
  )
  const toFixFilteredIssues = useMemo(() => {
    if (toFixCategoryFilter === 'major') {
      return visibleIssues.filter(
        (i) => !resolvedIssueIds.includes(i.id) && i.severity === 'major',
      )
    }
    if (toFixCategoryFilter === 'minor') {
      return visibleIssues.filter(
        (i) => !resolvedIssueIds.includes(i.id) && i.severity === 'minor',
      )
    }
    if (toFixCategoryFilter === 'resolved') {
      return visibleIssues.filter((i) => resolvedIssueIds.includes(i.id))
    }
    return visibleIssues
  }, [visibleIssues, resolvedIssueIds, toFixCategoryFilter])
  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
  const followUpQuestionByIssue = {
    wifi: 'Was the WiFi stable during your stay?',
    'hot-water': 'Did hot water arrive quickly when you needed it?',
    'pool-hours': 'Were the pool hours clear and easy to find?',
  }

  const handleReservationDateKeyChange = useCallback((key) => {
    setSelectedReservationDateKey(key)
  }, [])

  const reservationsForSelectedDay = useMemo(
    () => reservationRows.filter((r) => reservationIncludesDate(r, selectedReservationDateKey)),
    [selectedReservationDateKey],
  )

  const goToProperty = (p) => {
    setActiveProperty(p)
    setScreen('detail')
    setTabEnterDirection('none')
    setActiveTab('overview')
    setListingOverlayOpen(false)
    setToFixCategoryFilter(null)
    setSelectedToFixId(null)
  }

  const scrollToManageProperties = () => {
    window.scrollTo({ top: getHomeCoreSwitchScrollY(), behavior: 'smooth' })
  }

  const onGridNav = () => {
    setScreen('home')
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  const onDerivedNav = (tabKey) => {
    if (tabKey === activeTab) return
    const order = navItemsDerived.map((item) => item.key)
    const from = order.indexOf(activeTab)
    const to = order.indexOf(tabKey)
    if (to < 0) {
      setActiveTab(tabKey)
      return
    }
    setTabEnterDirection(to > from ? 'forward' : 'back')
    setActiveTab(tabKey)
  }

  const queueIssueDismissal = (issueId) => {
    if (dismissedIssueIds.includes(issueId) || dismissingIssueIds.includes(issueId)) return
    setDismissingIssueIds((prev) => [...prev, issueId])
    const timeoutId = window.setTimeout(() => {
      dismissTimersRef.current.delete(issueId)
      setDismissingIssueIds((prev) => prev.filter((id) => id !== issueId))
      setDismissedIssueIds((prev) => (prev.includes(issueId) ? prev : [...prev, issueId]))
    }, 2000)
    dismissTimersRef.current.set(issueId, timeoutId)
  }

  useEffect(() => {
    if (screen !== 'home') return

    const computeSlot = () => {
      const y = getScrollY()
      const threshold = getHomeCoreSwitchScrollY()
      return y >= threshold ? 1 : 0
    }

    setHomeCoreSlot(computeSlot())

    const onScrollOrResize = () => {
      const next = computeSlot()
      setHomeCoreSlot((prev) => (prev === next ? prev : next))
    }

    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [screen])

  useEffect(() => {
    if (screen !== 'detail') setListingOverlayOpen(false)
  }, [screen])

  useEffect(() => {
    if (screen !== 'detail' || listingOverlayOpen) return
    detailTabScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' })
  }, [activeTab, activeProperty.id, screen, listingOverlayOpen])

  useEffect(() => {
    return () => {
      dismissTimersRef.current.forEach((id) => window.clearTimeout(id))
      dismissTimersRef.current.clear()
    }
  }, [])

  useEffect(() => {
    if (activeTab !== 'to-fix') {
      setToFixCategoryFilter(null)
      setSelectedToFixId(null)
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== 'reviews') {
      setReviewsTravelerFilter(null)
    }
  }, [activeTab])

  const guestReviewsCountBySegment = useMemo(() => {
    const counts = Object.fromEntries(segmentScores.map((s) => [s.id, 0]))
    for (const r of guestReviewFeed) {
      if (counts[r.segmentId] != null) counts[r.segmentId] += 1
    }
    return counts
  }, [])

  const filteredGuestReviews = useMemo(() => {
    if (reviewsTravelerFilter == null) return guestReviewFeed
    return guestReviewFeed.filter((r) => r.segmentId === reviewsTravelerFilter)
  }, [reviewsTravelerFilter])

  useEffect(() => {
    if (!selectedToFixId) return
    const stillVisible = toFixFilteredIssues.some((i) => i.id === selectedToFixId)
    if (!stillVisible) setSelectedToFixId(null)
  }, [toFixFilteredIssues, selectedToFixId])

  if (showMobile) {
    return (
      <div className="mobile-fullscreen">
        <button type="button" className="mobile-fullscreen-back" onClick={() => setShowMobile(false)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Dashboard
        </button>
        <div className="phone-frame">
          <div className="phone-top-bar"><div className="phone-notch" /></div>
          <div className="phone-screen">
            <iframe src={MOBILE_APP_URL} title="Traveler mobile app" className="phone-iframe" allow="microphone" />
          </div>
          <div className="phone-bottom-bar"><div className="phone-home-indicator" /></div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="site-header">
        <div className="site-header-accent" aria-hidden />
        <div className="site-header-bar">
          <div className="site-header-brand">
            <img
              className="wordmark-logo"
              src={EXPEDIA_LOGO_SRC}
              alt="Expedia Group"
            />
          </div>
          <span className="avatar-badge site-header-avatar" aria-label="User initials">
            {USER_INITIALS}
          </span>
        </div>
      </header>

      <div className={`shell${screen === 'detail' ? ' shell-detail' : ''}`}>
        {screen === 'home' ? (
          <div className="page fade-in" key="home">
            <section className="welcome-hero">
              <img className="welcome-hero-image" src={MAIN_HERO_IMAGE_SRC} alt="Ocean sunset" />
              <div className="welcome-hero-content">
                <div className="welcome-hero-row">
                  <div className="welcome-text-block">
                    <p className="welcome-kicker">Welcome back,</p>
                    <h1 className="welcome-name">{USER_NAME}</h1>
                    <p className="welcome-date">{dateLabel}</p>
                  </div>
                </div>
              </div>
            </section>

            <header
              ref={managePropertiesRef}
              id="manage-your-properties"
              className="properties-section-header"
            >
              <h2 className="properties-section-title">Manage your properties</h2>
            </header>

            {/* ── Property grid ── */}
            <section className="property-grid">
              {properties.map((p) => (
                <article className="card-property" key={p.id} onClick={() => goToProperty(p)}>
                  <div className="card-img">
                    <img src={p.image} alt={p.name} />
                    <div className="card-img-overlay" />
                    <span className="card-badge">{p.rating.toFixed(1)}</span>
                  </div>
                  <div className="card-body">
                    <h2 className="card-title">{p.name}</h2>
                    <p className="card-location">{p.location}</p>
                    <p className="card-status">{p.status}</p>
                    <p className="metric-label">review coverage</p>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${p.coverage}%` }} />
                    </div>
                    <p className="card-meta">
                      {p.reviews.toLocaleString()} reviews · {p.resolved} of {p.totalIssues} issues resolved
                    </p>
                  </div>
                </article>
              ))}
            </section>
          </div>
        ) : (
          <div
            className="page page-detail fade-in"
            key="detail"
          >
            <div className="detail-layout">
              <aside className="detail-visual" aria-label="Property photo">
                <div className="detail-visual-frame">
                  <img
                    src={activeProperty.image}
                    alt={activeProperty.name}
                    className="detail-visual-img"
                  />
                  <div className="detail-visual-shade" aria-hidden />
                  <div className="detail-visual-copy">
                    <h1 className="detail-visual-title">{activeProperty.name}</h1>
                    <p className="detail-visual-meta">
                  {activeProperty.location} · {activeProperty.rating.toFixed(1)} stars ·{' '}
                  {activeProperty.reviews.toLocaleString()} reviews
                </p>
              </div>
                  <button
                    type="button"
                    className="detail-listing-fab"
                    onClick={() => setListingOverlayOpen(true)}
                    aria-expanded={listingOverlayOpen}
                    aria-haspopup="true"
                    aria-label="View full property listing"
                  >
                    <IconPlusFab />
                  </button>
                </div>
              </aside>

              {/* ── Workspace (sections driven by side nav icons only) ── */}
              <div className="detail-main">
                {!listingOverlayOpen ? (
                  <div className="detail-section-dots" aria-hidden="true">
                    {navItemsDerived.map(({ key }) => (
                      <span
                        key={key}
                        className={`detail-section-dot${activeTab === key ? ' detail-section-dot--active' : ''}`}
                      />
                    ))}
                  </div>
                ) : null}
                <div className="detail-workspace">
                  {listingOverlayOpen && activeProperty.listing ? (
                    <PropertyListingPanel
                      property={activeProperty}
                      onClose={() => setListingOverlayOpen(false)}
                    />
                  ) : (
                  <>
                    <div
                      ref={detailTabScrollRef}
                      className={`detail-tab-scroll${activeTab === 'overview' ? ' tab-body--dashboard-fit' : ''}${activeTab === 'reservations' ? ' detail-tab-scroll--reservations-fit' : ''}${activeTab === 'reviews' ? ' detail-tab-scroll--reviews-fit' : ''}`}
                    >
                      <div
                        key={activeTab}
                        className={`detail-tab-pane-shell${
                          tabEnterDirection === 'forward'
                            ? ' detail-tab-pane-shell--enter-forward'
                            : tabEnterDirection === 'back'
                              ? ' detail-tab-pane-shell--enter-back'
                              : ''
                        }`}
                      >
                      {activeTab === 'overview' && (
                      <section
                        className="detail-tab-pane"
                        aria-label="Property dashboard"
                      >
                        <div className="detail-snap-section-inner tab-body--dashboard-fit">
                <div className="property-dashboard">
                  <div className="overview-dashboard-cards">
                    <article className="card card-coverage-widget">
                      <div className="coverage-widget-head">
                        <h3 className="coverage-widget-stat">
                          <span className="coverage-widget-pct">{activeProperty.coverage}%</span>
                          <span className="coverage-widget-label">Review coverage</span>
                        </h3>
                        <span
                          className={`dashboard-status-pill dashboard-status-pill--${getDashboardStatusPillVariant(activeProperty.status, activeProperty.attention)}`}
                        >
                          {activeProperty.status}
                        </span>
                  </div>
                      <div className="progress-track progress-track-coverage">
                        <div className="progress-fill" style={{ width: `${activeProperty.coverage}%` }} />
                      </div>
                      <p className="card-footnote coverage-widget-footnote">
                        {activeProperty.resolved} of {activeProperty.totalIssues} issues resolved
                      </p>
                    </article>

                    <div className="card card-dashboard-checklist">
                      <div className="dashboard-checklist-header">
                        <p className="dashboard-checklist-heading">From your to-fix list</p>
                        <div className="dashboard-checklist-header-trailing">
                          <span
                            className="dashboard-checklist-count-pill"
                            aria-label={`${openActionsCount} ${openActionsCount === 1 ? 'action needs' : 'actions need'} a fix`}
                          >
                            {openActionsCount} to fix
                          </span>
                        </div>
                      </div>
                      <div className="dashboard-checklist-body">
                        {visibleIssues.length === 0 ? (
                          <p className="dashboard-checklist-empty">Nothing open — you&apos;re all set.</p>
                        ) : (
                          <ul className="dashboard-checklist" aria-label="Issues to address">
                            {visibleIssues.map((issue) => {
                              const resolved = resolvedIssueIds.includes(issue.id)
                              const dismissing = dismissingIssueIds.includes(issue.id)
                              return (
                                <li
                                  className={`dashboard-checklist-item${dismissing ? ' dashboard-checklist-item--dismissing' : ''}`}
                                  key={issue.id}
                                >
                      <button
                                    type="button"
                                    className={`dashboard-check-circle ${resolved ? 'dashboard-check-circle--done' : ''}`}
                        onClick={() => {
                                      if (resolved) {
                                        // Uncheck: remove from resolved list
                                        setResolvedIssueIds((prev) => prev.filter((id) => id !== issue.id))
                                      } else {
                                        // Check: mark resolved and trigger dismissal animation
                                        setResolvedIssueIds((prev) => [...prev, issue.id])
                                        queueIssueDismissal(issue.id)
                                      }
                                    }}
                                    aria-pressed={resolved}
                                    aria-label={resolved ? 'Mark as not fixed' : 'Mark as fixed'}
                                    disabled={dismissing}
                                  >
                                    {resolved && (
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    )}
                                  </button>
                                  <p className={`dashboard-checklist-title ${resolved || dismissing ? 'dashboard-checklist-title--done' : ''}`}>
                                    {issue.title}
                                  </p>
                                  <div className="dashboard-checklist-actions">
                                    <button
                                      type="button"
                                      className="dashboard-pill-btn dashboard-pill-btn--ghost"
                                      onClick={() => queueIssueDismissal(issue.id)}
                                      disabled={dismissing}
                                    >
                                      {dismissing ? 'Dismissing...' : 'Dismiss'}
                                    </button>
                                    <button
                                      type="button"
                                      className="dashboard-pill-btn dashboard-pill-btn--solid"
                                      onClick={() => setListingOverlayOpen(true)}
                                      disabled={dismissing}
                                    >
                                      Update listing
                      </button>
                    </div>
                                </li>
                              )
                            })}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="dashboard-placeholder-widgets" aria-label="Additional dashboard modules">
                      <DashboardUpcomingGuestsWidget guest={activeProperty.upcomingGuest} />
                      <DashboardReviewTrendWidget trend={activeProperty.reviewTrend} rating={activeProperty.rating} />
                      <DashboardRevenueMonthWidget revenue={activeProperty.revenueThisMonth} />
                    </div>
                  </div>
                </div>
                        </div>
                      </section>
                      )}

                      {activeTab === 'to-fix' && (
                      <section
                        className="detail-tab-pane detail-tab-pane--to-fix"
                        aria-label="Actions needed"
                      >
                        <div className="detail-snap-section-inner detail-snap-section-inner--to-fix">
                  <div className="to-fix-split">
                    <div className="to-fix-split-list">
                      <div
                        className="to-fix-quick-actions"
                        role="region"
                        aria-label="Quick contact for repairs"
                      >
                        <p className="to-fix-quick-actions-kicker">Quick contact</p>
                        <div className="to-fix-quick-actions-grid">
                          {toFixQuickContactActions.map((action) => {
                            const QIcon = action.Icon
                            return (
                              <button
                                key={action.id}
                                type="button"
                                className="to-fix-quick-action-btn"
                                aria-label={action.label}
                              >
                                <span className="to-fix-quick-action-icon" aria-hidden>
                                  <QIcon />
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      <div className="to-fix-list-widget">
                        {visibleIssues.length > 0 ? (
                          <div className="to-fix-list-widget-header">
                            <div
                              className="to-fix-pill-row"
                              role="group"
                              aria-label="Filter issues by category"
                            >
                              <button
                                type="button"
                                className={`to-fix-pill to-fix-pill--major${toFixCategoryFilter === 'major' ? ' to-fix-pill--selected' : ''}`}
                                onClick={() =>
                                  setToFixCategoryFilter((f) => (f === 'major' ? null : 'major'))
                                }
                              >
                                Major fixes{' '}
                                <span className="to-fix-pill-count">{toFixMajorOpenCount}</span>
                              </button>
                              <button
                                type="button"
                                className={`to-fix-pill to-fix-pill--minor${toFixCategoryFilter === 'minor' ? ' to-fix-pill--selected' : ''}`}
                                onClick={() =>
                                  setToFixCategoryFilter((f) => (f === 'minor' ? null : 'minor'))
                                }
                              >
                                Minor fixes{' '}
                                <span className="to-fix-pill-count">{toFixMinorOpenCount}</span>
                              </button>
                              <button
                                type="button"
                                className={`to-fix-pill to-fix-pill--resolved${toFixCategoryFilter === 'resolved' ? ' to-fix-pill--selected' : ''}`}
                                onClick={() =>
                                  setToFixCategoryFilter((f) => (f === 'resolved' ? null : 'resolved'))
                                }
                              >
                                Resolved issues{' '}
                                <span className="to-fix-pill-count">{toFixResolvedCount}</span>
                              </button>
                            </div>
                          </div>
                        ) : null}
                        <div className="to-fix-list-widget-scroll">
                          {visibleIssues.length === 0 ? (
                            <p className="to-fix-empty to-fix-empty--in-widget">Nothing to fix for now.</p>
                          ) : toFixFilteredIssues.length === 0 ? (
                            <p className="to-fix-filter-empty">No tasks in this category.</p>
                          ) : (
                            <ul className="to-fix-task-list" aria-label="To-do tasks">
                              {toFixFilteredIssues.map((issue) => {
                      const resolved = resolvedIssueIds.includes(issue.id)
                                const dismissing = dismissingIssueIds.includes(issue.id)
                                const active = selectedToFixId === issue.id
                      return (
                                  <li key={issue.id}>
                                    <button
                                      type="button"
                                      className={`to-fix-list-item${active ? ' to-fix-list-item--active' : ''}${dismissing ? ' to-fix-list-item--dismissing' : ''}${resolved ? ' to-fix-list-item--resolved' : ''}`}
                                      onClick={() => setSelectedToFixId(issue.id)}
                                      disabled={dismissing}
                                    >
                                      <span className="to-fix-list-item-icon" aria-hidden>
                                        {(() => {
                                          const Ic = iconMap[issue.icon]
                                          return Ic ? <Ic /> : null
                                        })()}
                                      </span>
                                      <span className="to-fix-list-item-body">
                                        <span className="to-fix-list-item-title">{issue.title}</span>
                                        <span className="to-fix-list-item-meta">{issue.confidence}</span>
                                      </span>
                                    </button>
                                  </li>
                                )
                              })}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="to-fix-split-detail">
                      {(() => {
                        const issue = selectedToFixId
                          ? visibleIssues.find((i) => i.id === selectedToFixId)
                          : null
                        if (!issue) {
                          return (
                            <div
                              className="to-fix-detail-placeholder"
                              role="region"
                              aria-label="Task details"
                            >
                              <p>Select a to-do to see more information</p>
                            </div>
                          )
                        }
                        const resolved = resolvedIssueIds.includes(issue.id)
                        const dismissing = dismissingIssueIds.includes(issue.id)
                        return (
                          <article
                            className={`card card-issue to-fix-detail-card ${resolved ? 'card-resolved' : ''}${dismissing ? ' card-issue--dismissing' : ''}`}
                          >
                          <div className="card-row">
                              <span className="card-icon">
                                {(() => {
                                  const Ic = iconMap[issue.icon]
                                  return Ic ? <Ic /> : null
                                })()}
                              </span>
                            <div className="to-fix-detail-card-head">
                              <h3 className="card-heading">{issue.title}</h3>
                              <span className="chip">{issue.confidence}</span>
                            </div>
                          </div>
                          <div className="quote-list">
                              {issue.quotes.map((q, quoteIdx) => (
                                <div className="quote" key={`${issue.id}-q-${quoteIdx}`}>
                                  <img
                                    className="quote-avatar"
                                    src={q.avatar ?? REVIEW_AVATAR_FALLBACK}
                                    alt={`Guest reviewer ${q.initials}`}
                                    width={36}
                                    height={36}
                                    loading="lazy"
                                    decoding="async"
                                  />
                                <p className="quote-text">&ldquo;{q.text}&rdquo;</p>
                                <span className="quote-date">{q.month}</span>
                              </div>
                            ))}
                          </div>
                          <p className="card-footnote">{issue.impact}</p>
                          <div className="btn-row">
                            <button
                                type="button"
                              className="btn-primary"
                                onClick={() => {
                                  if (!resolvedIssueIds.includes(issue.id)) {
                                    setResolvedIssueIds((prev) => [...prev, issue.id])
                                    queueIssueDismissal(issue.id)
                                  }
                                }}
                                disabled={dismissing}
                            >
                              Mark as fixed
                            </button>
                            <button
                                type="button"
                              className="btn-ghost"
                                onClick={() => queueIssueDismissal(issue.id)}
                                disabled={dismissing}
                              >
                                {dismissing ? 'Dismissing...' : 'Not applicable'}
                            </button>
                          </div>
                          <p className="action-explainer">
                            It&apos;s fixed requests confirmation from the next guest. Update listing
                            creates a wording proposal in Listing updates.
                          </p>
                            {resolved ? (
                            <p className="inline-confirm banner-confirm">
                              The next guest will be asked: &quot;
                              {followUpQuestionByIssue[issue.id]}
                              &quot;
                            </p>
                            ) : null}
                        </article>
                      )
                      })()}
                  </div>
                  </div>
                  </div>
                      </section>
                      )}

                      {activeTab === 'reservations' && (
                      <section
                        className="detail-tab-pane detail-tab-pane--reservations"
                        aria-label="Reservations and prices"
                      >
                        <div className="detail-snap-section-inner detail-snap-section-inner--reservations">
                  <div className="reservations-layout">
                    <ReservationsCalendarWidget
                      reservationRows={reservationRows}
                      selectedDateKey={selectedReservationDateKey}
                      onSelectedDateKeyChange={handleReservationDateKeyChange}
                    />
                    <div className="stack reservations-bookings-stack">
                      {reservationsForSelectedDay.length === 0 ? (
                        <p className="reservations-bookings-empty">
                          No reservations on this date.
                        </p>
                      ) : (
                        reservationsForSelectedDay.map((row) => {
                          const totalPaid = row.rate * row.nights
                          const guestLabel = row.guestDisplay ?? row.guest
                      return (
                            <article
                              className={`booking-card ${bookingCardStatusClass(row.status)}`}
                              key={row.id}
                            >
                              <div className="booking-card-layout">
                                <img
                                  className="booking-card-avatar"
                                  src={row.avatar}
                                  alt=""
                                />
                                <div className="booking-card-main">
                                  <div className="booking-card-header">
                                    <p className="booking-card-name">{guestLabel}</p>
                                    <span className="booking-card-status">{row.status}</span>
                              </div>
                                  <p className="booking-card-dates">{row.range}</p>
                                  <div className="booking-card-footer">
                                    <span className="booking-card-nights">
                                      {row.nights} {row.nights === 1 ? 'night' : 'nights'}
                                    </span>
                                    <span className="booking-card-paid">
                                      ${totalPaid.toLocaleString()} paid
                                    </span>
                              </div>
                                </div>
                              </div>
                        </article>
                      )
                        })
                      )}
                  </div>
                    </div>
                        </div>
                      </section>
                      )}

                      {activeTab === 'reviews' && (
                      <section
                        className="detail-tab-pane detail-tab-pane--reviews"
                        aria-label="All reviews"
                      >
                        <div className="detail-snap-section-inner detail-snap-section-inner--reviews">
                  <ReviewsPageSummaryWidgets
                    rating={activeProperty.rating}
                    reviewCount={activeProperty.reviews}
                    segments={segmentScores}
                  />

                  <div className="reviews-main-split">
                    <div className="reviews-all-panel-column">
                  <div
                    className="reviews-all-panel to-fix-list-widget"
                    role="region"
                    aria-label="All guest reviews"
                  >
                    <div className="to-fix-list-widget-header reviews-all-panel-header">
                      <h2 className="reviews-all-panel-title">View all reviews</h2>
                      <div
                        className="to-fix-pill-row"
                        role="group"
                        aria-label="Filter reviews by traveler type"
                      >
                        <button
                          type="button"
                          className={`to-fix-pill${reviewsTravelerFilter === null ? ' to-fix-pill--selected to-fix-pill--reviews-all' : ''}`}
                          aria-label={`All traveler types, ${guestReviewFeed.length} reviews`}
                          onClick={() => setReviewsTravelerFilter(null)}
                        >
                          All{' '}
                          <span className="to-fix-pill-count">{guestReviewFeed.length}</span>
                        </button>
                    {segmentScores.map((seg) => {
                          const count = guestReviewsCountBySegment[seg.id] ?? 0
                          const selected = reviewsTravelerFilter === seg.id
                      return (
                          <button
                              type="button"
                              key={seg.id}
                              className={`to-fix-pill${selected ? ' to-fix-pill--selected' : ''}`}
                              aria-label={`${seg.label}, ${count} reviews`}
                              style={
                                selected ? travelerSegmentPillSelectedStyle(seg.color) : undefined
                              }
                            onClick={() =>
                                setReviewsTravelerFilter((f) => (f === seg.id ? null : seg.id))
                              }
                            >
                              {TRAVELER_REVIEW_FILTER_COMPACT[seg.id] ??
                                TRAVELER_REVIEW_PILL_LABEL[seg.id] ??
                                seg.label}{' '}
                              <span className="to-fix-pill-count">{count}</span>
                          </button>
                          )
                        })}
                      </div>
                    </div>
                    <div className="to-fix-list-widget-scroll reviews-all-panel-scroll">
                      {filteredGuestReviews.length === 0 ? (
                        <p className="to-fix-filter-empty">No reviews in this category.</p>
                      ) : (
                        <ul className="reviews-feed-list">
                          {filteredGuestReviews.map((r) => {
                            const seg = segmentScores.find((s) => s.id === r.segmentId)
                            const a11yName = seg
                              ? `Guest ${r.author}, ${seg.label}`
                              : `Guest ${r.author}`
                            return (
                              <li key={r.id}>
                                <article className="reviews-feed-item" aria-label={a11yName}>
                                  <img
                                    className="reviews-feed-avatar"
                                    src={r.avatar ?? REVIEW_AVATAR_FALLBACK}
                                    alt=""
                                    width={36}
                                    height={36}
                                    loading="lazy"
                                    decoding="async"
                                  />
                                  <div className="reviews-feed-body">
                                    <span className="reviews-feed-author">{r.author}</span>
                                    {seg ? (
                                      <span
                                        className="reviews-feed-tag"
                              style={{
                                          borderColor: seg.color,
                                          color: seg.color,
                                          background: `${seg.color}22`,
                              }}
                                      >
                                        {seg.label}
                                      </span>
                                    ) : null}
                          </div>
                        </article>
                              </li>
                      )
                    })}
                        </ul>
                      )}
                    </div>
                  </div>
                  </div>

                    <div className="reviews-secondary-column">
                  <ReviewsCategoryWidgets propertyId={activeProperty.id} />

                  <div className="section-head">
                    <h2>Hidden gems</h2>
                  </div>
                  <article className="card reviews-hidden-gems-card">
                    <p className="card-body-text">
                      Your spa is mentioned in <strong>0 of 94 reviews</strong> — guests may not
                      know it exists.
                    </p>
                    <button
                      type="button"
                      className="btn-primary reviews-hidden-gems-cta"
                      onClick={() => setListingOverlayOpen(true)}
                      title="Open your listing to highlight this amenity for guests"
                      aria-label="Open listing editor to highlight your spa for guests"
                    >
                      Highlight spa in listing
                      </button>
                  </article>
                  </div>
                  </div>
                        </div>
                      </section>
                      )}
                      </div>
                  </div>
                </>
              )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Side nav: white pill (core only) + gray oval that grows below on detail ── */}
      <nav className="nav-stack" aria-label="Primary navigation">
        <div className="nav-bar-pill">
          <div className="nav-bar-core">
            {screen === 'home' && (
              <span
                className="nav-core-glow"
                style={{
                  transform: `translateY(calc(${homeCoreSlot} * (var(--nav-item-size) + var(--nav-icon-gap))))`,
                }}
                aria-hidden
              />
            )}
            <button
              type="button"
              className={`nav-item ${screen === 'home' && homeCoreSlot === 0 ? 'nav-core-active' : ''}`}
              onClick={onGridNav}
              aria-label="All properties"
              title="All properties"
              aria-current={screen === 'home' && homeCoreSlot === 0 ? 'true' : undefined}
            >
              <IconNavGrid />
            </button>
            {screen === 'home' ? (
              <button
                type="button"
                className={`nav-item ${homeCoreSlot === 1 ? 'nav-core-active' : ''}`}
                onClick={scrollToManageProperties}
                aria-label="Manage your properties"
                title="Manage your properties"
                aria-current={homeCoreSlot === 1 ? 'true' : undefined}
              >
                <IconNavHome />
              </button>
            ) : (
              <button
                type="button"
                className={`nav-item nav-item-property-thumb ${activeTab === 'overview' ? 'nav-active' : ''}`}
                onClick={() => onDerivedNav('overview')}
                aria-label={`${activeProperty.name} dashboard`}
                title="Property dashboard"
              >
                <img src={activeProperty.image} alt="" className="nav-property-thumb-img" />
              </button>
            )}
          </div>
        </div>
        <div
          className={`nav-bar-extension ${screen === 'detail' ? 'nav-bar-extension-open' : ''}`}
          aria-hidden={screen !== 'detail'}
        >
          <div className="nav-bar-derived" aria-label="This property">
            {navItemsDerived.map((item) => {
              const { key, label, icon: ItemIcon } = item
              const active = activeTab === key
          return (
            <button
              key={key}
                  type="button"
                  className={`nav-item nav-item-derived ${active ? 'nav-active' : ''}`}
                  onClick={() => onDerivedNav(key)}
                  aria-label={label}
                  title={label}
                  tabIndex={screen === 'detail' ? 0 : -1}
                >
                  <ItemIcon />
            </button>
          )
        })}
          </div>
        </div>
      </nav>

      {typeof window !== 'undefined' && window.self === window.top && !showMobile && (
        <button
          type="button"
          className="mobile-preview-btn"
          onClick={() => setShowMobile(true)}
          aria-label="Preview traveler mobile app"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
          <span>Traveler View</span>
        </button>
      )}
    </div>
  )
}

export default App
