import { useContext, useMemo } from 'react'
import { AuthContext } from '../contexts/AuthContext.jsx'

/**
 * Custom authentication hook
 * Provides simplified access to authentication state and methods
 * with enhanced error handling and loading states
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  const {
    user,
    session,
    loading,
    isAuthenticated,
    signUp: contextSignUp,
    signIn: contextSignIn,
    signOut: contextSignOut,
    resetPassword: contextResetPassword,
    updatePassword: contextUpdatePassword,
    refreshSession: contextRefreshSession
  } = context

  /**
   * Helper function to check if user is authenticated
   * @returns {boolean} True if user is authenticated
   */
  const isUserAuthenticated = useMemo(() => {
    return !!(user && session && !loading)
  }, [user, session, loading])

  /**
   * Helper function to check if authentication is in loading state
   * @returns {boolean} True if authentication is loading
   */
  const isLoading = useMemo(() => {
    return loading
  }, [loading])

  /**
   * Helper function to check if user session exists
   * @returns {boolean} True if session exists
   */
  const hasSession = useMemo(() => {
    return !!session
  }, [session])

  /**
   * Helper function to get user email safely
   * @returns {string|null} User email or null
   */
  const getUserEmail = useMemo(() => {
    return user?.email || null
  }, [user])

  /**
   * Helper function to get user ID safely
   * @returns {string|null} User ID or null
   */
  const getUserId = useMemo(() => {
    return user?.id || null
  }, [user])

  /**
   * Helper function to check if user email is confirmed
   * @returns {boolean} True if email is confirmed
   */
  const isEmailConfirmed = useMemo(() => {
    return user?.email_confirmed_at ? true : false
  }, [user])

  /**
   * Enhanced sign up with additional error handling
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {object} options - Additional options
   * @returns {Promise<object>} Result object with success/error
   */
  const handleSignUp = async (email, password, options = {}) => {
    try {
      if (!email || !password) {
        return {
          success: false,
          error: 'Email and password are required'
        }
      }

      if (password.length < 8) {
        return {
          success: false,
          error: 'Password must be at least 8 characters long'
        }
      }

      const result = await contextSignUp(email, password, options)
      return result
    } catch (error) {
      console.error('Sign up error in useAuth:', error)
      return {
        success: false,
        error: 'An unexpected error occurred during sign up'
      }
    }
  }

  /**
   * Enhanced sign in with additional error handling
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<object>} Result object with success/error
   */
  const handleSignIn = async (email, password) => {
    try {
      if (!email || !password) {
        return {
          success: false,
          error: 'Email and password are required'
        }
      }

      const result = await contextSignIn(email, password)
      return result
    } catch (error) {
      console.error('Sign in error in useAuth:', error)
      return {
        success: false,
        error: 'An unexpected error occurred during sign in'
      }
    }
  }

  /**
   * Enhanced sign out with additional error handling
   * @returns {Promise<object>} Result object with success/error
   */
  const handleSignOut = async () => {
    try {
      const result = await contextSignOut()
      return result
    } catch (error) {
      console.error('Sign out error in useAuth:', error)
      return {
        success: false,
        error: 'An unexpected error occurred during sign out'
      }
    }
  }

  /**
   * Enhanced password reset with additional error handling
   * @param {string} email - User email
   * @returns {Promise<object>} Result object with success/error
   */
  const handleResetPassword = async (email) => {
    try {
      if (!email) {
        return {
          success: false,
          error: 'Email is required'
        }
      }

      const result = await contextResetPassword(email)
      return result
    } catch (error) {
      console.error('Password reset error in useAuth:', error)
      return {
        success: false,
        error: 'An unexpected error occurred during password reset'
      }
    }
  }

  /**
   * Enhanced password update with additional error handling
   * @param {string} newPassword - New password
   * @returns {Promise<object>} Result object with success/error
   */
  const handleUpdatePassword = async (newPassword) => {
    try {
      if (!newPassword) {
        return {
          success: false,
          error: 'New password is required'
        }
      }

      if (newPassword.length < 8) {
        return {
          success: false,
          error: 'Password must be at least 8 characters long'
        }
      }

      const result = await contextUpdatePassword(newPassword)
      return result
    } catch (error) {
      console.error('Password update error in useAuth:', error)
      return {
        success: false,
        error: 'An unexpected error occurred during password update'
      }
    }
  }

  /**
   * Enhanced session refresh with additional error handling
   * @returns {Promise<object>} Result object with success/error
   */
  const handleRefreshSession = async () => {
    try {
      const result = await contextRefreshSession()
      return result
    } catch (error) {
      console.error('Session refresh error in useAuth:', error)
      return {
        success: false,
        error: 'An unexpected error occurred during session refresh'
      }
    }
  }

  // Return the hook interface
  return {
    // Authentication state
    user,
    session,
    loading,
    
    // Helper functions for authentication status checks
    isAuthenticated: isUserAuthenticated,
    isLoading,
    hasSession,
    isEmailConfirmed,
    
    // User data helpers
    getUserEmail,
    getUserId,
    
    // Enhanced authentication methods with error handling
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    updatePassword: handleUpdatePassword,
    refreshSession: handleRefreshSession
  }
}

export default useAuth