'use client'

import { useState, useEffect } from 'react'

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

  const updateUI = () => {
    // UI updates are handled by React state
  }

  const addEvent = (msg: string) => {
    setState(prev => ({
      ...prev,
      events: [msg, ...prev.events.slice(0, 9)]
    }))
  }

  const doAction = (action: string) => {
    let msg = ""
    setState(prev => {
      const newState = { ...prev }
      switch (action) {
        case "advance-day":
          newState.day += 1
          if (newState.day > 365) {
            newState.day = 1
            newState.year += 1
            newState.age += 1
            msg = `A year has passed! You are now ${newState.age}.`
          } else {
            msg = "A new day begins."
          }
          // Random event
          if (Math.random() < 0.3) {
            const events = [
              "You found $100 on the street!",
              "You caught a cold and lost some health.",
              "A friend invited you to a party.",
              "You had a productive day at work.",
              "You learned something new!"
            ]
            const e = events[Math.floor(Math.random() * events.length)]
            msg += " " + e
            if (e.includes("$100")) newState.resources.money += 100
            if (e.includes("cold")) newState.resources.health = clamp(newState.resources.health - 10, 0, 100)
            if (e.includes("productive")) newState.resources.money += 200
            if (e.includes("learned")) newState.resources.knowledge += 5
          }
          break
        case "advance-week":
          for (let i = 0; i < 7; i++) {
            // Simulate advance-day multiple times
            newState.day += 1
            if (newState.day > 365) {
              newState.day = 1
              newState.year += 1
              newState.age += 1
            }
          }
          msg = "A week has passed."
          break
        case "advance-month":
          for (let i = 0; i < 30; i++) {
            newState.day += 1
            if (newState.day > 365) {
              newState.day = 1
              newState.year += 1
              newState.age += 1
            }
          }
          msg = "A month has passed."
          break
        case "trigger-event":
          const randEvents = ["Birthday party!", "Job promotion!", "Illness.", "New friend.", "Financial windfall!"]
          msg = randEvents[Math.floor(Math.random() * randEvents.length)]
          break
        case "simulate-life":
          while (newState.age < 80) {
            newState.day += 1
            if (newState.day > 365) {
              newState.day = 1
              newState.year += 1
              newState.age += 1
            }
          }
          msg = "Life simulated to age 80."
          break
        case "reset-character":
          Object.assign(newState, {
            name: "Demo Character",
            age: 18,
            stage: "Young Adult",
            resources: { health: 100, energy: 100, money: 1000, reputation: 10, knowledge: 50 },
            traits: { intelligence: 10, charisma: 10, resilience: 10 },
            skills: { work: 0, social: 0, healthcare: 0 },
            family: { spouse: "None", children: 0, legacy: 0 },
            quests: [],
            events: ["Reset to birth."],
            day: 1,
            year: 1,
          })
          msg = "Character reset."
          break
        case "action-work":
          newState.resources.money += 500
          newState.resources.energy = clamp(newState.resources.energy - 20, 0, 100)
          newState.skills.work += 1
          msg = "You worked and earned money, but lost energy."
          break
        case "action-study":
          newState.resources.knowledge += 10
          newState.resources.energy = clamp(newState.resources.energy - 15, 0, 100)
          newState.traits.intelligence += 1
          msg = "You studied and gained knowledge."
          break
        case "action-socialize":
          newState.resources.reputation += 5
          newState.resources.energy = clamp(newState.resources.energy - 10, 0, 100)
          newState.skills.social += 1
          msg = "You socialized and improved reputation."
          break
        case "action-rest":
          newState.resources.energy = clamp(newState.resources.energy + 30, 0, 100)
          newState.resources.health = clamp(newState.resources.health + 5, 0, 100)
          msg = "You rested and restored energy and health."
          break
        case "action-find-spouse":
          if (newState.family.spouse === "None") {
            newState.family.spouse = "New Spouse"
            msg = "You found a spouse!"
          } else {
            msg = "You already have a spouse."
          }
          break
        case "action-have-child":
          if (newState.family.spouse !== "None") {
            newState.family.children += 1
            msg = "You had a child!"
          } else {
            msg = "You need a spouse first."
          }
          break
        default:
          msg = "Unknown action."
      }
      if (msg) addEvent(msg)
      return newState
    })
  }

  const handleTabClick = (tab: string) => {
    setActiveTab(tab)
  }

  const handleBottomTabClick = (tab: string) => {
    setBottomTab(tab)
  }

  const handleCreateCharacter = () => {
    const name = (document.getElementById('new-char-name') as HTMLInputElement)?.value
    if (name) {
      setState(prev => ({ ...prev, name }))
      addEvent(`Created character: ${name}`)
    }
  }

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  useEffect(() => {
    updateUI()
  }, [state])

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
                  <select id="character-select">
                    <option value="demo">{state.name}</option>
                  </select>
                  <button id="switch-character" className="action-btn" style={{padding: '4px 8px', fontSize: '10px'}}>Switch</button>
                </div>
                <div className="create-char">
                  <input type="text" id="new-char-name" placeholder="New character name" maxLength={20} />
                  <button id="create-character" className="action-btn" style={{padding: '4px 8px', fontSize: '10px'}} onClick={handleCreateCharacter}>Create</button>
                  <span id="char-limit"> (Max 3)</span>
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
          </div>
          <div id="bottom-actions" className={`tab-content ${bottomTab === 'bottom-actions' ? 'active' : ''}`}>
            <div className="button-group">
              <button className="action-btn" id="advance-day" onClick={() => doAction('advance-day')} title="Advance 1 Day">⏩1 day</button>
              <button className="action-btn" id="advance-week" onClick={() => doAction('advance-week')} title="Advance 1 Week">📅1 week</button>
              <button className="action-btn" id="advance-month" onClick={() => doAction('advance-month')} title="Advance 1 Month">📆1 month</button>
              <button className="action-btn" id="trigger-event" onClick={() => doAction('trigger-event')} title="Trigger Event">🎲event</button>
              <button className="action-btn" id="simulate-life" onClick={() => doAction('simulate-life')} title="Simulate Life">🚀simulate</button>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}