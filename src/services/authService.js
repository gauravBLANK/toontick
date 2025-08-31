import { supabase } from '../config/supabase.js'

/**
 * Authentication Service
 * Centralized service for all authentication operations using Supabase
 */

// User-friendly error messages mapping
const ERROR_MESSAGES = {
  // Authentication errors
  'invalid_credentials': 'Invalid email or password. Please check your credentials and try again.',
  'email_not_confirmed': 'Please check your email and click the confirmation link to activate your account.',
  'weak_password': 'Password must be at least 8 characters long and contain a mix of letters and numbers.',
  'email_already_exists': 'An account with this email already exists. Please try logging in instead.',
  'user_not_found': 'No account found with this email address.',
  'invalid_email': 'Please enter a valid email address.',
  'password_mismatch': 'Passwords do not match. Please try again.',
  'rate_limit_exceeded': 'Too many attempts. Please wait a few minutes before trying again.',
  'signup_disabled': 'New account registration is currently disabled.',
  'email_change_confirm_error': 'Error confirming email change. Please try again.',
  'password_reset_limit_exceeded': 'Password reset limit exceeded. Please wait before requesting another reset.',
  
  // Network and general errors
  'network_error': 'Network connection error. Please check your internet connection and try again.',
  'server_error': 'Server error occurred. Please try again later.',
  'unknown_error': 'An unexpected error occurred. Please try again.',
  'session_expired': 'Your session has expired. Please log in again.',
  'unauthorized': 'You are not authorized to perform this action.',
  
  // Validation errors
  'email_required': 'Email address is required.',
  'password_required': 'Password is required.',
  'password_too_short': 'Password must be at least 8 characters long.',
  'invalid_password_format': 'Password must contain at least one letter and one number.'
}

/**
 * Maps Supabase error codes to user-friendly messages
 * @param {Object} error - Supabase error object
 * @returns {string} User-friendly error message
 */
const mapErrorMessage = (error) => {
  if (!error) return ERROR_MESSAGES.unknown_error

  // Handle network errors
  if (error.name === 'NetworkError' || error.message?.includes('fetch')) {
    return ERROR_MESSAGES.network_error
  }

  // Handle Supabase auth errors
  const errorCode = error.message?.toLowerCase()
  
  if (errorCode?.includes('invalid login credentials')) {
    return ERROR_MESSAGES.invalid_credentials
  }
  if (errorCode?.includes('email not confirmed')) {
    return ERROR_MESSAGES.email_not_confirmed
  }
  if (errorCode?.includes('password should be at least')) {
    return ERROR_MESSAGES.weak_password
  }
  if (errorCode?.includes('user already registered') || 
      errorCode?.includes('email address already in use') ||
      errorCode?.includes('user with this email already exists')) {
    return ERROR_MESSAGES.email_already_exists
  }
  if (errorCode?.includes('user not found')) {
    return ERROR_MESSAGES.user_not_found
  }
  if (errorCode?.includes('invalid email')) {
    return ERROR_MESSAGES.invalid_email
  }
  if (errorCode?.includes('signup is disabled')) {
    return ERROR_MESSAGES.signup_disabled
  }
  if (errorCode?.includes('email rate limit exceeded')) {
    return ERROR_MESSAGES.rate_limit_exceeded
  }
  if (errorCode?.includes('password reset limit exceeded')) {
    return ERROR_MESSAGES.password_reset_limit_exceeded
  }

  // Default to the original error message or unknown error
  return error.message || ERROR_MESSAGES.unknown_error
}

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: ERROR_MESSAGES.password_required }
  }
  
  if (password.length < 8) {
    return { isValid: false, message: ERROR_MESSAGES.password_too_short }
  }
  
  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  
  if (!hasLetter || !hasNumber) {
    return { isValid: false, message: ERROR_MESSAGES.invalid_password_format }
  }
  
  return { isValid: true, message: null }
}

/**
 * Authentication Service Class
 */
class AuthService {
  /**
   * Sign up a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} options - Additional signup options
   * @returns {Promise<Object>} Authentication response
   */
  async signUp(email, password, options = {}) {
    try {
      // Validate input
      if (!email) {
        throw new Error(ERROR_MESSAGES.email_required)
      }
      
      if (!isValidEmail(email)) {
        throw new Error(ERROR_MESSAGES.invalid_email)
      }
      
      const passwordValidation = validatePassword(password)
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message)
      }

      const normalizedEmail = email.toLowerCase().trim()

      // Note: We'll let Supabase handle duplicate account detection
      // Supabase signUp returns success even for existing emails (to prevent enumeration)
      console.log('📝 Attempting to create account for:', normalizedEmail)

      // Prepare signup data
      const signUpData = {
        email: normalizedEmail,
        password,
        options: {
          data: options.metadata || {},
          ...options
        }
      }

      // Attempt signup
      const { data, error } = await supabase.auth.signUp(signUpData)

      if (error) {
        console.error('Signup error:', error)
        
        // Handle specific error cases
        if (error.message?.toLowerCase().includes('user already registered') ||
            error.message?.toLowerCase().includes('email already exists') ||
            error.message?.toLowerCase().includes('email address already in use')) {
          return {
            success: false,
            error: 'An account with this email already exists. Please try logging in instead.',
            user: null,
            session: null,
            accountExists: true
          }
        }
        
        throw error
      }

      console.log('✅ Account creation successful')

      return {
        success: true,
        user: data.user,
        session: data.session,
        message: data.user?.email_confirmed_at 
          ? 'Account created successfully!' 
          : 'Account created! Please check your email to confirm your account.'
      }
    } catch (error) {
      console.error('SignUp error:', error)
      return {
        success: false,
        error: mapErrorMessage(error),
        user: null,
        session: null
      }
    }
  }

  /**
   * Sign in an existing user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Authentication response
   */
  async signIn(email, password) {
    try {
      // Validate input
      if (!email) {
        throw new Error(ERROR_MESSAGES.email_required)
      }
      
      if (!password) {
        throw new Error(ERROR_MESSAGES.password_required)
      }
      
      if (!isValidEmail(email)) {
        throw new Error(ERROR_MESSAGES.invalid_email)
      }

      // Attempt signin
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      })

      if (error) {
        throw error
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
        message: 'Successfully logged in!'
      }
    } catch (error) {
      console.error('SignIn error:', error)
      return {
        success: false,
        error: mapErrorMessage(error),
        user: null,
        session: null
      }
    }
  }

  /**
   * Sign out the current user
   * @returns {Promise<Object>} Sign out response
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      return {
        success: true,
        message: 'Successfully logged out!'
      }
    } catch (error) {
      console.error('SignOut error:', error)
      return {
        success: false,
        error: mapErrorMessage(error)
      }
    }
  }

  /**
   * Send password reset email
   * @param {string} email - User email
   * @returns {Promise<Object>} Password reset response
   */
  async resetPassword(email) {
    try {
      // Validate input
      if (!email) {
        throw new Error(ERROR_MESSAGES.email_required)
      }
      
      if (!isValidEmail(email)) {
        throw new Error(ERROR_MESSAGES.invalid_email)
      }

      // Send reset email
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`
        }
      )

      if (error) {
        throw error
      }

      return {
        success: true,
        message: 'Password reset email sent! Please check your inbox.'
      }
    } catch (error) {
      console.error('ResetPassword error:', error)
      return {
        success: false,
        error: mapErrorMessage(error)
      }
    }
  }

  /**
   * Update user password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Password update response
   */
  async updatePassword(newPassword) {
    try {
      // Validate input
      const passwordValidation = validatePassword(newPassword)
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message)
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        throw error
      }

      return {
        success: true,
        message: 'Password updated successfully!'
      }
    } catch (error) {
      console.error('UpdatePassword error:', error)
      return {
        success: false,
        error: mapErrorMessage(error)
      }
    }
  }

  /**
   * Get current user session
   * @returns {Promise<Object|null>} Current session or null
   */
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
        return null
      }
      
      return session
    } catch (error) {
      console.error('Error getting session:', error)
      return null
    }
  }

  /**
   * Get current user
   * @returns {Promise<Object|null>} Current user or null
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('Error getting user:', error)
        return null
      }
      
      return user
    } catch (error) {
      console.error('Error getting user:', error)
      return null
    }
  }

  /**
   * Check if user is authenticated
   * @returns {Promise<boolean>} True if user is authenticated
   */
  async isAuthenticated() {
    try {
      const session = await this.getCurrentSession()
      return !!(session && session.user)
    } catch (error) {
      console.error('Error checking authentication:', error)
      return false
    }
  }

  /**
   * Refresh the current session
   * @returns {Promise<Object>} Refresh response
   */
  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        throw error
      }

      return {
        success: true,
        session: data.session,
        user: data.user
      }
    } catch (error) {
      console.error('RefreshSession error:', error)
      return {
        success: false,
        error: mapErrorMessage(error)
      }
    }
  }

  /**
   * Listen to authentication state changes
   * @param {Function} callback - Callback function to handle auth state changes
   * @returns {Function} Unsubscribe function
   */
  onAuthStateChange(callback) {
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          callback(event, session)
        }
      )

      // Return unsubscribe function
      return () => {
        subscription?.unsubscribe()
      }
    } catch (error) {
      console.error('Error setting up auth state listener:', error)
      return () => {} // Return empty function if setup fails
    }
  }

  /**
   * Get user metadata
   * @returns {Promise<Object|null>} User metadata or null
   */
  async getUserMetadata() {
    try {
      const user = await this.getCurrentUser()
      return user?.user_metadata || null
    } catch (error) {
      console.error('Error getting user metadata:', error)
      return null
    }
  }

  /**
   * Update user metadata
   * @param {Object} metadata - Metadata to update
   * @returns {Promise<Object>} Update response
   */
  async updateUserMetadata(metadata) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: metadata
      })

      if (error) {
        throw error
      }

      return {
        success: true,
        user: data.user,
        message: 'Profile updated successfully!'
      }
    } catch (error) {
      console.error('UpdateUserMetadata error:', error)
      return {
        success: false,
        error: mapErrorMessage(error)
      }
    }
  }
}

// Create and export a singleton instance
const authService = new AuthService()

export default authService

// Export individual methods for convenience
export const {
  signUp,
  signIn,
  signOut,
  resetPassword,
  updatePassword,
  getCurrentSession,
  getCurrentUser,
  isAuthenticated,
  refreshSession,
  onAuthStateChange,
  getUserMetadata,
  updateUserMetadata
} = authService

// Export error messages for use in components
export { ERROR_MESSAGES }

// Export validation utilities
export { isValidEmail, validatePassword }