import { useEffect, useState } from 'react'

function App() {
  const [apiStatus, setApiStatus] = useState({
    label: 'Checking backend connection...',
    tone: 'pending',
  })

  useEffect(() => {
    let active = true

    const loadStatus = async () => {
      try {
        const response = await fetch('/api/health')

        if (!response.ok) {
          throw new Error(`Unexpected status: ${response.status}`)
        }

        const payload = await response.json()

        if (active) {
          setApiStatus({
            label: `${payload.service} is ${payload.status}`,
            tone: 'success',
          })
        }
      } catch {
        if (active) {
          setApiStatus({
            label:
              'Backend is not reachable yet. Start Spring Boot to connect the dashboard.',
            tone: 'error',
          })
        }
      }
    }

    loadStatus()

    return () => {
      active = false
    }
  }, [])

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">Smart Campus starter kit</p>
        <h1>Spring Boot + React baseline that is ready to build on.</h1>
        <p className="hero-copy">
          This workspace now includes a clean frontend shell, a starter backend
          API, shared project scripts, and a GitHub Actions pipeline that
          verifies format, lint, tests, and builds.
        </p>

        <div className="status-row">
          <span className={`status-pill status-pill--${apiStatus.tone}`}>
            {apiStatus.label}
          </span>
          <span className="status-pill status-pill--neutral">
            Frontend: Vite + React 19
          </span>
          <span className="status-pill status-pill--neutral">
            Backend: Spring Boot + Java 21
          </span>
        </div>
      </section>

      <section className="panel-grid">
        <article className="info-card">
          <h2>Project workflow</h2>
          <ul>
            <li>
              Run both apps together from the project root with one command.
            </li>
            <li>
              Use the frontend proxy so API calls work locally without manual
              CORS hacks.
            </li>
            <li>
              Push to GitHub and let CI run the same verification commands.
            </li>
          </ul>
        </article>

        <article className="info-card">
          <h2>Root commands</h2>
          <ul>
            <li>npm run dev</li>
            <li>npm run lint</li>
            <li>npm run format</li>
            <li>npm run test</li>
            <li>npm run build</li>
          </ul>
        </article>

        <article className="info-card info-card--accent">
          <h2>Recommended next modules</h2>
          <ul>
            <li>Authentication and authorization</li>
            <li>Student, lecturer, and timetable features</li>
            <li>Database integration and environment profiles</li>
          </ul>
        </article>
      </section>
    </main>
  )
}

export default App
