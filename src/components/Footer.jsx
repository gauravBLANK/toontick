import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <>
      {/* Desktop Footer */}
      <footer style={{
        backgroundColor: 'var(--bg-primary)',
        borderTop: '1px solid var(--border-color)',
        padding: '2rem 0',
        marginTop: 'auto',
        display: 'none'
      }} className="desktop-footer">
        <div className="container" style={{
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
            marginBottom: '1rem'
          }}>
            <Link 
              to="/about" 
              style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
            >
              Contact
            </Link>
            <Link 
              to="/privacy" 
              style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
            >
              Privacy Policy
            </Link>
          </div>
          <p>&copy; 2024 ToonTick. All rights reserved.</p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--bg-card)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0.75rem 0',
        zIndex: 50
      }} className="mobile-nav">
        <Link 
          to="/" 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = 'white'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
        >
          <svg style={{ height: '1.5rem', width: '1.5rem', marginBottom: '0.25rem' }} fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2L2 9h2v9h4v-5h4v5h4V9h2L10 2z" />
          </svg>
          Home
        </Link>
        <Link 
          to="/library" 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = 'white'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
        >
          <svg style={{ height: '1.5rem', width: '1.5rem', marginBottom: '0.25rem' }} fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4z" />
          </svg>
          Library
        </Link>
        <Link 
          to="/search" 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = 'white'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
        >
          <svg style={{ height: '1.5rem', width: '1.5rem', marginBottom: '0.25rem' }} fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 4a4 4 0 104 4H8V4zM2 8a6 6 0 1111.546 3.548l3.853 3.853-1.414 1.414-3.853-3.853A6 6 0 012 8z" />
          </svg>
          Search
        </Link>
      </nav>

      <style>
        {`
          @media (min-width: 768px) {
            .desktop-footer {
              display: block !important;
            }
            .mobile-nav {
              display: none !important;
            }
          }
          
          @media (max-width: 767px) {
            body {
              padding-bottom: 80px;
            }
          }
        `}
      </style>
    </>
  )
}

export default Footer