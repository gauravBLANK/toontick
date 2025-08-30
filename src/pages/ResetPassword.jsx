import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Notification from '../components/Notification'
import { useAuth } from '../hooks/useAuth'
import { createClient } from '@supabase/supabase-js'

// Create a separate Supabase client that doesn't auto-detect sessions
const resetSupabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false, // This prevents auto-login
    }
  }
)

const ResetPassword = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [notification, setNotification] = useState({ message: '', type: 'success', isVisible: false })
  const [isLoading, setIsLoading] = useState(false)
  const [isValidToken, setIsValidToken] = useState(null)
  const [isCheckingToken, setIsCheckingToken] = useState(true)
  const [resetTokens, setResetTokens] = useState(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { updatePassword, session } = useAuth()

  useEffect(() => {
    const handlePasswordReset = async () => {
      setIsCheckingToken(true)
      
      // Clear any existing session first to prevent auto-login
      try {
        await resetSupabase.auth.signOut()
      } catch (error) {
        console.log('No session to clear')
      }
      
      // Add a small delay to ensure URL parameters are fully loaded
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Check if we have the necessary tokens from the URL
      const accessToken = searchParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token')
      const type = searchParams.get('type')
      
      console.log('🔍 Reset password URL params:', {
        type,
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenLength: accessToken?.length,
        refreshTokenLength: refreshToken?.length
      })

      if (type === 'recovery' && accessToken && refreshToken) {
        try {
          console.log('🔍 Processing password reset tokens...')
          
          // Validate tokens by attempting to set session with our non-persistent client
          const { data, error } = await resetSupabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (error) {
            console.error('❌ Error validating tokens:', error.message)
            setIsValidToken(false)
          } else {
            console.log('✅ Reset tokens are valid')
            // Store tokens for later use
            setResetTokens({ accessToken, refreshToken })
            setIsValidToken(true)
            
            // Immediately sign out from the reset client to prevent session persistence
            await resetSupabase.auth.signOut()
          }
        } catch (error) {
          console.error('❌ Exception during token validation:', error)
          setIsValidToken(false)
        }
      } else if (session && !type) {
        // User is already logged in (not from reset link), allow password change
        console.log('✅ User already has active session, allowing password change')
        setIsValidToken(true)
      } else if (type === 'recovery') {
        // We have the recovery type but missing tokens
        console.log('❌ Recovery type but missing tokens')
        setIsValidToken(false)
      } else {
        // No recovery type and no session - invalid access
        console.log('❌ No recovery type and no active session')
        setIsValidToken(false)
      }
      
      // Validation complete
      setIsCheckingToken(false)
    }

    handlePasswordReset()
  }, [searchParams, session])

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, isVisible: true })
  }

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }))
  }

  const validatePasswords = () => {
    if (!password) {
      showNotification('Please enter a new password', 'error')
      return false
    }

    if (password.length < 8) {
      showNotification('Password must be at least 8 characters long', 'error')
      return false
    }

    if (password !== confirmPassword) {
      showNotification('Passwords do not match', 'error')
      return false
    }

    // Check for at least one letter and one number
    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    
    if (!hasLetter || !hasNumber) {
      showNotification('Password must contain at least one letter and one number', 'error')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validatePasswords()) {
      return
    }

    setIsLoading(true)

    try {
      // Check if we need to set session for password reset using stored tokens
      if (resetTokens) {
        // Set session for password update using stored tokens on the reset client
        console.log('🔄 Setting session for password update...')
        const { error: sessionError } = await resetSupabase.auth.setSession({
          access_token: resetTokens.accessToken,
          refresh_token: resetTokens.refreshToken
        })
        
        if (sessionError) {
          console.error('❌ Error setting session for password update:', sessionError)
          showNotification('Invalid or expired reset link. Please request a new password reset.', 'error')
          return
        }

        // Update password using the reset client
        const { error: updateError } = await resetSupabase.auth.updateUser({
          password: password
        })

        if (updateError) {
          console.error('❌ Error updating password:', updateError)
          showNotification('Failed to update password. Please try again.', 'error')
          return
        }

        showNotification('Password updated successfully!', 'success')
        
        // Clear the session from reset client
        await resetSupabase.auth.signOut()
        
        // Redirect to login page after successful password reset
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Password updated successfully! Please log in with your new password.' 
            }
          })
        }, 2000)
      } else {
        // Use regular auth context for logged-in users
        const result = await updatePassword(password)
        
        if (result.success) {
          showNotification(result.message, 'success')
          
          // Redirect to login page after successful password reset
          setTimeout(() => {
            navigate('/login', { 
              state: { 
                message: 'Password updated successfully! Please log in with your new password.' 
              }
            })
          }, 2000)
        } else {
          showNotification(result.error, 'error')
        }
      }
    } catch (error) {
      console.error('Password update error:', error)
      showNotification('An unexpected error occurred. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigate('/login')
  }

  // Show loading state while checking token
  if (isCheckingToken) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border-color)',
            borderTop: '3px solid var(--primary-color)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Validating reset link...</p>
        </div>
      </div>
    )
  }

  // Show error state for invalid token
  if (isValidToken === false) {
    return (
      <>        
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
            border: '1px solid var(--border-color)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem'
            }}>
              Invalid Reset Link
            </h2>
            
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              lineHeight: '1.5',
              marginBottom: '2rem'
            }}>
              This password reset link is invalid or has expired. Please request a new password reset email.
            </p>

            <Link
              to="/forgot-password"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-block',
                marginBottom: '1rem'
              }}
            >
              Request New Reset Link
            </Link>

            <button
              onClick={handleBackToLogin}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-color)',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </>
    )
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
              Reset Your Password
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              lineHeight: '1.5'
            }}>
              Enter your new password below. Make sure it's at least 8 characters long and contains both letters and numbers.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem'
              }}>
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
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

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem'
              }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
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

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                fontWeight: '600',
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-color)'
          }}>
            <button
              onClick={handleBackToLogin}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-color)',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                margin: '0 auto'
              }}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              Back to Sign In
            </button>
          </div>
        </div>
      </div>


      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

export default ResetPassword