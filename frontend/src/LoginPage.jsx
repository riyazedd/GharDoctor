import { useState } from 'react'
import './LoginPage.css'

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok) {
        setMessageType('success')
        setMessage('Login successful! Redirecting...')
        localStorage.setItem('token', data.token)
        setEmail('')
        setPassword('')
        
        // Call the callback to redirect to dashboard
        setTimeout(() => {
          onLoginSuccess()
        }, 1000)
      } else {
        setMessageType('error')
        setMessage(data.message || 'Login failed')
      }
    } catch (error) {
      setMessageType('error')
      setMessage('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>GharDoctor - Test Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <div className="test-credentials">
          <h3>Test Credentials:</h3>
          <p>Email: <code>john@example.com</code></p>
          <p>Password: <code>password123</code></p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
