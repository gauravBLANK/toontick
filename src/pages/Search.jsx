import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import Card from '../components/Card'
import Loader from '../components/Loader'
import Notification from '../components/Notification'
import { searchManhwa } from '../services/manhwaAPI'
import { useLibrary } from '../hooks/useLibrary.js'

const Search = () => {
  const { addManhwa } = useLibrary()
  const [searchResults, setSearchResults] = useState([])
  const [hasSearched, setHasSearched] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    genres: [],
    yearRange: { from: 2000, to: new Date().getFullYear() },
    sortBy: 'releaseDate',
    sortOrder: 'desc'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState({ message: '', type: 'success', isVisible: false })
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchQuery(query)
      handleSearch(query)
    }
  }, [searchParams])

  const handleSearch = async (query, searchFilters = filters) => {
    setSearchQuery(query)
    setHasSearched(true)
    setError(null)
    
    if (!query.trim() && searchFilters.genres.length === 0 && 
        searchFilters.yearRange.from === 2000 && 
        searchFilters.yearRange.to === new Date().getFullYear()) {
      setSearchResults([])
      return
    }

    try {
      setLoading(true)
      const results = await searchManhwa(query, searchFilters)
      setSearchResults(results)
    } catch (err) {
      console.error('Search error:', err)
      setError(err.message || 'An unexpected error occurred')
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, isVisible: true })
  }

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }))
  }

  const handleAddToLibrary = async (manhwaItem) => {
    try {
      await addManhwa(manhwaItem)
      showNotification(`${manhwaItem.title} added to your library!`, 'success')
    } catch (err) {
      showNotification(err.message || 'Failed to add to library', 'error')
    }
  }

  if (error) return (
    <div className="container" style={{ textAlign: 'center' }}>
      <div style={{ color: 'var(--text-secondary)', padding: '2rem' }}>
        <p>Error: {error}</p>
        <button 
          onClick={() => setError(null)} 
          className="btn btn-primary" 
          style={{ marginTop: '1rem' }}
        >
          Try Again
        </button>
      </div>
    </div>
  )

  return (
    <>
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
      <div className="container">
      <h1 style={{
        fontSize: '2rem',
        marginBottom: '2rem',
        color: 'var(--text-primary)'
      }}>
        Search Manhwa
      </h1>

      <SearchBar 
        onSearch={handleSearch} 
        onFiltersChange={handleFiltersChange}
        filters={filters}
      />

      {loading && <Loader />}

      {hasSearched && !loading && (
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            {searchResults.length} results
            {searchQuery && ` for "${searchQuery}"`}
            {filters.genres.length > 0 && (
              <span>
                {searchQuery ? ' in ' : ' for '}
                {filters.genres.length === 1 
                  ? filters.genres[0] 
                  : `${filters.genres.length} selected genres`
                }
              </span>
            )}
            {(filters.yearRange.from > 2000 || filters.yearRange.to < new Date().getFullYear()) && (
              <span>
                {(searchQuery || filters.genres.length > 0) ? ', ' : ' for '}
                years {filters.yearRange.from}-{filters.yearRange.to}
              </span>
            )}
          </p>
          
          {/* Active filters display */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '0.5rem', 
            marginTop: '0.5rem',
            alignItems: 'center'
          }}>
            {filters.genres.map(genre => (
              <span
                key={genre}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}
              >
                {genre}
              </span>
            ))}
            
            {(filters.yearRange.from > 2000 || filters.yearRange.to < new Date().getFullYear()) && (
              <span
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: 'var(--accent-color)',
                  color: 'white',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}
              >
                {filters.yearRange.from}-{filters.yearRange.to}
              </span>
            )}
            
            <span
              style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: '500',
                border: '1px solid var(--border-color)'
              }}
            >
              {filters.sortBy === 'releaseDate' ? 'Release Date' : 'Rating'} 
              {filters.sortOrder === 'desc' ? ' ↓' : ' ↑'}
            </span>
          </div>
        </div>
      )}

      {hasSearched && searchResults.length === 0 && (
        searchQuery || 
        filters.genres.length > 0 || 
        filters.yearRange.from > 2000 || 
        filters.yearRange.to < new Date().getFullYear()
      ) && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: 'var(--text-secondary)'
        }}>
          <p>No manhwa found matching your search criteria.</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Try adjusting your filters, expanding the year range, or using different search terms.
          </p>
        </div>
      )}

      {searchResults.length > 0 && !loading && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
          gap: '1rem',
          alignItems: 'start'
        }}>
          {searchResults.map((item, index) => (
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
      )}

      {!hasSearched && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: 'var(--text-secondary)'
        }}>
          <p>Search for manhwa to discover new series to add to your library.</p>
        </div>
      )}
      </div>
    </>
  )
}

export default Search