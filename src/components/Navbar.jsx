import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, signOut, loading } = useAuth()
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false)
  const desktopDropdownRef = useRef(null)
  const mobileDropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideDesktop = desktopDropdownRef.current && desktopDropdownRef.current.contains(event.target)
      const isClickInsideMobile = mobileDropdownRef.current && mobileDropdownRef.current.contains(event.target)
      
      if (!isClickInsideDesktop && !isClickInsideMobile) {
        setIsAccountDropdownOpen(false)
      }
    }

    if (isAccountDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isAccountDropdownOpen])

  const handleNavigation = (path) => {
    setIsAccountDropdownOpen(false)
    navigate(path)
  }

  const handleLogout = async () => {
    try {
      console.log('Logout button clicked, starting logout process...')
      console.log('Current user:', user)
      console.log('Is authenticated:', isAuthenticated)
      
      const result = await signOut()
      console.log('Logout result:', result)
      
      // Close dropdown regardless of result
      setIsAccountDropdownOpen(false)
      
      // Navigate to home page
      navigate('/')
      
      if (result && !result.success) {
        console.error('Logout failed:', result?.error || 'Unknown error')
      } else {
        console.log('Logout completed')
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Still close dropdown and navigate even if there's an error
      setIsAccountDropdownOpen(false)
      navigate('/')
    }
  }

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/library', label: 'Library' },
    { path: '/search', label: 'Search' }
  ]

  return (
    <header style={{
      backgroundColor: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border-color)',
      padding: '1rem 0'
    }}>
      <nav className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          textDecoration: 'none',
          color: 'var(--text-primary)'
        }}>
          <svg 
            style={{ height: '2rem', width: '2rem', color: 'white' }}
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth="1.5" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" 
            />
          </svg>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold'
          }}>
            ToonTick
          </h2>
        </Link>
        
        {/* Desktop Navigation */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          gap: '1.5rem'
        }} className="desktop-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                textDecoration: 'none',
                color: location.pathname === item.path 
                  ? 'var(--text-primary)' 
                  : 'var(--text-secondary)',
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => {
                if (location.pathname !== item.path) {
                  e.target.style.color = 'var(--text-secondary)'
                }
              }}
            >
              {item.label}
            </Link>
          ))}
          <div ref={desktopDropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--primary-color)',
                border: '1px solid var(--primary-color)',
                borderRadius: 'var(--radius-md)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
                maxWidth: '200px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--primary-hover)'
                e.target.style.borderColor = 'var(--primary-hover)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'var(--primary-color)'
                e.target.style.borderColor = 'var(--primary-color)'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              {isAuthenticated ? (
                <span style={{ 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  maxWidth: '120px'
                }}>
                  {user?.email || 'User'}
                </span>
              ) : (
                'Account'
              )}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </button>
            
            {isAccountDropdownOpen && (
              <div 
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 1000,
                  minWidth: '200px',
                  marginTop: '0.5rem'
                }}
              >
                <div style={{ padding: '0.5rem 0' }}>
                  {isAuthenticated ? (
                    <>
                      {/* User Profile Section */}
                      <div style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid var(--border-color)',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          marginBottom: '0.25rem'
                        }}>
                          Signed in as
                        </div>
                        <div style={{
                          fontSize: '0.9rem',
                          color: 'var(--text-primary)',
                          fontWeight: '500',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {user?.email || 'User'}
                        </div>
                      </div>

                      {/* Logout Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLogout()
                        }}
                        disabled={loading}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: 'var(--text-primary)',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          transition: 'all 0.2s ease',
                          opacity: loading ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            e.target.style.backgroundColor = 'var(--primary-color)'
                            e.target.style.color = 'white'
                            e.target.style.transform = 'translateX(4px)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) {
                            e.target.style.backgroundColor = 'transparent'
                            e.target.style.color = 'var(--text-primary)'
                            e.target.style.transform = 'translateX(0)'
                          }
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                        </svg>
                        {loading ? 'Signing out...' : 'Sign Out'}
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Unauthenticated User Options */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleNavigation('/create-account')
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'var(--primary-color)'
                          e.target.style.color = 'white'
                          e.target.style.transform = 'translateX(4px)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent'
                          e.target.style.color = 'var(--text-primary)'
                          e.target.style.transform = 'translateX(0)'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                        Create Account
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleNavigation('/login')
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'var(--primary-color)'
                          e.target.style.color = 'white'
                          e.target.style.transform = 'translateX(4px)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent'
                          e.target.style.color = 'var(--text-primary)'
                          e.target.style.transform = 'translateX(0)'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v12z"/>
                        </svg>
                        Login
                      </button>
                        
                      <div style={{
                        height: '1px',
                        backgroundColor: 'var(--border-color)',
                        margin: '0.5rem 0'
                      }} />
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleNavigation('/forgot-password')
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'var(--primary-color)'
                          e.target.style.color = 'white'
                          e.target.style.transform = 'translateX(4px)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent'
                          e.target.style.color = 'var(--text-secondary)'
                          e.target.style.transform = 'translateX(0)'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                        </svg>
                        Forgot Password
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Account Button */}
        <div ref={mobileDropdownRef} style={{ position: 'relative' }} className="mobile-account">
          <button
            onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
            style={{
              padding: '0.5rem',
              backgroundColor: 'var(--primary-color)',
              border: '1px solid var(--primary-color)',
              borderRadius: 'var(--radius-md)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--primary-hover)'
              e.target.style.borderColor = 'var(--primary-hover)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--primary-color)'
              e.target.style.borderColor = 'var(--primary-color)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </button>
          
          {isAccountDropdownOpen && (
            <div 
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 1000,
                minWidth: '200px',
                marginTop: '0.5rem'
              }}
            >
              <div style={{ padding: '0.5rem 0' }}>
                {isAuthenticated ? (
                  <>
                    {/* User Profile Section */}
                    <div style={{
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid var(--border-color)',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.25rem'
                      }}>
                        Signed in as
                      </div>
                      <div style={{
                        fontSize: '0.9rem',
                        color: 'var(--text-primary)',
                        fontWeight: '500',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {user?.email || 'User'}
                      </div>
                    </div>

                    {/* Logout Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLogout()
                      }}
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: 'var(--text-primary)',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        textAlign: 'left',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'all 0.2s ease',
                        opacity: loading ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.target.style.backgroundColor = 'var(--primary-color)'
                          e.target.style.color = 'white'
                          e.target.style.transform = 'translateX(4px)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) {
                          e.target.style.backgroundColor = 'transparent'
                          e.target.style.color = 'var(--text-primary)'
                          e.target.style.transform = 'translateX(0)'
                        }
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                      </svg>
                      {loading ? 'Signing out...' : 'Sign Out'}
                    </button>
                  </>
                ) : (
                  <>
                    {/* Unauthenticated User Options */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNavigation('/create-account')
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'var(--primary-color)'
                        e.target.style.color = 'white'
                        e.target.style.transform = 'translateX(4px)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent'
                        e.target.style.color = 'var(--text-primary)'
                        e.target.style.transform = 'translateX(0)'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      Create Account
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNavigation('/login')
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'var(--primary-color)'
                        e.target.style.color = 'white'
                        e.target.style.transform = 'translateX(4px)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent'
                        e.target.style.color = 'var(--text-primary)'
                        e.target.style.transform = 'translateX(0)'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v12z"/>
                      </svg>
                      Login
                    </button>
                      
                    <div style={{
                      height: '1px',
                      backgroundColor: 'var(--border-color)',
                      margin: '0.5rem 0'
                    }} />
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNavigation('/forgot-password')
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'var(--primary-color)'
                        e.target.style.color = 'white'
                        e.target.style.transform = 'translateX(4px)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent'
                        e.target.style.color = 'var(--text-secondary)'
                        e.target.style.transform = 'translateX(0)'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                      </svg>
                      Forgot Password
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <style>
        {`
          @media (min-width: 768px) {
            .desktop-nav {
              display: flex !important;
            }
            .mobile-account {
              display: none !important;
            }
          }
          
          @media (max-width: 767px) {
            .mobile-account {
              display: block !important;
            }
          }
        `}
      </style>
    </header>
  )
}

export default Navbar