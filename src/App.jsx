import { useMemo, useState } from 'react'
import './App.css'

function IconSun() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

function IconMoon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

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
  },
]

const issueSeed = [
  {
    id: 'wifi',
    icon: 'wifi',
    title: 'WiFi is unstable in corner suites',
    confidence: 'Reported often',
    impact: 'Mentioned by 23% of guests this quarter',
    quotes: [
      { initials: 'AL', text: 'Great room, but video calls dropped at night.', month: 'Mar' },
      { initials: 'TK', text: 'Signal fades near the balcony desk.', month: 'Apr' },
      { initials: 'EM', text: 'Lobby WiFi is fast, room WiFi was patchy.', month: 'Apr' },
    ],
  },
  {
    id: 'hot-water',
    icon: 'water',
    title: 'Hot water delay in early mornings',
    confidence: 'A few guests',
    impact: 'Mentioned by 12% of guests this quarter',
    quotes: [
      { initials: 'RP', text: 'Water needed 4-5 minutes to heat up.', month: 'Feb' },
      { initials: 'SN', text: 'Everything else felt luxurious and calm.', month: 'Mar' },
    ],
  },
  {
    id: 'pool-hours',
    icon: 'pool',
    title: 'Pool hours are easy to miss',
    confidence: 'A few guests',
    impact: 'Mentioned by 9% of guests this quarter',
    quotes: [
      { initials: 'DV', text: 'We found the pool but not the opening times.', month: 'Mar' },
      { initials: 'HG', text: 'Families asked staff for hours twice.', month: 'Apr' },
    ],
  },
]

const updatesSeed = [
  {
    id: 'upd-1',
    type: 'New detail discovered',
    quote: 'The adults-only sunset terrace is absolutely magical.',
    before: 'Rooftop terrace with seating.',
    after: 'Adults-only sunset terrace with ocean views and evening service.',
  },
  {
    id: 'upd-2',
    type: 'Issue resolved',
    quote: 'Water pressure is perfect now after the recent maintenance.',
    before: 'Hot water available in all rooms.',
    after: 'Updated plumbing now delivers consistent hot water during peak morning hours.',
  },
  {
    id: 'upd-3',
    type: 'Guest confirmed this',
    quote: 'Breakfast has local pastries and made-to-order options.',
    before: 'Daily breakfast is served.',
    after: 'Daily breakfast includes local pastries, seasonal fruit, and made-to-order plates.',
  },
]

const segmentScores = [
  { id: 'business', label: 'Business travelers', score: 4.2, color: '#5b8def' },
  { id: 'families', label: 'Families', score: 4.7, color: '#febf4f' },
  { id: 'couples', label: 'Couples', score: 4.8, color: '#f472b6' },
  { id: 'solo', label: 'Solo travelers', score: 4.5, color: '#00c896' },
]

const navMap = {
  properties: 'home',
  'to-do': 'to-fix',
  updates: 'updates',
  insights: 'insights',
}

function App() {
  const [theme, setTheme] = useState('dark')
  const [screen, setScreen] = useState('home')
  const [activeTab, setActiveTab] = useState('to-fix')
  const [activeProperty, setActiveProperty] = useState(properties[1])
  const [resolvedIssueIds, setResolvedIssueIds] = useState([])
  const [dismissedIssueIds, setDismissedIssueIds] = useState([])
  const [undoIssueId, setUndoIssueId] = useState('')
  const [approvedUpdateIds, setApprovedUpdateIds] = useState([])
  const [updateDrafts, setUpdateDrafts] = useState(() =>
    Object.fromEntries(updatesSeed.map((u) => [u.id, u.after])),
  )
  const [expandedSegments, setExpandedSegments] = useState([])

  const visibleIssues = useMemo(
    () => issueSeed.filter((i) => !dismissedIssueIds.includes(i.id)),
    [dismissedIssueIds],
  )
  const pendingUpdates = useMemo(
    () => updatesSeed.filter((u) => !approvedUpdateIds.includes(u.id)),
    [approvedUpdateIds],
  )

  const progressDone = resolvedIssueIds.length + 5
  const progressTotal = 13
  const ambientImage = screen === 'home' ? properties[0].image : activeProperty.image
  const followUpQuestionByIssue = {
    wifi: 'Was the WiFi stable during your stay?',
    'hot-water': 'Did hot water arrive quickly when you needed it?',
    'pool-hours': 'Were the pool hours clear and easy to find?',
  }

  const goToProperty = (p) => {
    setActiveProperty(p)
    setScreen('detail')
    setActiveTab('to-fix')
  }

  const onNav = (key) => {
    if (key === 'properties') return setScreen('home')
    setScreen('detail')
    setActiveTab(navMap[key])
  }

  const handleShellMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    event.currentTarget.style.setProperty('--mx', `${x}%`)
    event.currentTarget.style.setProperty('--my', `${y}%`)
  }

  return (
    <div
      className={`app ${theme}`}
      style={{ '--ambient-image': `url(${ambientImage})` }}
    >
      <div className="shell" onMouseMove={handleShellMouseMove}>
        {screen === 'home' ? (
          <div className="page fade-in" key="home">
            {/* ── Header ── */}
            <header className="header">
              <div>
                <span className="wordmark">reviewIQ</span>
              </div>
              <div className="header-right">
                <button
                  className="btn-ghost btn-sm"
                  onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <IconSun /> : <IconMoon />}
                </button>
                <img
                  className="avatar"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
                  alt=""
                />
              </div>
            </header>

            {/* ── Hero heading ── */}
            <section className="hero-section">
              <p className="section-kicker">Portfolio</p>
              <h1>Your properties</h1>
              <p className="lead">April 15 · 3 things need your attention</p>
            </section>

            {/* ── KPI row ── */}
            <section className="kpi-row">
              {[
                { label: 'reviews this month', value: '182', tone: 'reviews' },
                { label: 'need your attention', value: '3', accent: true, tone: 'attention' },
                { label: 'listing updates ready', value: '4', tone: 'updates' },
              ].map((kpi) => (
                <div className={`kpi kpi-${kpi.tone} ${kpi.accent ? 'kpi-accent' : ''}`} key={kpi.label}>
                  <span className="kpi-value">{kpi.value}</span>
                  <span className="kpi-label">{kpi.label}</span>
                </div>
              ))}
            </section>

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
                    <p className="metric-label">issue resolution progress</p>
                    <div className="progress-track progress-track-secondary">
                      <div
                        className="progress-fill progress-fill-secondary"
                        style={{ width: `${Math.round((p.resolved / p.totalIssues) * 100)}%` }}
                      />
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
          <div className="page fade-in" key="detail">
            {/* ── Detail header ── */}
            <header className="header">
              <button className="btn-ghost btn-back" onClick={() => setScreen('home')}>
                ← Back
              </button>
              <div className="header-right">
                <button
                  className="btn-ghost btn-sm"
                  onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <IconSun /> : <IconMoon />}
                </button>
                <img
                  className="avatar"
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80"
                  alt=""
                />
              </div>
            </header>

            {/* ── Property banner ── */}
            <section className="detail-banner">
              <img src={activeProperty.image} alt={activeProperty.name} className="banner-img" />
              <div className="banner-overlay" />
              <div className="banner-copy">
                <h1>{activeProperty.name}</h1>
                <p>
                  {activeProperty.location} · {activeProperty.rating.toFixed(1)} stars ·{' '}
                  {activeProperty.reviews.toLocaleString()} reviews
                </p>
              </div>
            </section>

            {/* ── Tabs ── */}
            <div className="detail-workspace">
              <aside className="workspace-nav">
                {[
                  ['to-fix', 'To fix', 'Review guest-reported issues'],
                  ['updates', 'Listing updates', 'Approve AI listing changes'],
                  ['insights', 'What guests say', 'Compare traveler segments'],
                  ['progress', 'Progress', 'Track completion journey'],
                ].map(([id, label, helper]) => (
                  <button
                    key={id}
                    className={`workspace-tab ${activeTab === id ? 'workspace-tab-active' : ''}`}
                    onClick={() => setActiveTab(id)}
                  >
                    <span>{label}</span>
                    <small>{helper}</small>
                  </button>
                ))}
              </aside>

              {/* ── Tab content ── */}
              <div className="tab-body fade-in" key={activeTab}>
              {/* TO FIX */}
              {activeTab === 'to-fix' && (
                <>
                  <div className="section-head">
                    <p className="section-kicker">To fix</p>
                    <h2>{visibleIssues.length} things your guests mentioned</h2>
                    <p className="lead">Review and resolve issues flagged from recent feedback</p>
                  </div>

                  {undoIssueId && (
                    <div className="toast">
                      Issue dismissed.
                      <button
                        className="btn-link"
                        onClick={() => {
                          setDismissedIssueIds((prev) => prev.filter((id) => id !== undoIssueId))
                          setUndoIssueId('')
                        }}
                      >
                        Undo
                      </button>
                    </div>
                  )}

                  <div className="stack">
                    {visibleIssues.map((issue) => {
                      const resolved = resolvedIssueIds.includes(issue.id)
                      return (
                        <article className={`card card-issue ${resolved ? 'card-resolved' : ''}`} key={issue.id}>
                          <div className="card-row">
                            <span className="card-icon">{(() => { const Ic = iconMap[issue.icon]; return Ic ? <Ic /> : null })()}</span>
                            <div>
                              <h3 className="card-heading">{issue.title}</h3>
                              <span className="chip">{issue.confidence}</span>
                            </div>
                          </div>

                          <div className="quote-list">
                            {issue.quotes.map((q) => (
                              <div className="quote" key={q.initials + q.month}>
                                <span className="quote-avatar">{q.initials}</span>
                                <p className="quote-text">&ldquo;{q.text}&rdquo;</p>
                                <span className="quote-date">{q.month}</span>
                              </div>
                            ))}
                          </div>

                          <p className="card-footnote">{issue.impact}</p>

                          <div className="btn-row">
                            <button
                              className="btn-primary"
                              onClick={() =>
                                setResolvedIssueIds((prev) =>
                                  prev.includes(issue.id) ? prev : [...prev, issue.id],
                                )
                              }
                            >
                              Mark as fixed
                            </button>
                            <button
                              className="btn-ghost"
                              onClick={() => {
                                setDismissedIssueIds((prev) => [...prev, issue.id])
                                setUndoIssueId(issue.id)
                              }}
                            >
                              Not applicable
                            </button>
                            <button className="btn-ghost" onClick={() => setActiveTab('updates')}>
                              Update listing →
                            </button>
                          </div>
                          <p className="action-explainer">
                            It&apos;s fixed requests confirmation from the next guest. Update listing
                            creates a wording proposal in Listing updates.
                          </p>

                          {resolved && (
                            <p className="inline-confirm banner-confirm">
                              The next guest will be asked: &quot;
                              {followUpQuestionByIssue[issue.id]}
                              &quot;
                            </p>
                          )}
                        </article>
                      )
                    })}
                  </div>
                </>
              )}

              {/* LISTING UPDATES */}
              {activeTab === 'updates' && (
                <>
                  <div className="section-head">
                    <p className="section-kicker">Listing updates</p>
                    <h2>Suggested listing updates</h2>
                    <p className="lead">
                      AI-suggested edits based on guest feedback. Approve or edit before anything
                      goes live.
                    </p>
                  </div>

                  <div className="chip-row">
                    {['All', 'New details', 'Corrections', 'Amenities'].map((f) => (
                      <button className="chip" key={f}>
                        {f}
                      </button>
                    ))}
                  </div>

                  <div className="stack">
                    {updatesSeed.map((upd) => {
                      const done = approvedUpdateIds.includes(upd.id)
                      return (
                        <article className={`card card-update ${done ? 'card-approved' : ''}`} key={upd.id}>
                          <span className="chip chip-gold">{upd.type}</span>

                          {!done ? (
                            <>
                              <blockquote className="guest-quote">
                                &ldquo;{upd.quote}&rdquo;
                              </blockquote>
                              <div className="diff">
                                <p className="diff-old">{upd.before}</p>
                                <span className="diff-arrow">→</span>
                                <textarea
                                  className="diff-new"
                                  value={updateDrafts[upd.id]}
                                  onChange={(e) =>
                                    setUpdateDrafts((prev) => ({
                                      ...prev,
                                      [upd.id]: e.target.value,
                                    }))
                                  }
                                />
                              </div>
                              <div className="btn-row">
                                <button
                                  className="btn-primary"
                                  onClick={() =>
                                    setApprovedUpdateIds((prev) => [...prev, upd.id])
                                  }
                                >
                                  Approve &amp; publish
                                </button>
                                <button
                                  className="btn-ghost"
                                  onClick={() =>
                                    setApprovedUpdateIds((prev) => [...prev, upd.id])
                                  }
                                >
                                  Skip for now
                                </button>
                              </div>
                              <p className="action-explainer">
                                Approve & publish applies this copy to your live listing. Skip keeps
                                this suggestion in your review queue.
                              </p>
                            </>
                          ) : (
                            <p className="published-note">Published · April 14, 2026</p>
                          )}
                        </article>
                      )
                    })}
                  </div>

                  {pendingUpdates.length > 1 && (
                    <div className="sticky-bar">
                      <button
                        className="btn-primary btn-full"
                        onClick={() =>
                          setApprovedUpdateIds(updatesSeed.map((u) => u.id))
                        }
                      >
                        Approve all {pendingUpdates.length} suggestions
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* WHAT GUESTS SAY */}
              {activeTab === 'insights' && (
                <>
                  <div className="section-head">
                    <p className="section-kicker">Guest insights</p>
                    <h2>What guests say</h2>
                    <p className="lead">
                      Understand how different traveler types experience your property
                    </p>
                  </div>

                  <div className="stack">
                    {segmentScores.map((seg) => {
                      const open = expandedSegments.includes(seg.id)
                      return (
                        <article className="card card-segment" key={seg.id}>
                          <button
                            className="segment-toggle"
                            onClick={() =>
                              setExpandedSegments((prev) =>
                                open
                                  ? prev.filter((id) => id !== seg.id)
                                  : [...prev, seg.id],
                              )
                            }
                          >
                            <span className="segment-label">{seg.label}</span>
                            <span className="segment-score">{seg.score.toFixed(1)}</span>
                          </button>
                          <div className="progress-track">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${(seg.score / 5) * 100}%`,
                                background: seg.color,
                              }}
                            />
                          </div>
                          {open && (
                            <div className="segment-detail fade-in">
                              <p className="quote-text">
                                &ldquo;Loved the calm workspace and fast check-in.&rdquo;
                              </p>
                              <p className="quote-text">
                                &ldquo;Breakfast felt curated, not generic.&rdquo;
                              </p>
                            </div>
                          )}
                        </article>
                      )
                    })}
                  </div>

                  <div className="section-head">
                    <h2>What changed recently</h2>
                  </div>
                  <div className="grid-2">
                    <article className="card card-trend">
                      <span className="trend-dot trend-neg" />
                      <h3 className="card-heading">WiFi mentions are rising</h3>
                      <p className="card-footnote">
                        Business travelers flagged speed consistency this week.
                      </p>
                      <button className="btn-link">See the reviews →</button>
                    </article>
                    <article className="card card-trend">
                      <span className="trend-dot trend-pos" />
                      <h3 className="card-heading">Pool feedback is improving</h3>
                      <p className="card-footnote">
                        Families are noticing the updated hours and signage.
                      </p>
                      <button className="btn-link">See the reviews →</button>
                    </article>
                  </div>

                  <div className="section-head">
                    <h2>Hidden gems</h2>
                  </div>
                  <article className="card card-gem">
                    <p className="card-body-text">
                      Your spa is mentioned in <strong>0 of 94 reviews</strong> — guests may not
                      know it exists.
                    </p>
                    <div className="btn-row">
                      <button className="btn-primary" onClick={() => setActiveTab('updates')}>
                        Add to listing →
                      </button>
                      <button className="btn-ghost">Create an action item →</button>
                    </div>
                  </article>
                </>
              )}

              {/* PROGRESS */}
              {activeTab === 'progress' && (
                <>
                  <div className="section-head">
                    <p className="section-kicker">Progress</p>
                    <h2>Your improvement journey</h2>
                    <p className="lead">
                      {progressDone} of {progressTotal} guest-reported issues resolved
                    </p>
                  </div>

                  <div className="progress-large">
                    <div
                      className="progress-large-fill"
                      style={{ width: `${Math.round((progressDone / progressTotal) * 100)}%` }}
                    />
                  </div>

                  <article className="card card-motivate">
                    <p>
                      Fix <strong>3 more</strong> and unlock the{' '}
                      <strong>Highly Responsive</strong> badge — hosts with this badge see an
                      average <strong>+8% in bookings</strong>.
                    </p>
                  </article>

                  <div className="stack">
                    {[
                      {
                        label: 'Hot water restored',
                        state: 'completed',
                        note: 'Confirmed by guests this week',
                      },
                      {
                        label: 'WiFi upgrade planned',
                        state: 'in-progress',
                        note: '2 more guests to confirm',
                      },
                      {
                        label: 'Pool hours are confusing',
                        state: 'not-started',
                        note: '6 guests mentioned this',
                      },
                      {
                        label: 'Parking complaints',
                        state: 'dismissed',
                        note: 'Not applicable for this property',
                      },
                    ].map((item) => (
                      <div className={`status-row status-${item.state}`} key={item.label}>
                        <span className="status-indicator" />
                        <div>
                          <p className="status-label">{item.label}</p>
                          <p className="status-note">{item.note}</p>
                        </div>
                        <span className="status-badge">{item.state.replace('-', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom nav ── */}
      <nav className="nav-bar">
        {['properties', 'to-do', 'updates', 'insights'].map((key) => {
          const active =
            (key === 'properties' && screen === 'home') ||
            (screen === 'detail' && activeTab === navMap[key])
          return (
            <button
              key={key}
              className={`nav-item ${active ? 'nav-active' : ''}`}
              onClick={() => onNav(key)}
            >
              {key}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default App
