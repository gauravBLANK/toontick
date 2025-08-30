import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Notification from '../components/Notification'
import { useAuth } from '../hooks/useAuth'

const CreateAccount = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [notification, setNotification] = useState({ message: '', type: 'success', isVisible: false })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()
  const { signUp, isAuthenticated, loading: authLoading } = useAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/')
    }
  }, [isAuthenticated, authLoading, navigate])

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, isVisible: true })
  }

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }))
  }

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '', requirements: [] }
    
    let score = 0
    const requirements = []
    
    // Length check
    if (password.length >= 8) {
      score += 25
      requirements.push({ text: 'At least 8 characters', met: true })
    } else {
      requirements.push({ text: 'At least 8 characters', met: false })
    }
    
    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 25
      requirements.push({ text: 'Contains lowercase letter', met: true })
    } else {
      requirements.push({ text: 'Contains lowercase letter', met: false })
    }
    
    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 25
      requirements.push({ text: 'Contains uppercase letter', met: true })
    } else {
      requirements.push({ text: 'Contains uppercase letter', met: false })
    }
    
    // Number or special character check
    if (/[\d\W]/.test(password)) {
      score += 25
      requirements.push({ text: 'Contains number or special character', met: true })
    } else {
      requirements.push({ text: 'Contains number or special character', met: false })
    }
    
    // Determine strength level
    let label, color
    if (score < 25) {
      label = 'Very Weak'
      color = '#ef4444'
    } else if (score < 50) {
      label = 'Weak'
      color = '#f97316'
    } else if (score < 75) {
      label = 'Fair'
      color = '#eab308'
    } else if (score < 100) {
      label = 'Good'
      color = '#22c55e'
    } else {
      label = 'Strong'
      color = '#16a34a'
    }
    
    return { score, label, color, requirements }
  }

  const passwordStrength = calculatePasswordStrength(formData.password)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Clear any existing notifications when user starts typing
    if (notification.isVisible) {
      hideNotification()
    }
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Basic validation
      if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
        showNotification('Please fill in all fields', 'error')
        setIsLoading(false)
        return
      }

      // Email format validation
      if (!validateEmail(formData.email)) {
        showNotification('Please enter a valid email address', 'error')
        setIsLoading(false)
        return
      }

      // Password match validation
      if (formData.password !== formData.confirmPassword) {
        showNotification('Passwords do not match', 'error')
        setIsLoading(false)
        return
      }

      // Password strength validation
      if (formData.password.length < 8) {
        showNotification('Password must be at least 8 characters long', 'error')
        setIsLoading(false)
        return
      }

      const strength = calculatePasswordStrength(formData.password)
      if (strength.score < 50) {
        showNotification('Please choose a stronger password', 'error')
        setIsLoading(false)
        return
      }

      // Attempt to create account with Supabase
      const result = await signUp(formData.email, formData.password, {
        data: {
          username: formData.username
        }
      })

      if (result.success) {
        showNotification(result.message || 'Account created successfully! Please check your email to confirm your account.', 'success')
        // Clear form data
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        })
        // Redirect to login after showing success message
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        // Handle account already exists case
        if (result.accountExists) {
          // If user was logged in (password matched), redirect to home
          if (result.user && result.session) {
            showNotification('You have been logged in with your existing account.', 'success')
            setTimeout(() => {
              navigate('/')
            }, 2000)
          } else {
            // Account exists but password didn't match
            showNotification(result.error || 'An account with this email already exists. Please try logging in instead.', 'error')
            setTimeout(() => {
              navigate('/login', { state: { email: formData.email } })
            }, 3000)
          }
        } else {
          // Handle other Supabase errors with user-friendly messages
          let errorMessage = result.error || 'Failed to create account'
          
          // Map common Supabase errors to user-friendly messages
          if (errorMessage.includes('email_already_exists') || errorMessage.includes('User already registered')) {
            errorMessage = 'An account with this email already exists. Please try logging in instead.'
          } else if (errorMessage.includes('weak_password')) {
            errorMessage = 'Password is too weak. Please choose a stronger password'
          } else if (errorMessage.includes('invalid_email')) {
            errorMessage = 'Please enter a valid email address'
          } else if (errorMessage.includes('rate_limit')) {
            errorMessage = 'Too many attempts. Please try again later'
          }
          
          showNotification(errorMessage, 'error')
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      showNotification('An unexpected error occurred. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)',
        padding: '2rem 1rem'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'var(--primary-color)',
                marginBottom: '0.5rem'
              }}>
                ToonTick
              </h1>
            </Link>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem'
            }}>
              Create Account
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem'
            }}>
              Join ToonTick to track your favorite manhwa
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem'
              }}>
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem'
              }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${
                    formData.email && !validateEmail(formData.email) 
                      ? '#ef4444' 
                      : formData.email && validateEmail(formData.email)
                      ? '#22c55e'
                      : 'var(--border-color)'
                  }`,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                onBlur={(e) => {
                  if (formData.email && !validateEmail(formData.email)) {
                    e.target.style.borderColor = '#ef4444'
                  } else if (formData.email && validateEmail(formData.email)) {
                    e.target.style.borderColor = '#22c55e'
                  } else {
                    e.target.style.borderColor = 'var(--border-color)'
                  }
                }}
              />
              {formData.email && !validateEmail(formData.email) && (
                <div style={{
                  fontSize: '0.75rem',
                  color: '#ef4444',
                  marginTop: '0.25rem'
                }}>
                  Please enter a valid email address
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.5rem 0.75rem 0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div style={{ marginTop: '0.75rem' }}>
                  {/* Strength Bar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{
                      flex: 1,
                      height: '4px',
                      backgroundColor: 'var(--border-color)',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${passwordStrength.score}%`,
                        height: '100%',
                        backgroundColor: passwordStrength.color,
                        transition: 'all 0.3s ease'
                      }} />
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      color: passwordStrength.color,
                      minWidth: '60px',
                      textAlign: 'right'
                    }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  
                  {/* Requirements List */}
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)'
                  }}>
                    {passwordStrength.requirements.map((req, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        marginBottom: '0.25rem'
                      }}>
                        <span style={{
                          color: req.met ? '#22c55e' : 'var(--text-secondary)',
                          fontSize: '0.75rem'
                        }}>
                          {req.met ? '✓' : '○'}
                        </span>
                        <span style={{
                          color: req.met ? 'var(--text-primary)' : 'var(--text-secondary)'
                        }}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem'
              }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.5rem 0.75rem 0.75rem',
                    border: `1px solid ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? '#ef4444'
                        : formData.confirmPassword && formData.password === formData.confirmPassword && formData.password
                        ? '#22c55e'
                        : 'var(--border-color)'
                    }`,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                  onBlur={(e) => {
                    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
                      e.target.style.borderColor = '#ef4444'
                    } else if (formData.confirmPassword && formData.password === formData.confirmPassword && formData.password) {
                      e.target.style.borderColor = '#22c55e'
                    } else {
                      e.target.style.borderColor = 'var(--border-color)'
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <div style={{
                  fontSize: '0.75rem',
                  color: '#ef4444',
                  marginTop: '0.25rem'
                }}>
                  Passwords do not match
                </div>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password && (
                <div style={{
                  fontSize: '0.75rem',
                  color: '#22c55e',
                  marginTop: '0.25rem'
                }}>
                  Passwords match
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || authLoading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                fontWeight: '600',
                opacity: (isLoading || authLoading) ? 0.7 : 1,
                cursor: (isLoading || authLoading) ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Creating Account...' : authLoading ? 'Loading...' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-color)'
          }}>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem'
            }}>
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  color: 'var(--primary-color)',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default CreateAccount