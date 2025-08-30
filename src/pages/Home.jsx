import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Loader from '../components/Loader'
import Notification from '../components/Notification'
import useFetchManhwa from '../hooks/useFetchManhwa'

const Home = () => {
  const { manhwa, loading, error, fetchMoreManhwa, isLoadingMore } = useFetchManhwa()
  const [searchQuery, setSearchQuery] = useState('')
  const [notification, setNotification] = useState({ message: '', type: 'success', isVisible: false })
  const [libraryIds, setLibraryIds] = useState(new Set())
  const navigate = useNavigate()

  // Static background image for hero section - Manhwa characters collage
  const heroImage = '/hero-bg.jpg'



  useEffect(() => {
    // Load library IDs to filter out from featured
    const savedLibrary = localStorage.getItem('manhwaLibrary')
    if (savedLibrary) {
      const library = JSON.parse(savedLibrary)
      setLibraryIds(new Set(library.map(item => item.id)))
    }
  }, [])

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, isVisible: true })
  }

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }))
  }

  const handleAddToLibrary = (manhwaItem) => {
    // Get existing library
    const existingLibrary = JSON.parse(localStorage.getItem('manhwaLibrary') || '[]')
    
    // Check if already in library
    const isAlreadyInLibrary = existingLibrary.some(item => item.id === manhwaItem.id)
    
    if (!isAlreadyInLibrary) {
      const updatedLibrary = [...existingLibrary, { ...manhwaItem, status: 'reading' }]
      localStorage.setItem('manhwaLibrary', JSON.stringify(updatedLibrary))
      
      // Update library IDs to remove from featured
      setLibraryIds(prev => new Set([...prev, manhwaItem.id]))
      
      showNotification(`${manhwaItem.title} added to your library!`, 'success')
    } else {
      showNotification(`${manhwaItem.title} is already in your library!`, 'warning')
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  if (loading) return (
    <main className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <Loader />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
          Loading manhwa data...
        </p>
      </div>
    </main>
  )
  
  if (error) return (
    <main className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#ef4444', marginBottom: '1rem' }}>Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    </main>
  )

  return (
    <>
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
      <main className="container" style={{ padding: '2rem 1rem' }}>
      {/* Hero Section */}
      <section 
        className="hero-section"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 'bold',
          marginBottom: '1rem',
          textAlign: 'center',
          color: 'white',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
        }}>
          Track Your Favorite Manhwa Anytime
        </h1>
        
        <div className="search-container">
          <form onSubmit={handleSearch}>
            <input
              className="search-input"
              type="search"
              placeholder="Search for Manhwa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </form>
        </div>
      </section>



      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem',
            fontWeight: '700',
            margin: 0,
            color: 'var(--text-primary)' 
          }}>
            Featured Manhwa
          </h2>
          
          {/* Show offline indicator if using mock data */}
          {manhwa.length > 0 && manhwa[0].id > 1000000 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                padding: '0.25rem 0.75rem',
                backgroundColor: 'var(--accent-color)',
                color: 'white',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                Demo Mode
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('useMockData')
                  window.location.reload()
                }}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: 'transparent',
                  color: 'var(--primary-color)',
                  border: '1px solid var(--primary-color)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
                title="Try to connect to real API"
              >
                Try Live Data
              </button>
            </div>
          )}
        </div>
        
        {(() => {
          const availableManhwa = manhwa.filter(item => !libraryIds.has(item.id))
          
          if (availableManhwa.length === 0 && !loading && !isLoadingMore) {
            return (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)'
              }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                  🔄 Need more manhwa?
                </p>
                <p style={{ marginBottom: '1rem' }}>
                  Looks like you've added all the currently loaded manhwa to your library!
                </p>
                <button
                  onClick={() => fetchMoreManhwa()}
                  className="btn btn-primary"
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? 'Loading...' : 'Load More Manhwa'}
                </button>
              </div>
            )
          }
          
          return (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
                gap: '1rem'
              }}>
                {availableManhwa.slice(0, 8).map((item, index) => (
                  <Card
                    key={item.id || index}
                    title={item.title}
                    image={item.image}
                    status={item.status}
                    chapters={item.chapters}
                    averageScore={item.averageScore}
                    popularity={item.popularity}
                    year={item.year}
                    onRead={() => handleAddToLibrary(item)}
                    buttonText="Add to Library"
                    cardType="featured"
                  />
                ))}
              </div>
              
              {availableManhwa.length < 8 && availableManhwa.length > 0 && !isLoadingMore && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <button
                    onClick={() => fetchMoreManhwa()}
                    className="btn btn-primary"
                  >
                    Load More Manhwa
                  </button>
                </div>
              )}
              
              {isLoadingMore && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <p style={{ color: 'var(--text-secondary)' }}>Loading more manhwa...</p>
                </div>
              )}
            </div>
          )
        })()}
      </section>
    </main>
    </>
  )
}

export default Home