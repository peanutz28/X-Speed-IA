import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { Canvas, useFrame } from '@react-three/fiber'

function WebGLAmbient() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const gl = canvas.getContext('webgl', { alpha: true, antialias: true })
    if (!gl) return undefined

    const vertexSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `

    const fragmentSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = uv - 0.5;
        p.x *= u_resolution.x / u_resolution.y;

        float pulse = sin(u_time * 0.35) * 0.5 + 0.5;
        float swirl = sin(8.0 * length(p + vec2(0.08 * sin(u_time * 0.2), 0.04 * cos(u_time * 0.25))) - u_time * 0.8);
        float glowA = 0.28 / (length(p - vec2(-0.28 + u_mouse.x * 0.2, 0.1 + u_mouse.y * 0.12)) + 0.3);
        float glowB = 0.22 / (length(p - vec2(0.25 - u_mouse.x * 0.15, -0.16 - u_mouse.y * 0.1)) + 0.34);
        float vignette = smoothstep(0.95, 0.25, length(p));

        vec3 base = vec3(0.06, 0.09, 0.16);
        vec3 navy = vec3(0.12, 0.16, 0.26);
        vec3 gold = vec3(0.99, 0.75, 0.31);
        vec3 blue = vec3(0.36, 0.56, 0.95);

        vec3 color = mix(base, navy, vignette);
        color += gold * glowA * (0.5 + 0.5 * pulse);
        color += blue * glowB * (0.55 + 0.45 * (0.5 + 0.5 * swirl));
        color += 0.05 * sin(vec3(0.0, 2.0, 4.0) + u_time + uv.xyx * 8.0);
        color *= 0.82;

        gl_FragColor = vec4(color, 0.58);
      }
    `

    const compile = (type, source) => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vertex = compile(gl.VERTEX_SHADER, vertexSource)
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource)
    if (!vertex || !fragment) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return

    const positionLocation = gl.getAttribLocation(program, 'a_position')
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
    const timeLocation = gl.getUniformLocation(program, 'u_time')
    const mouseLocation = gl.getUniformLocation(program, 'u_mouse')

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    )

    let mouseX = 0
    let mouseY = 0
    const onMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = (event.clientX - rect.left) / rect.width - 0.5
      mouseY = (event.clientY - rect.top) / rect.height - 0.5
    }
    window.addEventListener('mousemove', onMouseMove)

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * ratio)
      canvas.height = Math.floor(window.innerHeight * ratio)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    gl.useProgram(program)
    gl.enableVertexAttribArray(positionLocation)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    let frameId = 0
    const start = performance.now()
    const render = () => {
      const time = (performance.now() - start) * 0.001
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
      gl.uniform1f(timeLocation, time)
      gl.uniform2f(mouseLocation, mouseX, mouseY)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      frameId = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertex)
      gl.deleteShader(fragment)
    }
  }, [])

  return <canvas className="webgl-ambient" ref={canvasRef} aria-hidden="true" />
}

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

function IconFix() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4L14 13l-3-3z" />
    </svg>
  )
}

function IconList() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  )
}

function IconInsight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconProgress() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 3 3 5-6" />
    </svg>
  )
}

function HeroOrbs() {
  const knotRef = useRef(null)
  const glassRef = useRef(null)

  useFrame((state, delta) => {
    if (knotRef.current) {
      knotRef.current.rotation.x += delta * 0.18
      knotRef.current.rotation.y += delta * 0.34
      knotRef.current.position.x = state.pointer.x * 0.35
      knotRef.current.position.y = -0.2 + state.pointer.y * 0.18
    }
    if (glassRef.current) {
      glassRef.current.rotation.y -= delta * 0.2
      glassRef.current.rotation.z += delta * 0.08
      glassRef.current.position.x = -0.8 + state.pointer.x * 0.2
      glassRef.current.position.y = 0.45 + state.pointer.y * 0.15
    }
  })

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[1.8, 2.4, 2.1]} intensity={1.2} color="#ffd58c" />
      <pointLight position={[-2, 1.6, 1.2]} intensity={0.7} color="#6b90ff" />

      <mesh ref={knotRef} position={[0.6, -0.1, -0.2]}>
        <torusKnotGeometry args={[0.46, 0.15, 160, 22]} />
        <meshStandardMaterial
          color="#f7c261"
          metalness={0.85}
          roughness={0.2}
          emissive="#5f2f08"
          emissiveIntensity={0.22}
        />
      </mesh>

      <mesh ref={glassRef} position={[-0.85, 0.48, 0.15]}>
        <icosahedronGeometry args={[0.44, 1]} />
        <meshPhysicalMaterial
          color="#9fb7ff"
          roughness={0.05}
          transmission={0.85}
          thickness={0.8}
          envMapIntensity={1.1}
          metalness={0.12}
          clearcoat={0.85}
        />
      </mesh>
    </>
  )
}

function LuxuryThreeHero() {
  return (
    <div className="hero-three-layer" aria-hidden="true">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 3.2], fov: 42 }} gl={{ alpha: true, antialias: true }}>
        <HeroOrbs />
      </Canvas>
    </div>
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
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=80',
    ],
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
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1501117716987-c8e1ecb210ef?auto=format&fit=crop&w=1400&q=80',
    ],
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
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1562790351-d273a961e0e9?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1519821172141-b5d8d9bce80c?auto=format&fit=crop&w=1400&q=80',
    ],
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
      {
        initials: 'AL',
        avatar:
          'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=120&q=80',
        text: 'Great room, but video calls dropped at night.',
        month: 'Mar',
      },
      {
        initials: 'TK',
        avatar:
          'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=120&q=80',
        text: 'Signal fades near the balcony desk.',
        month: 'Apr',
      },
      {
        initials: 'EM',
        avatar:
          'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=120&q=80',
        text: 'Lobby WiFi is fast, room WiFi was patchy.',
        month: 'Apr',
      },
    ],
  },
  {
    id: 'hot-water',
    icon: 'water',
    title: 'Hot water delay in early mornings',
    confidence: 'A few guests',
    impact: 'Mentioned by 12% of guests this quarter',
    quotes: [
      {
        initials: 'RP',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
        text: 'Water needed 4-5 minutes to heat up.',
        month: 'Feb',
      },
      {
        initials: 'SN',
        avatar:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
        text: 'Everything else felt luxurious and calm.',
        month: 'Mar',
      },
    ],
  },
  {
    id: 'pool-hours',
    icon: 'pool',
    title: 'Pool hours are easy to miss',
    confidence: 'A few guests',
    impact: 'Mentioned by 9% of guests this quarter',
    quotes: [
      {
        initials: 'DV',
        avatar:
          'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=120&q=80',
        text: 'We found the pool but not the opening times.',
        month: 'Mar',
      },
      {
        initials: 'HG',
        avatar:
          'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=120&q=80',
        text: 'Families asked staff for hours twice.',
        month: 'Apr',
      },
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
  'to-do': 'global-todo',
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
  const [selectedImageByProperty, setSelectedImageByProperty] = useState(() =>
    Object.fromEntries(properties.map((property) => [property.id, 0])),
  )
  const [cinematicAutoRotate, setCinematicAutoRotate] = useState(true)
  const [sharedImageTransition, setSharedImageTransition] = useState(null)
  const [detailReady, setDetailReady] = useState(true)

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
  const activeImageIndex = selectedImageByProperty[activeProperty.id] ?? 0
  const activeHeroImage =
    activeProperty.images[activeImageIndex] ?? activeProperty.images[0]
  const ambientImage = screen === 'home' ? properties[0].images[0] : activeHeroImage
  const followUpQuestionByIssue = {
    wifi: 'Was the WiFi stable during your stay?',
    'hot-water': 'Did hot water arrive quickly when you needed it?',
    'pool-hours': 'Were the pool hours clear and easy to find?',
  }
  const fallbackImage = `data:image/svg+xml;utf8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#1a2440"/><stop offset="100%" stop-color="#2d3f68"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#f3c56f" font-size="40" font-family="Poppins, Arial, sans-serif">reviewIQ image</text></svg>',
  )}`
  const handleImageError = (event) => {
    const image = event.currentTarget
    if (image.dataset.fallbackApplied === 'true') return
    image.dataset.fallbackApplied = 'true'
    image.src = fallbackImage
  }

  const goToProperty = (p, event) => {
    const sourceImage = event?.currentTarget?.querySelector('img')
    const sourceRect = sourceImage?.getBoundingClientRect()
    if (sourceRect) {
      setSharedImageTransition({
        image: p.images[0],
        top: sourceRect.top,
        left: sourceRect.left,
        width: sourceRect.width,
        height: sourceRect.height,
        active: false,
      })
    }

    setDetailReady(false)
    setActiveProperty(p)
    setScreen('detail')
    setActiveTab('to-fix')

    if (sourceRect) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const targetImage = document.querySelector('.photo-main img')
          if (!targetImage) {
            setSharedImageTransition(null)
            setDetailReady(true)
            return
          }
          const targetRect = targetImage.getBoundingClientRect()
          setSharedImageTransition({
            image: p.images[0],
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            active: true,
          })
          window.setTimeout(() => setDetailReady(true), 260)
          window.setTimeout(() => setSharedImageTransition(null), 760)
        })
      })
    }
  }

  const onNav = (key) => {
    if (key === 'properties') return setScreen('home')
    if (key === 'to-do') return setScreen('global-todo')
  }

  const handleShellMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    event.currentTarget.style.setProperty('--mx', `${x}%`)
    event.currentTarget.style.setProperty('--my', `${y}%`)
  }

  const handleCubeMove = (event) => {
    const card = event.currentTarget
    if (card._restFrameId) {
      cancelAnimationFrame(card._restFrameId)
      card._restFrameId = null
    }
    const rect = card.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    const rx = (0.5 - y) * 16
    const ry = (x - 0.5) * 16

    card.style.setProperty('--cube-rx', `${rx.toFixed(2)}deg`)
    card.style.setProperty('--cube-ry', `${ry.toFixed(2)}deg`)
    card.style.setProperty('--cube-hx', `${(x * 100).toFixed(2)}%`)
    card.style.setProperty('--cube-hy', `${(y * 100).toFixed(2)}%`)
  }

  const resetCube = (event) => {
    const card = event.currentTarget
    if (card._restFrameId) cancelAnimationFrame(card._restFrameId)

    const styles = getComputedStyle(card)
    const currentRx = Number.parseFloat(styles.getPropertyValue('--cube-rx')) || 0
    const currentRy = Number.parseFloat(styles.getPropertyValue('--cube-ry')) || 0
    const currentHx = Number.parseFloat(styles.getPropertyValue('--cube-hx')) || 50
    const currentHy = Number.parseFloat(styles.getPropertyValue('--cube-hy')) || 50
    const duration = 520
    const start = performance.now()

    const animate = (now) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - (1 - t) * (1 - t) * (1 - t)

      const rx = currentRx + (0 - currentRx) * eased
      const ry = currentRy + (0 - currentRy) * eased
      const hx = currentHx + (50 - currentHx) * eased
      const hy = currentHy + (50 - currentHy) * eased

      card.style.setProperty('--cube-rx', `${rx.toFixed(2)}deg`)
      card.style.setProperty('--cube-ry', `${ry.toFixed(2)}deg`)
      card.style.setProperty('--cube-hx', `${hx.toFixed(2)}%`)
      card.style.setProperty('--cube-hy', `${hy.toFixed(2)}%`)

      if (t < 1) {
        card._restFrameId = requestAnimationFrame(animate)
      } else {
        card._restFrameId = null
      }
    }

    card._restFrameId = requestAnimationFrame(animate)
  }

  useEffect(() => {
    if (screen !== 'detail' || !cinematicAutoRotate) return undefined
    const interval = window.setInterval(() => {
      setSelectedImageByProperty((prev) => {
        const current = prev[activeProperty.id] ?? 0
        return {
          ...prev,
          [activeProperty.id]: (current + 1) % activeProperty.images.length,
        }
      })
    }, 4200)
    return () => window.clearInterval(interval)
  }, [screen, activeProperty.id, activeProperty.images.length, cinematicAutoRotate])

  return (
    <div
      className={`app ${theme} ${screen === 'detail' ? 'app-detail' : ''} ${screen === 'global-todo' ? 'app-detail' : ''}`}
      style={{ '--ambient-image': `url(${ambientImage})` }}
    >
      <WebGLAmbient />
      <div className={`shell ${screen !== 'home' ? 'shell-detail' : ''}`} onMouseMove={handleShellMouseMove}>
        {screen === 'home' ? (
          <div className="page fade-in" key="home">
            <header className="home-brand">
              <div className="brand-mark">
                <span className="brand-mark-dot">e</span>
                <span className="brand-mark-text">expedia group</span>
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
                  onError={handleImageError}
                />
              </div>
            </header>

            <section className="home-hero-banner">
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80"
                alt="Ocean sunrise"
                className="home-hero-image"
                onError={handleImageError}
              />
              <LuxuryThreeHero />
              <div className="home-hero-overlay" />
              <div className="home-hero-content">
                <div className="hero-copy">
                  <p className="hero-welcome">Welcome back,</p>
                  <h1>Jaden</h1>
                  <p className="hero-date">Wednesday, April 15</p>
                </div>
                <div className="hero-kpis">
                  {[
                    { label: 'reviews this month', value: '182' },
                    { label: 'need attention', value: '3' },
                    { label: 'updates ready', value: '4' },
                  ].map((kpi) => (
                    <article
                      className="hero-kpi-card"
                      key={kpi.label}
                    >
                      <strong>{kpi.value}</strong>
                      <span>{kpi.label}</span>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="properties-header">
              <h2>Manage your properties</h2>
              <button className="btn-primary btn-onboard">Onboard new property</button>
            </section>

            <section className="property-grid">
              {properties.map((p) => (
                <article
                  className="card-property"
                  key={p.id}
                  onClick={(event) => goToProperty(p, event)}
                  onMouseMove={handleCubeMove}
                  onMouseLeave={resetCube}
                >
                  <div className="card-img">
                    <img src={p.images[0]} alt={p.name} onError={handleImageError} />
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
        ) : screen === 'detail' ? (
          <div className={`page detail-page fade-in ${detailReady ? 'detail-ready' : 'detail-pending'}`} key="detail">
            <header className="detail-header">
              <button className="btn-back" onClick={() => setScreen('home')}>
                ← See all properties
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
                  onError={handleImageError}
                />
              </div>
            </header>

            <section className="photo-grid">
              <div className="photo-main" onClick={() =>
                setSelectedImageByProperty((prev) => ({
                  ...prev,
                  [activeProperty.id]: 0,
                }))
              }>
                <img src={activeProperty.images[0]} alt={activeProperty.name} onError={handleImageError} />
              </div>
              <div className="photo-side">
                {activeProperty.images.slice(1, 5).map((image, index) => (
                  <div
                    className="photo-tile"
                    key={image}
                    onClick={() =>
                      setSelectedImageByProperty((prev) => ({
                        ...prev,
                        [activeProperty.id]: index + 1,
                      }))
                    }
                  >
                    <img src={image} alt={`${activeProperty.name} view ${index + 2}`} onError={handleImageError} />
                    {index === 3 && (
                      <span className="photo-count-badge">{activeProperty.images.length}+</span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <div className="detail-info-bar">
              <div className="detail-title-block">
                <h1>{activeProperty.name}</h1>
                <p className="detail-meta">{activeProperty.location} · {activeProperty.rating.toFixed(1)} stars · {activeProperty.reviews.toLocaleString()} reviews</p>
              </div>
              <div className="detail-actions">
                <button className="btn-ghost btn-sm-text">Add photos</button>
                <button
                  className={`btn-ghost btn-sm-text ${cinematicAutoRotate ? 'btn-active' : ''}`}
                  onClick={() => setCinematicAutoRotate((prev) => !prev)}
                >
                  {cinematicAutoRotate ? 'Auto rotate' : 'Rotate off'}
                </button>
              </div>
            </div>

            {/* ── Tabs ── */}
            <div className="detail-workspace">
              <aside className="workspace-nav">
                {[
                  ['to-fix', 'To fix', IconFix],
                  ['updates', 'Listing updates', IconList],
                  ['insights', 'What guests say', IconInsight],
                  ['progress', 'Progress', IconProgress],
                ].map(([id, label, Icon]) => (
                  <button
                    key={id}
                    className={`workspace-tab ${activeTab === id ? 'workspace-tab-active' : ''}`}
                    onClick={() => setActiveTab(id)}
                    aria-label={label}
                    title={label}
                  >
                    <span className="workspace-tab-icon"><Icon /></span>
                    <small>{label}</small>
                  </button>
                ))}
              </aside>

              {/* ── Tab content ── */}
              <div className={`tab-body tab-${activeTab} fade-in`} key={activeTab}>
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
                                {q.avatar ? (
                                  <img
                                    className="quote-avatar quote-avatar-photo"
                                    src={q.avatar}
                                    alt={q.initials}
                                    onError={handleImageError}
                                  />
                                ) : (
                                  <span className="quote-avatar">{q.initials}</span>
                                )}
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
        ) : (
          <div className="page fade-in" key="global-todo">
            <header className="detail-header">
              <h2>Your to-do list</h2>
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
                  onError={handleImageError}
                />
              </div>
            </header>
            <div className="stack">
              {(() => {
                const todoItems = []
                properties.forEach((p) => {
                  if (p.attention > 0) {
                    issueSeed.slice(0, p.attention).forEach((issue) => {
                      todoItems.push({
                        key: `${p.id}-issue-${issue.id}`,
                        type: 'fix',
                        label: issue.title,
                        property: p,
                        tab: 'to-fix',
                      })
                    })
                  }
                  if (p.updates > 0) {
                    updatesSeed.slice(0, p.updates).forEach((upd) => {
                      todoItems.push({
                        key: `${p.id}-upd-${upd.id}`,
                        type: 'update',
                        label: `Review listing update: "${upd.type}"`,
                        property: p,
                        tab: 'updates',
                      })
                    })
                  }
                })
                return todoItems.map((item) => (
                  <article
                    className="card todo-card"
                    key={item.key}
                    onClick={() => { setActiveProperty(item.property); setScreen('detail'); setActiveTab(item.tab); }}
                  >
                    <div className="todo-card-inner">
                      <div className="todo-left">
                        <span className={`todo-type-dot todo-type-${item.type}`} />
                        <div>
                          <p className="todo-label">{item.label}</p>
                          <p className="todo-at">@ {item.property.name}</p>
                        </div>
                      </div>
                      <span className={`chip ${item.type === 'fix' ? 'chip-gold' : ''}`}>
                        {item.type === 'fix' ? 'To fix' : 'Update'}
                      </span>
                    </div>
                    <div className="todo-preview">
                      <img src={item.property.images[0]} alt={item.property.name} onError={handleImageError} />
                      <div className="todo-preview-info">
                        <strong>{item.property.name}</strong>
                        <span>{item.property.location} · {item.property.rating} stars</span>
                      </div>
                    </div>
                  </article>
                ))
              })()}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom nav ── */}
      <nav className="nav-bar">
        {['properties', 'to-do'].map((key) => {
          const active =
            (key === 'properties' && (screen === 'home' || screen === 'detail')) ||
            (key === 'to-do' && screen === 'global-todo')
          return (
            <button
              key={key}
              className={`nav-item ${active ? 'nav-active' : ''}`}
              onClick={() => onNav(key)}
            >
              {key === 'properties' ? 'Dashboard' : 'To-do'}
            </button>
          )
        })}
      </nav>

      {sharedImageTransition && (
        <div
          className={`shared-image-transition ${sharedImageTransition.active ? 'active' : ''}`}
          style={{
            top: `${sharedImageTransition.top}px`,
            left: `${sharedImageTransition.left}px`,
            width: `${sharedImageTransition.width}px`,
            height: `${sharedImageTransition.height}px`,
          }}
          aria-hidden="true"
        >
          <img src={sharedImageTransition.image} alt="" onError={handleImageError} />
        </div>
      )}
    </div>
  )
}

export default App
