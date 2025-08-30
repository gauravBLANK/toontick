import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import authService from '../services/authService.js'
import { clearLocalLibrary } from '../services/libraryService.js'

/**
 * Authentication Context
 * Provides global authentication state and methods throughout the application
 */

// Create the authentication context
const AuthContext = createContext({
  // Authentication state
  user: null,
  session: null,
  loading: true,
  
  // Authentication methods
  signUp: async () => ({ success: false, error: 'Not implemented' }),
  signIn: async () => ({ success: false, error: 'Not implemented' }),
  signOut: async () => ({ success: false, error: 'Not implemented' }),
  resetPassword: async () => ({ success: false, error: 'Not implemented' }),
  updatePassword: async () => ({ success: false, error: 'Not implemented' }),
  
  // Utility methods
  isAuthenticated: false,
  refreshSession: async () => ({ success: false, error: 'Not implemented' })
})

/**
 * Authentication Provider Component
 * Manages authentication state and provides it to child components
 */
export const AuthProvider = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  /**
   * Initialize authentication state on component mount
   */
  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true)
      
      // Get current session from Supabase
      const currentSession = await authService.getCurrentSession()
      
      if (currentSession) {
        setSession(currentSession)
        setUser(currentSession.user)
      } else {
        setSession(null)
        setUser(null)
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
      setSession(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Handle authentication state changes
   */
  const handleAuthStateChange = useCallback((event, session) => {
    console.log('Auth state change:', event, session)
    
    switch (event) {
      case 'SIGNED_IN':
        setSession(session)
        setUser(session?.user || null)
        setLoading(false)
        break
        
      case 'SIGNED_OUT':
        setSession(null)
        setUser(null)
        setLoading(false)
        // Clear library data on logout
        clearLocalLibrary()
        break
        
      case 'TOKEN_REFRESHED':
        setSession(session)
        setUser(session?.user || null)
        break
        
      case 'USER_UPDATED':
        if (session) {
          setSession(session)
          setUser(session.user)
        }
        break
        
      default:
        // Handle other events or initial state
        if (session) {
          setSession(session)
          setUser(session.user)
        } else {
          setSession(null)
          setUser(null)
        }
        setLoading(false)
        break
    }
  }, [])

  /**
   * Set up authentication state listener and initialize auth
   */
  useEffect(() => {
    // Initialize authentication state
    initializeAuth()
    
    // Set up auth state change listener
    const unsubscribe = authService.onAuthStateChange(handleAuthStateChange)
    
    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [initializeAuth, handleAuthStateChange])

  /**
   * Automatic session refresh
   * Refreshes the session periodically to prevent expiration
   */
  useEffect(() => {
    if (!session) return

    // Set up automatic session refresh
    const refreshInterval = setInterval(async () => {
      try {
        const result = await authService.refreshSession()
        if (!result.success) {
          console.warn('Session refresh failed:', result.error)
          // If refresh fails, the auth state change listener will handle sign out
        }
      } catch (error) {
        console.error('Error during automatic session refresh:', error)
      }
    }, 15 * 60 * 1000) // Refresh every 15 minutes

    return () => clearInterval(refreshInterval)
  }, [session])

  /**
   * Enhanced sign up method with state management
   */
  const signUp = useCallback(async (email, password, options = {}) => {
    try {
      setLoading(true)
      const result = await authService.signUp(email, password, options)
      
      if (result.success) {
        // State will be updated by the auth state change listener
        console.log('Sign up successful:', result.message)
      }
      
      return result
    } catch (error) {
      console.error('Sign up error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred during sign up'
      }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Enhanced sign in method with state management
   */
  const signIn = useCallback(async (email, password) => {
    try {
      setLoading(true)
      const result = await authService.signIn(email, password)
      
      if (result.success) {
        // State will be updated by the auth state change listener
        console.log('Sign in successful:', result.message)
      }
      
      return result
    } catch (error) {
      console.error('Sign in error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred during sign in'
      }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Enhanced sign out method with state management
   */
  const signOut = useCallback(async () => {
    try {
      setLoading(true)
      const result = await authService.signOut()
      
      if (result.success) {
        // State will be updated by the auth state change listener
        console.log('Sign out successful:', result.message)
        // Clear library data on logout
        clearLocalLibrary()
      }
      
      return result
    } catch (error) {
      console.error('Sign out error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred during sign out'
      }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Enhanced password reset method
   */
  const resetPassword = useCallback(async (email) => {
    try {
      const result = await authService.resetPassword(email)
      return result
    } catch (error) {
      console.error('Password reset error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred during password reset'
      }
    }
  }, [])

  /**
   * Enhanced password update method
   */
  const updatePassword = useCallback(async (newPassword) => {
    try {
      const result = await authService.updatePassword(newPassword)
      
      if (result.success) {
        // Refresh user data after password update
        await refreshSession()
      }
      
      return result
    } catch (error) {
      console.error('Password update error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred during password update'
      }
    }
  }, [])

  /**
   * Enhanced session refresh method
   */
  const refreshSession = useCallback(async () => {
    try {
      const result = await authService.refreshSession()
      
      if (result.success) {
        // State will be updated by the auth state change listener
        console.log('Session refreshed successfully')
      }
      
      return result
    } catch (error) {
      console.error('Session refresh error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred during session refresh'
      }
    }
  }, [])

  // Computed authentication status
  const isAuthenticated = !!(user && session)

  // Context value
  const contextValue = {
    // Authentication state
    user,
    session,
    loading,
    isAuthenticated,
    
    // Authentication methods
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    refreshSession
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Note: The useAuth hook is now available as a separate module
 * Import it from '../hooks/useAuth.js' for enhanced functionality
 */

// Export the context for advanced use cases
export { AuthContext }

// Default export
export default AuthProvider