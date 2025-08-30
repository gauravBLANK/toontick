import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import Loader from './Loader.jsx'

/**
 * ProtectedRoute Component
 * 
 * A wrapper component that protects routes requiring authentication.
 * Automatically redirects unauthenticated users to the login page
 * and handles return-to-original-page functionality after successful login.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render when authenticated
 * @param {string} props.redirectTo - Path to redirect to when not authenticated (default: '/login')
 * @param {boolean} props.requireAuth - Whether authentication is required (default: true)
 */
const ProtectedRoute = ({ 
  children, 
  redirectTo = '/login', 
  requireAuth = true 
}) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Store the current location for return-to-original-page functionality
  useEffect(() => {
    if (!isAuthenticated && !isLoading && requireAuth) {
      // Store the attempted URL in sessionStorage for redirect after login
      const redirectPath = location.pathname + location.search
      sessionStorage.setItem('redirectAfterLogin', redirectPath)
    }
  }, [isAuthenticated, isLoading, requireAuth, location])

  // Show loading spinner while authentication status is being determined
  if (isLoading) {
    return (
      <div className="protected-route-loading" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <Loader />
      </div>
    )
  }

  // If authentication is required but user is not authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ 
          from: { pathname: location.pathname + location.search },
          message: 'Please log in to access this page'
        }} 
        replace 
      />
    )
  }

  // If authentication is not required or user is authenticated, render children
  return children
}

export default ProtectedRoute