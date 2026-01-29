'use client'

import { useState, useEffect } from 'react'
import { characterApi, simulationApi, authApi, Character, User } from '../lib/backend-api'

interface GameState {
  name: string
  age: number
  stage: string
  resources: { health: number; energy: number; money: number; reputation: number; knowledge: number }
  traits: { intelligence: number; charisma: number; resilience: number }
  skills: { work: number; social: number; healthcare: number }
  family: { spouse: string; children: number; legacy: number }
  quests: string[]
  events: string[]
  day: number
  year: number
}

const initialState: GameState = {
  name: "Demo Character",
  age: 25,
  stage: "Adult",
  resources: { health: 85, energy: 70, money: 15000, reputation: 45, knowledge: 120 },
  traits: { intelligence: 35, charisma: 25, resilience: 40 },
  skills: { work: 15, social: 20, healthcare: 10 },
  family: { spouse: "Demo Spouse", children: 2, legacy: 1250 },
  quests: ["Complete Tutorial", "Reach Age 18", "Get First Job"],
  events: ["Welcome to Life Simulator! This is a demo preview.", "You can explore the interface and see how the game works.", "Login with Google to create your own character and start playing!"],
  day: 1,
  year: 1,
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

export default function Home() {
  const [state, setState] = useState<GameState>(initialState)
  const [activeTab, setActiveTab] = useState('events')
  const [bottomTab, setBottomTab] = useState('bottom-actions')
  const [currentCharacterId, setCurrentCharacterId] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Authentication functions from static app.js
  const checkAuth = async () => {
    try {
      const user = await authApi.getCurrentUser()
      setCurrentUser(user)
      setIsLoggedIn(true)
      await loadCharacters()
      if (currentCharacterId) {
        await loadCharacter()
      }
    } catch (err) {
      console.error('Auth check error:', err)
      setIsLoggedIn(false)
      showDemoData()
    } finally {
      setIsLoading(false)
    }
  }

  const showDemoData = () => {
    setState({
      name: 'Demo Character',
      age: 25,
      stage: 'Adult',
      resources: { health: 85, energy: 70, money: 15000, reputation: 45, knowledge: 120 },
      traits: { intelligence: 35, charisma: 25, resilience: 40 },
      skills: { work: 15, social: 20, healthcare: 10 },
      family: { spouse: 'Demo Spouse', children: 2, legacy: 1250 },
      quests: ['Complete Tutorial', 'Reach Age 18', 'Get First Job'],
      events: ['Welcome to Life Simulator! This is a demo preview.', 'You can explore the interface and see how the game works.', 'Login with Google to create your own character and start playing!'],
      day: 1,
      year: 1,
    })
  }

  // Character management functions from static app.js
  const loadCharacters = async () => {
    try {
      const chars = await characterApi.listCharacters()
      setCharacters(chars)
      if (!currentCharacterId && chars.length > 0) {
        setCurrentCharacterId(chars[0].id)
      }
    } catch (err) {
      console.error('Load characters error:', err)
    }
  }

  const loadCharacter = async () => {
    if (!currentCharacterId) return
    try {
      const char = await characterApi.getCharacter(currentCharacterId)
      updateUIFromCharacter(char)
      await loadEvents()
    } catch (err) {
      console.error('Load character error:', err)
    }
  }

  const loadEvents = async () => {
    if (!currentCharacterId) return
    try {
      const events = await characterApi.getCharacterEvents(currentCharacterId)
      setState(prev => ({
        ...prev,
        events: events.map((ev: any) => ev.message || JSON.stringify(ev))
      }))
    } catch (err) {
      console.error('Load events error:', err)
    }
  }

  const updateUIFromCharacter = (char: Character) => {
    setState({
      name: char.name,
      age: Math.floor(char.age_days / 365),
      stage: char.stage || 'Unknown',
      resources: {
        health: char.resources?.health || 0,
        energy: char.resources?.energy || 0,
        money: char.resources?.money || 0,
        reputation: char.resources?.reputation || 0,
        knowledge: char.resources?.knowledge || 0
      },
      traits: {
        intelligence: char.traits?.intelligence || 0,
        charisma: char.traits?.charisma || 0,
        resilience: char.traits?.resilience || 0
      },
      skills: {
        work: char.skills?.work || 0,
        social: char.skills?.social || 0,
        healthcare: char.skills?.healthcare || 0
      },
      family: {
        spouse: char.spouse_id ? 'Yes' : 'None',
        children: char.children_ids?.length || 0,
        legacy: char.legacy_score || 0
      },
      quests: char.completed_quests || [],
      events: [],
      day: char.age_days % 365 || 1,
      year: Math.floor(char.age_days / 365) + 1
    })
  }

  const addEvent = (msg: string) => {
    setState(prev => ({
      ...prev,
      events: [msg, ...prev.events.slice(0, 9)]
    }))
  }

  // Action functions from static app.js
  const advanceTime = async (days: number) => {
    if (!currentCharacterId) return
    try {
      const data = await simulationApi.advanceTime(currentCharacterId, days)
      updateUIFromCharacter(data.character)
      if (data.events) {
        data.events.forEach((ev: any) => addEvent(ev.message || JSON.stringify(ev)))
      }
    } catch (err) {
      console.error('Advance time error:', err)
      alert('Error advancing time')
    }
  }

  const triggerEvent = async () => {
    if (!currentCharacterId) return
    try {
      const data = await simulationApi.triggerEvent(currentCharacterId)
      updateUIFromCharacter(data.character)
      if (data.events) {
        data.events.forEach((ev: any) => addEvent(ev.message || JSON.stringify(ev)))
      }
    } catch (err) {
      console.error('Trigger event error:', err)
      alert('Error triggering event')
    }
  }

  const simulateLife = async () => {
    if (!currentCharacterId) return
    try {
      const data = await simulationApi.simulateLife(currentCharacterId)
      updateUIFromCharacter(data.character)
      if (data.events) {
        data.events.forEach((ev: any) => addEvent(ev.message || JSON.stringify(ev)))
      }
    } catch (err) {
      console.error('Simulate life error:', err)
      alert('Error simulating life')
    }
  }

  const resetCharacter = async () => {
    if (!currentCharacterId) return
    try {
      const char = await characterApi.resetCharacter({ characterId: currentCharacterId })
      updateUIFromCharacter(char)
      setState(prev => ({ ...prev, events: [] }))
    } catch (err) {
      console.error('Reset character error:', err)
      alert('Error resetting character')
    }
  }

  const performAction = async (actionId: string) => {
    if (!currentCharacterId) return
    try {
      const char = await simulationApi.performAction(currentCharacterId, actionId)
      updateUIFromCharacter(char)
    } catch (err) {
      console.error('Perform action error:', err)
      alert('Error performing action')
    }
  }

  const performAutoAction = async () => {
    const health = state.resources.health
    const energy = state.resources.energy
    const money = state.resources.money
    const reputation = state.resources.reputation
    const ageYears = state.age

    let chosenAction = 'rest'

    if (health < 30 || energy < 30) {
      chosenAction = 'rest'
    } else if (money < 200 && ageYears >= 18) {
      chosenAction = 'work'
    } else if (reputation < 50) {
      chosenAction = 'socialize'
    } else {
      chosenAction = 'study'
    }

    console.log(`Auto action: chose ${chosenAction}`)
    await performAction(chosenAction)
  }

  const switchCharacter = async () => {
    const select = document.getElementById('character-select') as HTMLSelectElement
    const newId = select.value
    if (newId && newId !== currentCharacterId) {
      setCurrentCharacterId(newId)
      await loadCharacter()
      setState(prev => ({ ...prev, events: [] }))
    }
  }

  const createCharacter = async () => {
    const nameInput = document.getElementById('new-char-name') as HTMLInputElement
    const name = nameInput.value.trim()
    if (!name) {
      alert('Please enter a character name')
      return
    }
    try {
      const newChar = await characterApi.createCharacter({ name })
      nameInput.value = ''
      await loadCharacters()
      setCurrentCharacterId(newChar.id)
      await loadCharacter()
    } catch (err) {
      console.error('Create character error:', err)
      alert('Error creating character')
    }
  }

  const login = () => {
    window.location.href = '/auth/google/login'
  }

  const logout = async () => {
    try {
      await authApi.logout()
      setCurrentUser(null)
      setIsLoggedIn(false)
      setCurrentCharacterId(null)
      showDemoData()
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const doAction = async (action: string) => {
    switch (action) {
      case "advance-day":
        await advanceTime(1)
        break
      case "advance-week":
        await advanceTime(7)
        break
      case "advance-month":
        await advanceTime(30)
        break
      case "trigger-event":
        await triggerEvent()
        break
      case "simulate-life":
        await simulateLife()
        break
      case "reset-character":
        await resetCharacter()
        break
      case "action-work":
        await performAction('work')
        break
      case "action-study":
        await performAction('study')
        break
      case "action-socialize":
        await performAction('socialize')
        break
      case "action-rest":
        await performAction('rest')
        break
      case "action-find-spouse":
        await performAction('find_spouse')
        break
      case "action-have-child":
        await performAction('have_child')
        break
      case "action-auto":
        await performAutoAction()
        break
      default:
        console.log("Unknown action:", action)
    }
  }

  const handleTabClick = (tab: string) => {
    setActiveTab(tab)
  }

  const handleBottomTabClick = (tab: string) => {
    setBottomTab(tab)
  }

  const handleCreateCharacter = () => {
    createCharacter()
  }

  const handleSwitchCharacter = () => {
    switchCharacter()
  }

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  if (isLoading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="game-screen">
      {/* TOP BAR */}
      <div className="top-bar">
        <div className="top"><span id="game-date">Year {state.year}, Day {state.day} — Age {state.age}</span></div>
        <div className="resources">
          <div className="res left">❤️ <span id="health">{state.resources.health}</span></div>
          <div className="res left">⚡ <span id="energy">{state.resources.energy}</span></div>
          <div className="res left">💰 <span id="money">{state.resources.money}</span></div>
          <div className="res left">⭐ <span id="reputation">{state.resources.reputation}</span></div>
          <div className="res left">📚 <span id="knowledge">{state.resources.knowledge}</span></div>
        </div>
      </div>

      {/* MAIN AREA */}
      <div className="main-area">
        <div className="tab-container">
          <div className="tab-buttons hide">
            <button className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`} onClick={() => handleTabClick('events')}>📋 Events</button>
            <button className={`tab-btn ${activeTab === 'character' ? 'active' : ''}`} onClick={() => handleTabClick('character')}>👤 Character</button>
          </div>
          <div id="events" className={`tab-content ${activeTab === 'events' ? 'active' : ''}`}>
            <div className="event-inbox">
              <ul id="event-list">
                {state.events.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          </div>

          <div id="character" className={`tab-content ${activeTab === 'character' ? 'active' : ''}`}>
            <div className="character-management">
              <h3>👥 Character Management</h3>
              <div className="char-mgmt-content">
                <div className="char-selector">
                  <select id="character-select" onChange={handleSwitchCharacter}>
                    {characters.map(char => (
                      <option key={char.id} value={char.id}>
                        {char.name} (Age: {Math.floor(char.age_days / 365)}y)
                      </option>
                    ))}
                    {characters.length === 0 && <option value="">No characters</option>}
                  </select>
                  <button id="switch-character" className="action-btn" style={{padding: '4px 8px', fontSize: '10px'}} onClick={handleSwitchCharacter}>Switch</button>
                </div>
                <div className="create-char">
                  <input type="text" id="new-char-name" placeholder="New character name" maxLength={20} />
                  <button id="create-character" className="action-btn" style={{padding: '4px 8px', fontSize: '10px'}} onClick={handleCreateCharacter}>Create</button>
                  <span id="char-limit"> ({characters.length}/3 characters)</span>
                </div>
              </div>
            </div>
            <div className="character-sheet">
              <h3>Character Details</h3>
              <p><span className="stat-label">Name:</span> <span className="stat-value" id="char-name">{state.name}</span></p>
              <p><span className="stat-label">Stage:</span> <span className="stat-value" id="char-stage">{state.stage}</span></p>
              <div className="stats-grid">
                <div className="stat-column">
                  <h4>Resources</h4>
                  <div className="resources">
                    <div className="res">❤️ health: <span id="health">{state.resources.health}</span></div>
                    <div className="res">⚡ energy: <span id="energy">{state.resources.energy}</span></div>
                    <div className="res">💰 money: <span id="money">{state.resources.money}</span></div>
                    <div className="res">⭐ reputation: <span id="reputation">{state.resources.reputation}</span></div>
                    <div className="res">📚 knowledge: <span id="knowledge">{state.resources.knowledge}</span></div>
                  </div>
                </div>
                <div className="stat-column">
                  <h4>Traits</h4>
                  <div className="resources">
                    <div className="res">🧠 intelligence: <span id="intelligence">{state.traits.intelligence}</span></div>
                    <div className="res">😊 charisma: <span id="charisma">{state.traits.charisma}</span></div>
                    <div className="res">💪 resilience: <span id="resilience">{state.traits.resilience}</span></div>
                  </div>
                </div>
                <div className="stat-column">
                  <h4>Skills</h4>
                  <div className="resources">
                    <div className="res">💼 work: <span id="work">{state.skills.work}</span></div>
                    <div className="res">👥 social: <span id="social">{state.skills.social}</span></div>
                    <div className="res">🩺 healthcare: <span id="healthcare">{state.skills.healthcare}</span></div>
                  </div>
                </div>
              </div>
              <h4>Family</h4>
              <p><span className="stat-label">Spouse:</span> <span className="stat-value" id="spouse">{state.family.spouse}</span></p>
              <p><span className="stat-label">Children:</span> <span className="stat-value" id="children-count">{state.family.children}</span></p>
              <p><span className="stat-label">Legacy Score:</span> <span className="stat-value" id="legacy-score">{state.family.legacy}</span></p>
              <h4>Completed Quests</h4>
              <ul id="completed-quests">
                {state.quests.map((q, i) => <li key={i}>{q}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* SIDE BUTTONS */}
      <div className="side-buttons">
        <div className="btn-menu transparent">🛒</div>
        <div className="btn-menu transparent">🗺️</div>
        <div className="btn-menu transparent" id="events-btn" onClick={() => handleTabClick('events')}>📋</div>
        <div className="btn-menu transparent" id="profile-btn" onClick={() => handleTabClick('character')}>👤</div>
        <div className="btn-menu" id="fullscreen-btn" onClick={handleFullscreen}>⛶</div>
      </div>

      {/* BOTTOM */}
      <div className="bottom-banner">
        <div className="tab-container">
          <div className="tab-buttons">
            <button className={`tab-btn ${bottomTab === 'bottom-actions' ? 'active' : ''}`} onClick={() => handleBottomTabClick('bottom-actions')}>Actions</button>
            <button className={`tab-btn ${bottomTab === 'bottom-activities' ? 'active' : ''}`} onClick={() => handleBottomTabClick('bottom-activities')}>Activity</button>
            <button className={`tab-btn ${bottomTab === 'login' ? 'active' : ''}`} onClick={() => handleBottomTabClick('login')}>Login</button>
          </div>
          <div id="bottom-actions" className={`tab-content ${bottomTab === 'bottom-actions' ? 'active' : ''}`}>
            <div className="button-group">
              <button className="action-btn" id="advance-day" onClick={() => doAction('advance-day')} title="Advance 1 Day">⏩day</button>
              <button className="action-btn" id="advance-week" onClick={() => doAction('advance-week')} title="Advance 1 Week">📅week</button>
              <button className="action-btn" id="advance-month" onClick={() => doAction('advance-month')} title="Advance 1 Month">📆month</button>
              <button className="action-btn" id="trigger-event" onClick={() => doAction('trigger-event')} title="Trigger Event">🎲event</button>
              <button className="action-btn" id="simulate-life" onClick={() => doAction('simulate-life')} title="Simulate Life">🚀mimic</button>
              <button className="action-btn" id="reset-character" onClick={() => doAction('reset-character')} title="Reset">🔄reset</button>
            </div>
          </div>
          <div id="bottom-activities" className={`tab-content ${bottomTab === 'bottom-activities' ? 'active' : ''}`}>
            <div className="button-group">
              <button className="action-btn" id="action-work" onClick={() => doAction('action-work')} title="Work">💼work</button>
              <button className="action-btn" id="action-study" onClick={() => doAction('action-study')} title="Study">📚study</button>
              <button className="action-btn" id="action-socialize" onClick={() => doAction('action-socialize')} title="Socialize">👥social</button>
              <button className="action-btn" id="action-rest" onClick={() => doAction('action-rest')} title="Rest">😴rest</button>
              <button className="action-btn" id="action-find-spouse" onClick={() => doAction('action-find-spouse')} title="Find Spouse">💍spouse</button>
              <button className="action-btn" id="action-have-child" onClick={() => doAction('action-have-child')} title="Have Child">👶child</button>
              <button className="action-btn" id="action-auto" onClick={() => doAction('action-auto')} title="Auto Activity">🤖auto</button>
            </div>
          </div>
          <div id="login" className={`tab-content ${bottomTab === 'login' ? 'active' : ''}`}>
            <div className="login-content">
              {isLoggedIn && currentUser ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <img src={currentUser.picture} alt="Profile" style={{ width: '64px', height: '64px', borderRadius: '50%' }} />
                  <span style={{ fontWeight: 'bold' }}>{currentUser.name}</span>
                  <button onClick={logout} style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
                    Logout
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <p>Login to save your progress and create your own characters!</p>
                  <button onClick={login} style={{ padding: '12px 24px', background: '#4285f4', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px' }}>
                    🚀 Login with Google
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}